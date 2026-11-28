import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { and, companies, contacts, db, drafts, enrollments, eq, mailboxes, opportunities, signals, users } from '@/lib/db';
import { allPass, checkEmail, footer as makeFooter } from '@frithly/core';
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
      signal: { type: r.s?.type ?? 'import', label: r.s?.label ?? '', detail: r.s?.detail }, step: { index: 0, brief: 'Signal, what it usually causes, proof, one easy question' },
    }, baseFor(ws, r));
    if (w.subject) await upsertDraft(id, w.subject, w.body);
    revalidatePath(`/app/o/${id}`);
  }
  async function setStatus(fd: FormData) {
    'use server';
    const { ws } = await requireWorkspace();
    const st = String(fd.get('status')) as 'saved' | 'skipped' | 'new';
    if (!['saved', 'skipped', 'new'].includes(st)) return;
    await db.update(opportunities).set({ status: st }).where(and(eq(opportunities.id, id), eq(opportunities.workspaceId, ws.id)));
    if (st === 'skipped') redirect('/app');
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
          <span className="mut">Why now</span>
          <h3>{r.s?.label ?? 'No signal'}</h3>
          {r.s?.detail && <p className="sm">{r.s.detail}</p>}
          {r.s?.url && <a className="sm" href={r.s.url} target="_blank" rel="noreferrer">Source</a>}
        </div>
        <div className="card stack">
          <span className="mut">Who to email</span>
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
