import type { Metadata } from "next";
import { IdentifyUser } from "@/components/analytics/identify-user";
import { AdminShell } from "@/components/admin/admin-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  robots: {
    follow: false,
    googleBot: {
      follow: false,
      index: false,
      noimageindex: true,
    },
    index: false,
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AdminShell>
      {user?.id ? (
        <IdentifyUser distinctId={user.id} email={user.email ?? null} type="admin" />
      ) : null}
      {children}
    </AdminShell>
  );
}
