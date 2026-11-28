import { describe, expect, it } from 'vitest';
import { allPass, checkEmail, dailyCap, decrypt, emailCandidates, detectPattern, encrypt, inWindow, quickClassify, startsPerDay } from './index';

describe('emailCandidates', () => {
  it('builds common patterns in order', () => {
    const c = emailCandidates('Priya Raman', 'Acme.io').map((x) => x.email);
    expect(c.slice(0, 4)).toEqual(['priya@acme.io', 'priya.raman@acme.io', 'priyaraman@acme.io', 'praman@acme.io']);
  });
  it('puts a known pattern first and strips accents', () => {
    const c = emailCandidates('José Núñez', 'x.com', '{fi}{l}');
    expect(c[0].email).toBe('jnunez@x.com');
  });
  it('skips last-name patterns for single names', () => {
    expect(emailCandidates('Madonna', 'x.com').map((x) => x.email)).toEqual(['madonna@x.com']);
  });
  it('detects pattern', () => {
    expect(detectPattern('p.raman@acme.io', 'Priya Raman')).toBe('{fi}.{l}');
  });
});

describe('checkEmail', () => {
  const good = {
    subject: 'your three sdr roles',
    body: 'Hi Priya,\nSaw Acme is hiring three SDRs this month.\nTeams that hire SDRs before the list is ready usually burn the first quarter on research.\nWe gave Northwind 40 qualified accounts a week.\nWorth a quick look?',
    companyName: 'Acme Inc',
    domain: 'acme.io',
    contactRole: 'VP Sales',
    signalLabel: 'Hiring 3 SDRs',
    emailStatus: 'valid' as const,
    postalAddress: '14 MG Road, Bengaluru',
    optOutLine: 'Reply "no" and I will not email again.',
  };
  it('passes all 11 for a good email', () => {
    const r = checkEmail(good);
    expect(r).toHaveLength(11);
    expect(r.filter((x) => !x.pass).map((x) => x.id)).toEqual([]);
    expect(allPass(r)).toBe(true);
  });
  it('fails compliance without address', () => {
    const r = checkEmail({ ...good, postalAddress: '' });
    expect(r.find((x) => x.id === 'compliance')!.pass).toBe(false);
  });
  it('fails on pitch words, links, placeholders, uppercase subject', () => {
    const r = checkEmail({ ...good, subject: 'Quick Question', body: good.body + '\nOur AI platform at https://x.com [link]' });
    const failed = r.filter((x) => !x.pass).map((x) => x.id);
    expect(failed).toEqual(expect.arrayContaining(['pitch', 'placeholders', 'subject', 'buzz']));
  });
});

describe('schedule', () => {
  it('ramps warm-up from 10 to cap', () => {
    expect(dailyCap(1)).toBe(10);
    expect(dailyCap(21)).toBe(40);
    expect(dailyCap(60)).toBe(40);
    expect(startsPerDay(80)).toBe(16);
  });
  it('respects window', () => {
    const w = { tz: 'Asia/Kolkata', days: [1, 2, 3, 4, 5], startHour: 9, endHour: 17 };
    expect(inWindow(new Date('2026-12-01T05:00:00Z'), w)).toBe(true); // Tue 10:30 IST
    expect(inWindow(new Date('2026-12-05T05:00:00Z'), w)).toBe(false); // Sat
  });
});

describe('crypto and replies', () => {
  it('round-trips', () => {
    process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
    expect(decrypt(encrypt('secret'))).toBe('secret');
  });
  it('classifies quick replies', () => {
    expect(quickClassify('Re: x', 'No\n\nOn Tue...')).toBe('not_interested');
    expect(quickClassify('Automatic reply', 'I am out of office')).toBe('out_of_office');
    expect(quickClassify('Re: x', 'please remove me from your list')).toBe('optout');
    expect(quickClassify('Re: x', 'Sounds interesting, tell me more')).toBe('other');
  });
});
