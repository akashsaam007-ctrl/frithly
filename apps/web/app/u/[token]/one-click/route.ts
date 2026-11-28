import { unsubscribeToken } from '@/lib/unsub';

/** RFC 8058 one-click unsubscribe (Gmail and Yahoo POST here from the List-Unsubscribe header). */
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  await unsubscribeToken((await params).token);
  return new Response('Unsubscribed', { status: 200 });
}

/** Someone clicking the header link in a mail client lands on the confirmation page. */
export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  return Response.redirect(new URL(`/u/${encodeURIComponent((await params).token)}`, req.url), 303);
}
