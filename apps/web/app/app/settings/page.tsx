import { and, db, desc, eq, invites, isNull, members, suppressions, users } from '@/lib/db';
import { planLimits } from '@frithly/core';
import { requireWorkspace } from '@/lib/auth';
import { planKey } from '@/lib/ctx';
import { SettingsView } from './view';

export default async function Settings({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { user, ws } = await requireWorkspace();
  const sp = await searchParams;
  const [dnc, team, inv] = await Promise.all([
    db.select().from(suppressions).where(eq(suppressions.workspaceId, ws.id)).orderBy(desc(suppressions.createdAt)).limit(500),
    db.select({ u: users, r: members.role }).from(members).innerJoin(users, eq(users.id, members.userId)).where(eq(members.workspaceId, ws.id)),
    db.select().from(invites).where(and(eq(invites.workspaceId, ws.id), isNull(invites.acceptedAt))),
  ]);
  const owner = await db.select().from(users).where(eq(users.id, ws.ownerId));
  return <SettingsView tab={sp.tab ?? 'profile'} me={user.id} ownerId={ws.ownerId} seats={planLimits(planKey(ws), ws.addons).seats}
    ws={{ name: ws.name, website: ws.website ?? '', profile: ws.profile, sending: ws.sending, unwatched: ws.prefs?.unwatched ?? [], sender: owner[0]?.name ?? '' }}
    dnc={dnc.map((d) => ({ id: d.id, email: d.email, reason: d.reason, at: d.createdAt.toISOString() }))}
    team={team.map((t) => ({ id: t.u.id, name: t.u.name ?? t.u.email.split('@')[0], email: t.u.email, role: t.u.id === ws.ownerId ? 'Owner' : t.r === 'owner' ? 'Owner' : 'Member' }))}
    invites={inv.map((i) => ({ id: i.id, email: i.email }))} />;
}
