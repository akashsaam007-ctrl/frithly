import 'server-only';
import { contacts, db, enrollments, eq, opportunities, suppressions } from '@/lib/db';

/** Stop the sequence and add the recipient to both the workspace list and the global list. */
export async function unsubscribeToken(token: string) {
  const [r] = await db
    .select({ e: enrollments, ct: contacts })
    .from(enrollments)
    .innerJoin(opportunities, eq(opportunities.id, enrollments.opportunityId))
    .leftJoin(contacts, eq(contacts.id, opportunities.contactId))
    .where(eq(enrollments.unsubToken, token));
  if (!r) return false;
  await db.update(enrollments).set({ status: 'stopped', stoppedReason: 'unsubscribed', nextRunAt: null }).where(eq(enrollments.id, r.e.id));
  await db.update(opportunities).set({ status: 'lost' }).where(eq(opportunities.id, r.e.opportunityId));
  const email = r.ct?.email?.toLowerCase();
  if (email) {
    await db.insert(suppressions).values({ workspaceId: r.e.workspaceId, email, reason: 'optout' }).onConflictDoNothing();
    await db.insert(suppressions).values({ workspaceId: null, email, reason: 'optout' }).onConflictDoNothing();
  }
  return true;
}
