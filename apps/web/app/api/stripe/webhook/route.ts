import { db, stripeEvents } from '@/lib/db';
import { stripe, syncSubscription } from '@/lib/billing';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') ?? '';
  let ev;
  try {
    ev = stripe().webhooks.constructEvent(await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch {
    return new Response('Bad signature', { status: 400 });
  }
  // Idempotent: Stripe retries, so each event is handled once.
  const [fresh] = await db.insert(stripeEvents).values({ id: ev.id, type: ev.type }).onConflictDoNothing().returning();
  if (!fresh) return Response.json({ ok: true, duplicate: true });
  switch (ev.type) {
    case 'checkout.session.completed': {
      const s = ev.data.object;
      if (s.subscription) await syncSubscription(await stripe().subscriptions.retrieve(String(s.subscription)));
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await syncSubscription(ev.data.object);
      break;
  }
  return Response.json({ ok: true });
}
