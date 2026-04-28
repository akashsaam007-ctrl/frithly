import { redirect } from "next/navigation";
import { getPostLoginRoute } from "@/lib/auth/admin-access";
import { LoginForm } from "@/components/shared/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/utils/mode";

type LoginPageProps = {
  searchParams?: Promise<{
    email?: string | string[] | undefined;
    next?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialEmail = readParam(resolvedSearchParams?.email);
  const nextPath = readParam(resolvedSearchParams?.next);

  if (!isDemoMode) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      redirect(getPostLoginRoute(user.email));
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-20 md:min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-[440px]">
        <CardContent className="space-y-8 p-8">
          <div className="space-y-5 text-center">
            <Logo className="justify-center" />
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl">Welcome to Frithly</h1>
              <p className="text-muted">
                {isDemoMode
                  ? "Open the customer or admin preview locally."
                  : nextPath === "/billing"
                    ? "Use the same email you used during checkout and we'll send a login link to open billing."
                  : initialEmail
                    ? "Use the same email you used during checkout and we'll send a login link."
                    : "Enter your email to receive a login link"}
              </p>
            </div>
          </div>
          <LoginForm initialEmail={initialEmail} nextPath={nextPath} />
        </CardContent>
      </Card>
    </main>
  );
}
