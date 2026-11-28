import { shellCtx } from '@/lib/ctx';
import { ShellRoot } from '@/components/shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await shellCtx();
  return <ShellRoot ctx={ctx}>{children}</ShellRoot>;
}
