import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPostLoginRoute, getUserRoleByEmail } from "@/lib/auth/admin-access";
import { ensureCustomerRecordForUser } from "@/lib/auth/customer-provisioning";
import { LoginForm } from "@/components/shared/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { BrandMark, Logo } from "@/components/ui/logo";
import { buildPublicMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/utils/mode";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = buildPublicMetadata({
  description: "Sign in to your Frithly account.",
  noIndex: true,
  path: "/login",
  title: "Login | Frithly",
});

type LoginPageProps = {
  searchParams?: Promise<{
    auth?: string | string[] | undefined;
    email?: string | string[] | undefined;
    next?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function isSafeNextPath(value: string) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const authMode = readParam(resolvedSearchParams?.auth);
  const initialEmail = readParam(resolvedSearchParams?.email);
  const nextPath = readParam(resolvedSearchParams?.next);
  const forceGoogleCheckoutAuth =
    authMode === "google" && nextPath.startsWith("/checkout/");

  if (!isDemoMode) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email && !forceGoogleCheckoutAuth) {
      await ensureCustomerRecordForUser(user);
      const role = await getUserRoleByEmail(user.email);

      if (isSafeNextPath(nextPath)) {
        if (nextPath.startsWith(ROUTES.ADMIN) && role !== "admin") {
          redirect(await getPostLoginRoute(user.email));
        }

        redirect(nextPath);
      }

      redirect(await getPostLoginRoute(user.email));
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-20 md:min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-[440px]">
        <CardContent className="space-y-8 p-8">
          <div className="space-y-5 text-center">
            <div className="flex flex-col items-center gap-4">
              <BrandMark className="h-16 w-16 rounded-[1.4rem]" imageClassName="h-full w-full" />
              <Logo className="justify-center" imageClassName="h-10 md:h-11" />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl">Welcome to Frithly</h1>
              <p className="text-muted">
                {isDemoMode
                  ? "Open the customer or admin preview locally."
                  : forceGoogleCheckoutAuth
                    ? "Continue with Google to unlock your secure checkout, then we'll take you straight to payment."
                  : nextPath.startsWith("/checkout/")
                    ? "Continue with Google or email to unlock your secure checkout, then we'll take you straight to payment."
                  : nextPath === "/billing"
                    ? "Use the same email you used during checkout and we'll send a login link to open billing."
                  : initialEmail
                    ? "Use the same email you used during checkout and we'll send a login link."
                    : "Enter your email to receive a login link"}
              </p>
            </div>
          </div>
          <LoginForm
            initialEmail={initialEmail}
            nextPath={nextPath}
            preferredAuth={forceGoogleCheckoutAuth ? "google" : undefined}
          />
        </CardContent>
      </Card>
    </main>
  );
}
