import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { Onboarding } from './view';

export default async function Page() {
  const { user, ws } = await requireUser();
  if (ws?.onboardedAt) redirect('/app');
  const p = ws?.profile, s = ws?.sending;
  return <Onboarding microsoft={!!process.env.MS_CLIENT_ID} initial={{
    site: ws?.website ?? user.email.split('@')[1] ?? '', name: user.name ?? '', company: ws?.name ?? '', sells: p?.offer ?? '', proof: p?.proofPoint ?? '',
    industries: p?.industries ?? [], sizes: p?.sizes ?? [], countries: p?.countries ?? [], titles: p?.titles.join(', ') ?? '', roles: p?.hiringRoles.join(', ') ?? '',
    watch: ['LEADERSHIP', 'HIRING_PAIN', 'COMPETITOR_PAIN', 'TECH_SHIFT', 'UPMARKET_PREP', 'EXPANSION'], competitors: p?.competitors?.join(', ') ?? '', companies: '',
    address: s?.postalAddress ?? '', optout: s?.optOutLine ?? 'Not relevant? Just reply “no” and I won’t email you again.', tz: s?.tz ?? '',
  }} />;
}
