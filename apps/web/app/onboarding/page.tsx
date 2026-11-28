import { redirect } from 'next/navigation';
import { companies, db, eq, members, sequences, users, workspaces } from '@frithly/db';
import { enqueue } from '@/lib/queue';
import { PLANS, SEQ_PRESETS } from '@frithly/core';
import { TzSelect } from '@/app/tz-select';
import { requireUser } from '@/lib/auth';
import { importCompanies } from '@/lib/companies';

const list = (v: FormDataEntryValue | null) => String(v ?? '').split(',').map((x) => x.trim()).filter(Boolean);

async function finish(fd: FormData) {
  'use server';
  const { user, ws } = await requireUser();
  const name = String(fd.get('company') ?? '').trim() || 'My company';
  const profile = {
    offer: String(fd.get('offer') ?? '').trim(),
    proofPoint: String(fd.get('proof') ?? '').trim(),
    titles: list(fd.get('titles')),
    hiringRoles: list(fd.get('hiring')),
    industries: list(fd.get('industries')),
    countries: list(fd.get('countries')),
    sizes: list(fd.get('sizes')),
    keywords: [],
  };
  const sending = {
    signature: `${String(fd.get('name') ?? '').trim()}\n${name}`,
    postalAddress: String(fd.get('address') ?? '').trim(),
    optOutLine: String(fd.get('optout') ?? '').trim() || 'Not relevant? Just reply “no” and I won’t email you again.',
    tz: String(fd.get('tz') ?? 'UTC'),
    days: [1, 2, 3, 4, 5], startHour: 8, endHour: 17,
  };
  if (!profile.offer) redirect('/onboarding?e=Tell+us+what+you+sell');
  await db.update(users).set({ name: String(fd.get('name') ?? '').trim() || null }).where(eq(users.id, user.id));
  let wsId = ws?.id;
  if (!wsId) {
    const [n] = await db.insert(workspaces).values({
      name, ownerId: user.id, plan: 'trial', trialEndsAt: new Date(Date.now() + (PLANS.trial.trialDays ?? 14) * 86_400_000), profile, sending,
    }).returning();
    wsId = n.id;
    await db.insert(members).values({ workspaceId: wsId, userId: user.id, role: 'owner' });
    await db.insert(sequences).values({ workspaceId: wsId, name: SEQ_PRESETS.mix.name, steps: SEQ_PRESETS.mix.steps, isDefault: true });
  } else {
    await db.update(workspaces).set({ name, profile, sending }).where(eq(workspaces.id, wsId));
  }
  const domains = String(fd.get('domains') ?? '');
  if (domains.trim()) {
    await importCompanies(wsId, domains, 'onboarding');
    // Start scanning now so the first list arrives the same day.
    const list = await db.select({ id: companies.id }).from(companies).where(eq(companies.workspaceId, wsId));
    for (const c of list) await enqueue('scan-company', { companyId: c.id }, c.id).catch(() => null);
  }
  await db.update(workspaces).set({ onboardedAt: new Date() }).where(eq(workspaces.id, wsId));
  redirect('/app?welcome=1');
}

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { user, ws } = await requireUser();
  if (ws?.onboardedAt) redirect('/app');
  const sp = await searchParams;
  const p = ws?.profile;
  return (
    <div className="center" style={{ alignItems: 'start' }}>
      <form action={finish} className="authcard stack" style={{ width: 'min(680px,100%)', margin: '40px 0' }}>
        <div className="brand" style={{ padding: 0 }}><img src="/logo.png" alt="" />Frithly</div>
        <h1 style={{ fontSize: 24 }}>Set up your daily list</h1>
        <p className="mut">Takes about two minutes. You can change all of this later in Settings.</p>
        {sp.e && <div className="err">{sp.e}</div>}
        <div className="grid2">
          <label>Your name<input name="name" defaultValue={user.name ?? ''} required /></label>
          <label>Your company<input name="company" defaultValue={ws?.name ?? ''} required /></label>
        </div>
        <label>What do you sell, in one line?<input name="offer" defaultValue={p?.offer} placeholder="Outbound lead lists for B2B SaaS teams" required /></label>
        <label>One proof point (a real result)<input name="proof" defaultValue={p?.proofPoint} placeholder="Helped Northwind book 12 meetings in their first month" /></label>
        <div className="grid2">
          <label>Who do you email? (job titles, comma-separated)<input name="titles" defaultValue={p?.titles.join(', ')} placeholder="Founder, VP Sales, Head of Growth" /></label>
          <label>Hiring for which roles signals a need?<input name="hiring" defaultValue={p?.hiringRoles.join(', ')} placeholder="SDR, Sales, Marketing" /></label>
          <label>Industries<input name="industries" defaultValue={p?.industries.join(', ')} placeholder="SaaS, Fintech" /></label>
          <label>Countries<input name="countries" defaultValue={p?.countries.join(', ')} placeholder="India, United States" /></label>
        </div>
        <label>Companies to watch (one website per line, or paste a CSV: domain,name,industry,size,country)
          <textarea name="domains" placeholder={'acme.io\nnorthwind.com'} />
        </label>
        <h2 style={{ marginTop: 8 }}>Sending details</h2>
        <p className="mut">Anti-spam law needs your business address and an easy way to say no in every email.</p>
        <label>Business postal address<input name="address" defaultValue={ws?.sending?.postalAddress} required /></label>
        <label>Opt-out line<input name="optout" defaultValue={ws?.sending?.optOutLine ?? 'Not relevant? Just reply “no” and I won’t email you again.'} /></label>
        <label>Your time zone
<TzSelect value={ws?.sending?.tz} />
        </label>
        <button className="btn pri lg">Build my list</button>
      </form>
    </div>
  );
}
