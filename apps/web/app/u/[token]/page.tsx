import { db, eq, enrollments } from '@/lib/db';
import { unsubscribe } from './action';

export default async function Unsub({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ done?: string }> }) {
  const { token } = await params;
  const sp = await searchParams;
  const [e] = await db.select({ id: enrollments.id }).from(enrollments).where(eq(enrollments.unsubToken, token));
  return (
    <div className="center">
      <div className="authcard stack">
        {sp.done ? (
          <><h1 style={{ fontSize: 22 }}>You’re unsubscribed</h1><p className="mut">You won’t get any more emails from this sender, or from anyone else using Frithly.</p></>
        ) : e ? (
          <form action={unsubscribe} className="stack">
            <input type="hidden" name="token" value={token} />
            <h1 style={{ fontSize: 22 }}>Stop these emails?</h1>
            <p className="mut">One click and you won’t hear from this sender again.</p>
            <button className="btn pri lg">Unsubscribe</button>
          </form>
        ) : (
          <><h1 style={{ fontSize: 22 }}>Link not found</h1><p className="mut">Reply “unsubscribe” to the email and the sender will be stopped automatically.</p></>
        )}
      </div>
    </div>
  );
}
