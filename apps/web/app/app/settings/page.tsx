import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, count, db, desc, eq, mailboxes, sequences, suppressions, workspaces } from '@/lib/db';
import { SEQ_PRESETS, dailyCap, encrypt, planLimits, type PlanKey } from '@frithly/core';
import { testSmtpImap } from '@frithly/engine';
import { requireWorkspace } from '@/lib/auth';
import { TzSelect } from '@/app/tz-select';

const PRESETS: Record<string, { smtpHost: string; smtpPort: number; smtpSecure: boolean; imapHost: string; imapPort: number; imapSecure: boolean }> = {
  google: { smtpHost: 'smtp.gmail.com', smtpPort: 465, smtpSecure: true, imapHost: 'imap.gmail.com', imapPort: 993, imapSecure: true },
  zoho: { smtpHost: 'smtp.zoho.in', smtpPort: 465, smtpSecure: true, imapHost: 'imap.zoho.in', imapPort: 993, imapSecure: true },
};

async function saveSending(fd: FormData) {
  'use server';
  const { ws } = await requireWorkspace();
  const days = fd.getAll('days').map(Number).filter((d) => d >= 1 && d <= 7);
  await db.update(workspaces).set({
    sending: {
      signature: String(fd.get('signature') ?? '').trim(),
      postalAddress: String(fd.get('address') ?? '').trim(),
      optOutLine: String(fd.get('optout') ?? '').trim(),
      tz: String(fd.get('tz') ?? 'UTC'),
      days: days.length ? days : [1, 2, 3, 4, 5],
      startHour: Number(fd.get('start') ?? 8),
      endHour: Number(fd.get('end') ?? 17),
    },
  }).where(eq(workspaces.id, ws.id));
  redirect('/app/settings?saved=sending');
}

async function saveSignals(fd: FormData) {
  'use server';
  const { ws } = await requireWorkspace();
  if (!ws.profile) return;
  const n = (k: string, lo: number, hi: number, d: number) => { const v = Number(fd.get(k)); return Number.isFinite(v) && v >= lo && v <= hi ? v : d; };
  await db.update(workspaces).set({
    profile: {
      ...ws.profile,
      competitors: String(fd.get('competitors') ?? '').split(',').map((x) => x.trim()).filter(Boolean),
      hiringRoles: String(fd.get('hiring') ?? '').split(',').map((x) => x.trim()).filter(Boolean),
      gate: {
        minScore: n('minScore', 20, 200, 60), minCategories: n('minCategories', 1, 4, 2), strongSingle: n('strongSingle', 20, 45, 35),
        allowCombos: fd.get('allowCombos') === 'on', allowSingle: fd.get('allowSingle') === 'on',
      },
    },
  }).where(eq(workspaces.id, ws.id));
  redirect('/app/settings?saved=signals');
}

async function addMailbox(fd: FormData) {
  'use server';
  const { ws } = await requireWorkspace();
  const lim = planLimits((ws.plan === 'expired' ? 'trial' : ws.plan) as PlanKey, ws.addons);
  const [{ n }] = await db.select({ n: count() }).from(mailboxes).where(eq(mailboxes.workspaceId, ws.id));
  if (n >= lim.mailboxes) redirect(`/app/settings?e=${encodeURIComponent(`Your plan includes ${lim.mailboxes} mailbox${lim.mailboxes > 1 ? 'es' : ''}. Add one in Plan & billing.`)}`);
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const pass = String(fd.get('password') ?? '');
  const preset = PRESETS[String(fd.get('preset'))];
  const cfg = preset ?? {
    smtpHost: String(fd.get('smtpHost')), smtpPort: Number(fd.get('smtpPort') || 465), smtpSecure: Number(fd.get('smtpPort') || 465) === 465,
    imapHost: String(fd.get('imapHost')), imapPort: Number(fd.get('imapPort') || 993), imapSecure: true,
  };
  const config = { ...cfg, user: String(fd.get('user') || email) };
  try {
    await testSmtpImap(config, pass);
  } catch (e) {
    redirect(`/app/settings?e=${encodeURIComponent((e as Error).message)}`);
  }
  await db.insert(mailboxes).values({ workspaceId: ws.id, email, fromName: String(fd.get('fromName') || '') || null, provider: 'smtp', config, secretEnc: encrypt(pass) })
    .onConflictDoUpdate({ target: [mailboxes.workspaceId, mailboxes.email], set: { config, secretEnc: encrypt(pass), status: 'active', lastError: null } });
  redirect('/app/settings?saved=mailbox');
}

async function mailboxAction(fd: FormData) {
  'use server';
  const { ws } = await requireWorkspace();
  const id = String(fd.get('id')), act = String(fd.get('act'));
  const where = and(eq(mailboxes.id, id), eq(mailboxes.workspaceId, ws.id));
  if (act === 'remove') await db.delete(mailboxes).where(where);
  if (act === 'pause') await db.update(mailboxes).set({ status: 'paused' }).where(where);
  if (act === 'resume') await db.update(mailboxes).set({ status: 'active' }).where(where);
  revalidatePath('/app/settings');
}

