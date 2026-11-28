'use server';
import { redirect } from 'next/navigation';
import { unsubscribeToken } from '@/lib/unsub';

export async function unsubscribe(fd: FormData) {
  const t = String(fd.get('token') ?? '');
  await unsubscribeToken(t);
  redirect(`/u/${encodeURIComponent(t)}?done=1`);
}
