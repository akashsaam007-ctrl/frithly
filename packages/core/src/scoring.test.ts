import { describe, expect, it } from 'vitest';
import { classifyNews, classifySubdomain, decay, evaluate, headcountDrop, isRepost, jobSignals, mxProvider, personaFor, txtVendors } from './scoring';

const now = new Date('2026-12-01T00:00:00Z');
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

describe('decay', () => {
  it('steps by age', () => {
    expect([decay(daysAgo(3), now), decay(daysAgo(10), now), decay(daysAgo(30), now), decay(daysAgo(50), now)]).toEqual([1, 0.65, 0.35, 0]);
  });
});

describe('evaluate', () => {
  it('needs score ≥ 60 and two categories', () => {
    const one = evaluate([{ subtype: 'TECH_REMOVAL', eventDate: daysAgo(1), verified: true }, { subtype: 'TECH_ADOPTION', eventDate: daysAgo(1), verified: true }], { now });
    expect(one.score).toBe(65);
    expect(one.categories).toEqual(['TECH_SHIFT']);
    expect(one.promote).toBe(false);
    const two = evaluate([{ subtype: 'NEW_LEADER', eventDate: daysAgo(2), verified: true }, { subtype: 'FUNDING', eventDate: daysAgo(12), verified: true }], { now });
    expect(two.score).toBe(40 + 16);
    expect(two.promote).toBe(false);
    const three = evaluate([{ subtype: 'NEW_LEADER', eventDate: daysAgo(2), verified: true }, { subtype: 'FUNDING', eventDate: daysAgo(5), verified: true }], { now });
    expect(three.promote).toBe(true);
  });
  it('ignores unset gate overrides', () => {
    const s = [{ subtype: 'NEW_LEADER' as const, eventDate: daysAgo(1), verified: true }, { subtype: 'FUNDING' as const, eventDate: daysAgo(1), verified: true }];
    expect(evaluate(s, { now, gate: { minScore: undefined, minCategories: undefined } }).promote).toBe(true);
    expect(evaluate(s, { now, gate: { minScore: 80 } }).promote).toBe(false);
  });
  it('ignores unverified and expired signals, counts each subtype once', () => {
    const e = evaluate([
      { subtype: 'MIGRATION', eventDate: daysAgo(1), verified: null },
      { subtype: 'STALE_ROLE', eventDate: daysAgo(1), verified: true },
      { subtype: 'STALE_ROLE', eventDate: daysAgo(2), verified: true },
      { subtype: 'FUNDING', eventDate: daysAgo(60), verified: true },
    ], { now });
    expect(e.score).toBe(30);
  });
  it('suppresses on layoffs and cooldown', () => {
    const s = [{ subtype: 'NEW_LEADER' as const, eventDate: daysAgo(1), verified: true }, { subtype: 'FUNDING' as const, eventDate: daysAgo(1), verified: true }];
    expect(evaluate([...s, { subtype: 'LAYOFF', eventDate: daysAgo(3), verified: true }], { now }).suppressed).toBe('Layoffs or restructuring');
    expect(evaluate(s, { now, cooldownUntil: daysAgo(-5) }).promote).toBe(false);
    expect(evaluate(s, { now, cooldownUntil: daysAgo(5) }).promote).toBe(true);
  });
  it('routes the sales buildout combo', () => {
    const e = evaluate([
      { subtype: 'NEW_LEADER', eventDate: daysAgo(1), verified: true, meta: { title: 'Acme appoints Jane Doe as VP Sales' } },
      { subtype: 'ROLE_MATCH', eventDate: daysAgo(1), verified: true, meta: { title: 'SDR' } },
      { subtype: 'FIRST_IN_FUNCTION', eventDate: daysAgo(1), verified: true, meta: { title: 'Founding RevOps lead' } },
    ], { now });
    expect(e.combo?.key).toBe('sales_buildout');
    expect(personaFor(e)).toContain('VP Sales');
  });
});

describe('job rules', () => {
  it('finds competitor, migration, first-in-function and stale roles', () => {
    const c = jobSignals(
      { id: '1', title: 'Founding RevOps Manager', text: 'You will own our CRM. 3+ years administering Salesforce. We are migrating from HubSpot this year.', firstSeen: daysAgo(50) },
      { competitors: ['Salesforce'], roles: [], now },
    ).map((x) => x.subtype);
    expect(c).toEqual(expect.arrayContaining(['COMPETITOR_IN_JOB', 'MIGRATION', 'FIRST_IN_FUNCTION', 'STALE_ROLE']));
  });
  it('detects reposts and headcount drops', () => {
    expect(isRepost('Senior RevOps Analyst', [{ title: 'RevOps Analyst II', closedAt: daysAgo(5) }], now)).toBeTruthy();
    expect(isRepost('Product Designer', [{ title: 'RevOps Analyst', closedAt: daysAgo(5) }], now)).toBeNull();
    expect(headcountDrop([{ count: 20, at: daysAgo(10) }], 10, now)).toEqual({ peak: 20, current: 10 });
    expect(headcountDrop([{ count: 20, at: daysAgo(10) }], 15, now)).toBeNull();
  });
});

describe('infra and news rules', () => {
  it('classifies subdomains', () => {
    expect(classifySubdomain('sso.acme.io', 'acme.io')).toBe('SSO_SUBDOMAIN');
    expect(classifySubdomain('status.acme.io', 'acme.io')).toBe('TRUST_SUBDOMAIN');
    expect(classifySubdomain('docs.acme.io', 'acme.io')).toBe('DEV_SUBDOMAIN');
    expect(classifySubdomain('eu.app.acme.io', 'acme.io')).toBe('REGIONAL');
    expect(classifySubdomain('www.acme.io', 'acme.io')).toBeNull();
    expect(classifySubdomain('cdn.acme.io', 'acme.io')).toBeNull();
  });
  it('reads TXT vendors and MX providers', () => {
    expect(txtVendors(['hubspot-developer-verification=abc', 'v=spf1 include:_spf.google.com ~all', 'okta-verification=x'])).toEqual(['HubSpot', 'Okta']);
    expect(mxProvider(['acme-io.mail.protection.outlook.com'])).toBe('Microsoft 365');
    expect(mxProvider(['eu-smtp-inbound-1.mimecast.com'])).toBe('Mimecast');
  });
  it('classifies news', () => {
    expect(classifyNews('Acme appoints Jane Doe as Chief Revenue Officer', 'leadership')).toBe('NEW_LEADER');
    expect(classifyNews('Acme achieves SOC 2 Type II', 'compliance')).toBe('COMPLIANCE');
    expect(classifyNews('Acme raises $12M Series A', 'expansion')).toBe('FUNDING');
    expect(classifyNews('Acme expands to Europe with London office', 'expansion')).toBe('REGIONAL');
    expect(classifyNews('Acme lays off 20% of staff', 'layoff')).toBe('LAYOFF');
  });
});
