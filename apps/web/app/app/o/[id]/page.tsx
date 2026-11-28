import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { and, companies, contacts, db, desc, drafts, enrollments, eq, gte, mailboxes, opportunities, signals, users } from '@/lib/db';
import { PROMOTED_LABEL, SUBTYPES, allPass, checkEmail, decay, footer as makeFooter, type Subtype } from '@frithly/core';
import { writeEmail } from '@frithly/engine';
import { requireWorkspace, type WS } from '@/lib/auth';
import { enqueue } from '@/lib/queue';
import { EmailBadge } from '../../ui';
import { Editor } from './editor';

async function load(ws: WS, id: string) {
  const [r] = await db
    .select({ o: opportunities, c: companies, ct: contacts, s: signals })
    .from(opportunities)
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .leftJoin(contacts, eq(contacts.id, opportunities.contactId))
    .leftJoin(signals, eq(signals.id, opportunities.signalId))
    .where(and(eq(opportunities.id, id), eq(opportunities.workspaceId, ws.id)));
  return r;
}

const baseFor = (ws: WS, r: NonNullable<Awaited<ReturnType<typeof load>>>) => ({
  companyName: r.c.name, domain: r.c.domain, contactRole: r.ct?.role ?? null, signalLabel: r.s?.label ?? null,
  emailStatus: r.ct?.emailStatus ?? 'none', signature: ws.sending?.signature, postalAddress: ws.sending?.postalAddress, optOutLine: ws.sending?.optOutLine,
});

async function upsertDraft(oppId: string, subject: string, body: string, approved = false) {
  await db.insert(drafts).values({ opportunityId: oppId, stepIndex: 0, subject, body, approvedAt: approved ? new Date() : null })
    .onConflictDoUpdate({ target: [drafts.opportunityId, drafts.stepIndex], set: { subject, body, ...(approved ? { approvedAt: new Date() } : {}) } });
}