async function addDnc(fd: FormData) {
  'use server';
  const { ws } = await requireWorkspace();
  for (const raw of String(fd.get('emails') ?? '').split(/[\s,;]+/)) {
    const v = raw.trim().toLowerCase();
    if (!v) continue;
    const email = v.includes('@') ? v : `@${v.replace(/^@/, '')}`; // a bare domain blocks the whole company
    await db.insert(suppressions).values({ workspaceId: ws.id, email, reason: 'manual' }).onConflictDoNothing();
  }
  revalidatePath('/app/settings');
}

async function removeDnc(fd: FormData) {
  'use server';
  const { ws } = await requireWorkspace();
  await db.delete(suppressions).where(and(eq(suppressions.id, String(fd.get('id'))), eq(suppressions.workspaceId, ws.id)));
  revalidatePath('/app/settings');
}

async function setSequence(fd: FormData) {
  'use server';
  const { ws } = await requireWorkspace();
  const p = SEQ_PRESETS[String(fd.get('preset'))];
  if (!p) return;
  await db.update(sequences).set({ name: p.name, steps: p.steps }).where(and(eq(sequences.workspaceId, ws.id), eq(sequences.isDefault, true)));
  revalidatePath('/app/settings');
}

export default async function Settings({ searchParams }: { searchParams: Promise<{ saved?: string; e?: string }> }) {
  const { ws } = await requireWorkspace();
  const sp = await searchParams;
  const s = ws.sending;
  const mbs = await db.select().from(mailboxes).where(eq(mailboxes.workspaceId, ws.id));
  const dnc = await db.select().from(suppressions).where(eq(suppressions.workspaceId, ws.id)).orderBy(desc(suppressions.createdAt)).limit(200);
  const [seq] = await db.select().from(sequences).where(and(eq(sequences.workspaceId, ws.id), eq(sequences.isDefault, true)));
  const lim = planLimits((ws.plan === 'expired' ? 'trial' : ws.plan) as PlanKey, ws.addons);
  const ms = !!process.env.MS_CLIENT_ID;
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <>
      <div className="head"><h1>Settings</h1></div>
      {sp.e && <div className="err" style={{ marginBottom: 12 }}>{sp.e}</div>}
      {sp.saved && <div className="ok" style={{ marginBottom: 12 }}>Saved.</div>}
      <div className="stack" style={{ gap: 16 }}>
        <section className="card stack">
          <h2>Mailboxes <span className="mut">({mbs.length} of {lim.mailboxes})</span></h2>
          <p className="mut">New mailboxes start at 10 emails a day and ramp up over three weeks. Use a separate sending domain if you can, with SPF, DKIM and DMARC set up.</p>
          {mbs.map((m) => {
            const day = Math.floor((Date.now() - m.warmupStartedAt.getTime()) / 86_400_000) + 1;
            return (
              <form key={m.id} action={mailboxAction} className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                <input type="hidden" name="id" value={m.id} />
                <strong className="sm">{m.email}</strong><span className="pill">{m.provider === 'microsoft' ? 'Microsoft 365' : 'SMTP'}</span>
                <span className={`pill ${m.status === 'active' ? 'g' : 'a'}`}>{m.status}</span>
                <span className="mut">Day {day} · up to {dailyCap(day, m.capMax)}/day</span>
                {m.lastError && <span className="pill r" title={m.lastError}>Error</span>}
                <span className="sp" />
                <button className="btn s" name="act" value={m.status === 'active' ? 'pause' : 'resume'}>{m.status === 'active' ? 'Pause' : 'Resume'}</button>
                <button className="btn gh s" name="act" value="remove">Remove</button>
              </form>
            );
          })}
          {mbs.length < lim.mailboxes && (
            <>
              {ms && <a className="btn" href="/api/mailbox/microsoft/start" style={{ alignSelf: 'start' }}>Connect Microsoft 365 / Outlook</a>}
              <details>
                <summary className="sm" style={{ cursor: 'pointer', fontWeight: 600 }}>Connect with SMTP and IMAP (Google Workspace, Zoho, any provider)</summary>
                <form action={addMailbox} className="stack" style={{ marginTop: 12 }}>
                  <div className="grid2">
                    <label>Email address<input name="email" type="email" required /></label>
                    <label>Name people see<input name="fromName" /></label>
                    <label>Provider<select name="preset" defaultValue="google"><option value="google">Google Workspace (app password)</option><option value="zoho">Zoho Mail</option><option value="custom">Other (enter servers)</option></select></label>
                    <label>App password<input name="password" type="password" required autoComplete="new-password" /></label>
                    <label>SMTP host (Other only)<input name="smtpHost" placeholder="smtp.example.com" /></label>
                    <label>SMTP port<input name="smtpPort" placeholder="465" /></label>
                    <label>IMAP host (Other only)<input name="imapHost" placeholder="imap.example.com" /></label>
                    <label>Login user (if different)<input name="user" /></label>
                  </div>
                  <p className="mut">We test sending and reading before saving. Passwords are encrypted. For Google Workspace, turn on 2-step verification and create an app password.</p>
                  <button className="btn pri" style={{ alignSelf: 'start' }}>Test and connect</button>
                </form>
              </details>
            </>
          )}
        </section>

        <form action={saveSignals} className="card stack">
          <h2>Signals</h2>
          <p className="mut">An account reaches your list in any of three ways: its signals match a known pattern, one signal is strong enough on its own, or its signals add up to the minimum score across enough different kinds. Newer signals count more: full points for 7 days, 65% to day 21, 35% to day 45, then nothing.</p>
          <div className="grid2">
            <label>Competitors to look for in job posts<input name="competitors" defaultValue={ws.profile?.competitors?.join(', ')} placeholder="Salesforce, Outreach, Apollo" /></label>
            <label>Roles that point to a need<input name="hiring" defaultValue={ws.profile?.hiringRoles.join(', ')} placeholder="RevOps, SDR, Data Engineer" /></label>
            <label>Minimum score<input name="minScore" type="number" min={20} max={200} defaultValue={ws.profile?.gate?.minScore ?? 60} /></label>
            <label>Different kinds of signal needed<input name="minCategories" type="number" min={1} max={4} defaultValue={ws.profile?.gate?.minCategories ?? 2} /></label>
            <label>Points for a single signal to count on its own<input name="strongSingle" type="number" min={20} max={45} defaultValue={ws.profile?.gate?.strongSingle ?? 35} /></label>
          </div>
          <div className="row">
            <label style={{ flexDirection: 'row', alignItems: 'center' }}><input type="checkbox" name="allowCombos" defaultChecked={ws.profile?.gate?.allowCombos ?? true} style={{ width: 'auto' }} />Known patterns qualify on their own (e.g. new sales leader + SDR hiring, fresh funding + hiring)</label>
            <label style={{ flexDirection: 'row', alignItems: 'center' }}><input type="checkbox" name="allowSingle" defaultChecked={ws.profile?.gate?.allowSingle ?? true} style={{ width: 'auto' }} />Strong single signals qualify on their own (new leader, competitor in a job post, dropped tool, first hire or migration in the last week)</label>
          </div>
          <p className="mut">Accounts are held back after layoffs, a sharp drop in job openings, if they’re a staffing agency, or for 45 days after you last emailed or skipped them.</p>
          <button className="btn pri" style={{ alignSelf: 'start' }}>Save signal settings</button>
        </form>

        <form action={saveSending} className="card stack">
          <h2>Sending</h2>
          <p className="mut">Every email ends with your signature, your opt-out line and your business address.</p>
          <label>Signature<textarea name="signature" defaultValue={s?.signature} style={{ minHeight: 70 }} /></label>
          <div className="grid2">
            <label>Business postal address<input name="address" defaultValue={s?.postalAddress} required /></label>
            <label>Opt-out line<input name="optout" defaultValue={s?.optOutLine} required /></label>
            <label>Time zone<TzSelect value={s?.tz} /></label>
            <div className="row"><label>From<input name="start" type="number" min={0} max={23} defaultValue={s?.startHour ?? 8} /></label><label>Until<input name="end" type="number" min={1} max={24} defaultValue={s?.endHour ?? 17} /></label></div>
          </div>
          <div className="row">{DAYS.map((d, i) => <label key={d} style={{ flexDirection: 'row', alignItems: 'center' }}><input type="checkbox" name="days" value={i + 1} defaultChecked={(s?.days ?? [1, 2, 3, 4, 5]).includes(i + 1)} style={{ width: 'auto' }} />{d}</label>)}</div>
          <button className="btn pri" style={{ alignSelf: 'start' }}>Save sending details</button>
        </form>

        <section className="card stack">
          <h2>Follow-up sequence</h2>
          <form action={setSequence} className="row">
            <select name="preset" defaultValue={seq?.steps.some((x) => x.channel !== 'email') ? 'mix' : 'email'} style={{ width: 'auto' }}>
              {Object.entries(SEQ_PRESETS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
            <button className="btn s">Use this sequence</button>
          </form>
          <ol className="sm" style={{ paddingLeft: 18 }}>
            {seq?.steps.map((st, i) => <li key={i}><strong>Day {st.day}</strong> · {st.channel.replace('_', ' ')} · <span className="mut">{st.brief}</span></li>)}
          </ol>
          <p className="mut">Follow-ups stop the moment someone replies. LinkedIn steps become tasks you do yourself.</p>
        </section>

        <section className="card stack">
          <h2>Do not contact</h2>
          <p className="mut">People who said no or opted out are added automatically. Opt-outs are also blocked across every Frithly workspace.</p>
          <form action={addDnc} className="row"><input name="emails" placeholder="name@company.com or company.com" style={{ flex: 1 }} /><button className="btn s">Add</button></form>
          <table><tbody>{dnc.map((d) => (
            <tr key={d.id}><td className="sm">{d.email.startsWith('@') ? `Everyone at ${d.email.slice(1)}` : d.email}</td><td className="mut">{d.reason}</td><td><form action={removeDnc}><input type="hidden" name="id" value={d.id} /><button className="btn gh s">Remove</button></form></td></tr>
          ))}</tbody></table>
        </section>
      </div>
    </>
  );
}