export default async function Opp({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { ws } = await requireWorkspace();
  const r = await load(ws, id);
  if (!r) notFound();
  const [d] = await db.select().from(drafts).where(and(eq(drafts.opportunityId, id), eq(drafts.stepIndex, 0)));
  const [enr] = await db.select().from(enrollments).where(eq(enrollments.opportunityId, id));
  const stack = (await db.select().from(signals)
    .where(and(eq(signals.companyId, r.c.id), gte(signals.eventDate, new Date(Date.now() - 45 * 86_400_000))))
    .orderBy(desc(signals.eventDate)))
    .filter((x) => x.subtype)
    .map((x) => ({ ...x, points: x.verified && x.category !== 'DISQUALIFIER' ? Math.round((x.baseWeight ?? 0) * decay(x.eventDate!)) : 0 }));
  // What counts: the strongest instance of each kind (and any disqualifier). Everything else is folded away.
  const best = new Map<string, (typeof stack)[number]>();
  for (const x of stack) if (x.points > 0 && (!best.has(x.subtype!) || x.points > best.get(x.subtype!)!.points)) best.set(x.subtype!, x);
  const counted = [...best.values(), ...stack.filter((x) => x.category === 'DISQUALIFIER' && x.verified)].sort((a, b) => b.points - a.points);
  const other = stack.filter((x) => !counted.includes(x));
  const [mb] = await db.select({ id: mailboxes.id }).from(mailboxes).where(eq(mailboxes.workspaceId, ws.id)).limit(1);
  const s = ws.sending;

  async function save(fd: FormData) {
    'use server';
    const { ws } = await requireWorkspace();
    if (!(await load(ws, id))) return;
    await upsertDraft(id, String(fd.get('subject') ?? ''), String(fd.get('body') ?? ''));
    revalidatePath(`/app/o/${id}`);
  }
  async function approve(fd: FormData) {
    'use server';
    const { ws } = await requireWorkspace();
    const r = await load(ws, id);
    if (!r || !['new', 'saved'].includes(r.o.status)) return;
    if (ws.plan === 'expired') redirect('/app/billing');
    const subject = String(fd.get('subject') ?? ''), body = String(fd.get('body') ?? '');
    if (!allPass(checkEmail({ ...baseFor(ws, r), subject, body }))) return; // the button is disabled; this is the server-side guard
    await upsertDraft(id, subject, body, true);
    await db.update(opportunities).set({ status: 'approved' }).where(eq(opportunities.id, id));
    redirect('/app?approved=1');
  }
  async function regenerate() {
    'use server';
    const { user, ws } = await requireWorkspace();
    const r = await load(ws, id);
    if (!r || !r.ct || !ws.profile) return;
    const [owner] = await db.select().from(users).where(eq(users.id, ws.ownerId));
    const w = await writeEmail({
      senderName: owner?.name ?? user.name ?? ws.name, senderCompany: ws.name, offer: ws.profile.offer, proofPoint: ws.profile.proofPoint,
      company: { name: r.c.name, domain: r.c.domain, industry: r.c.industry }, contact: { name: r.ct.name, role: r.ct.role },
      signal: { type: r.s?.type ?? 'import', label: r.s?.label ?? '', detail: r.s?.evidence ?? r.s?.detail },
      hypothesis: r.o.hypothesis, angle: r.o.angle, step: { index: 0, brief: 'Signal, what it usually causes, proof, one easy question' },
    }, baseFor(ws, r));
    if (w.subject) await upsertDraft(id, w.subject, w.body);
    revalidatePath(`/app/o/${id}`);
  }
  async function setStatus(fd: FormData) {
    'use server';
    const { ws } = await requireWorkspace();
    const st = String(fd.get('status')) as 'saved' | 'skipped' | 'new';
    if (!['saved', 'skipped', 'new'].includes(st)) return;
    const [o] = await db.update(opportunities).set({ status: st }).where(and(eq(opportunities.id, id), eq(opportunities.workspaceId, ws.id))).returning();
    if (st === 'skipped') {
      // Skipped accounts come back only after 45 days, and only with a fresh stack of signals.
      if (o) await db.update(companies).set({ cooldownUntil: new Date(Date.now() + 45 * 86_400_000) }).where(eq(companies.id, o.companyId));
      redirect('/app');
    }
    revalidatePath(`/app/o/${id}`);
  }
  async function findAgain() {
    'use server';
    const { ws } = await requireWorkspace();
    if (!(await load(ws, id))) return;
    await db.update(opportunities).set({ contactId: null }).where(eq(opportunities.id, id));
    await enqueue('enrich-opportunity', { oppId: id }, `${id}:${Date.now()}`);
    revalidatePath(`/app/o/${id}`);
  }

  const { o, c, ct } = r;
  return (
    <>
      <div className="head">
        <div>
          <Link href="/app" className="mut">← Today</Link>
          <h1>{c.name}</h1>
          <p className="mut"><a href={`https://${c.domain}`} target="_blank" rel="noreferrer">{c.domain}</a>{c.industry ? ` · ${c.industry}` : ''}{c.country ? ` · ${c.country}` : ''}</p>
        </div>
        <span className="sp" />
        {['new', 'saved'].includes(o.status) && (
          <div className="row">
            <form action={setStatus}><input type="hidden" name="status" value={o.status === 'saved' ? 'new' : 'saved'} /><button className="btn s">{o.status === 'saved' ? 'Unsave' : 'Save for later'}</button></form>
            <form action={setStatus}><input type="hidden" name="status" value="skipped" /><button className="btn gh s">Skip</button></form>
          </div>
        )}
      </div>

      <div className="grid2" style={{ marginBottom: 16 }}>
        <div className="card stack">
          <div className="row"><span className="mut">Why now</span><span className="sp" /><span className="score">{o.score} pts</span><span className="pill v">{o.activeSignals} signal{o.activeSignals === 1 ? '' : 's'}</span>{o.promotedBy && <span className="pill g">{PROMOTED_LABEL[o.promotedBy as keyof typeof PROMOTED_LABEL]}</span>}</div>
          {o.combo && <strong className="sm">{o.combo}</strong>}
          {o.hypothesis && <p className="sm">{o.hypothesis}</p>}
          {o.angle && <p className="mut">Angle: {o.angle}</p>}
          <table className="sm">
            <tbody>
              {counted.map((x) => (
                <tr key={x.id}>
                  <td><span className={`pill ${x.category === 'DISQUALIFIER' ? 'r' : ''}`}>{SUBTYPES[x.subtype as Subtype]?.label ?? x.label}</span></td>
                  <td>{x.url ? <a href={x.url} target="_blank" rel="noreferrer">{x.evidence}</a> : x.evidence}<div className="mut">{x.eventDate!.toDateString()}</div></td>
                  <td className="num">{x.points ? `+${x.points}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {other.length > 0 && (
            <details className="sm">
              <summary className="mut" style={{ cursor: 'pointer' }}>{other.length} more: duplicates, expired, still being checked or rejected</summary>
              <ul className="stack" style={{ paddingLeft: 16, marginTop: 8, gap: 6 }}>
                {other.map((x) => (
                  <li key={x.id} className="mut">{SUBTYPES[x.subtype as Subtype]?.label ?? x.label}: {x.evidence} ({x.eventDate!.toDateString()}{x.verified === null ? ', checking' : x.verified === false ? ', rejected as a false positive' : x.points === 0 ? ', too old to count' : ', duplicate'})</li>
                ))}
              </ul>
            </details>
          )}
        </div>
        <div className="card stack">
          <span className="mut">Who to email{o.persona ? ` · problem owner: ${o.persona}` : ''}</span>
          {ct ? (
            <>
              <h3>{ct.name}</h3>
              <p className="sm">{ct.role}</p>
              <div className="row"><span className="sm">{ct.email ?? 'No email yet'}</span><EmailBadge status={ct.emailStatus} /></div>
              {ct.linkedinUrl && <a className="sm" href={ct.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn profile</a>}
            </>
          ) : <p className="mut">Looking for the right person. This usually takes a few minutes.</p>}
          <form><button className="btn s" formAction={findAgain}>Find again</button></form>
        </div>
      </div>

      {!s?.postalAddress && <div className="err" style={{ marginBottom: 12 }}>Add your postal address and opt-out line in <Link href="/app/settings">Settings</Link> before approving.</div>}
      {!mb && <div className="ok" style={{ marginBottom: 12 }}>You can approve now. Emails wait until you <Link href="/app/settings">connect a mailbox</Link>.</div>}
      {enr && <div className="ok" style={{ marginBottom: 12 }}>Outreach: step {enr.stepIndex + 1} · {enr.status}{enr.stoppedReason ? ` (${enr.stoppedReason})` : ''}</div>}

      {d || ct ? (
        <Editor
          subject={d?.subject ?? ''}
          body={d?.body ?? ''}
          base={baseFor(ws, r)}
          footer={makeFooter(s?.signature ?? '', s?.postalAddress ?? '', s?.optOutLine ?? '')}
          save={save}
          approve={approve}
          regenerate={regenerate}
          approved={!!d?.approvedAt}
        />
      ) : <div className="card mut">The first email is written once we find the right person.</div>}
    </>
  );
}
