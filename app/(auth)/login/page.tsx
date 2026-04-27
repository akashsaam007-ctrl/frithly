import { redirect } from "next/navigation";
import { LoginForm } from "@/components/shared/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { ROUTES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(ROUTES.DASHBOARD);
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-20 md:min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-[440px]">
        <CardContent className="space-y-8 p-8">
          <div className="space-y-5 text-center">
            <Logo className="justify-center" />
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl">Welcome to Frithly</h1>
              <p className="text-muted">Enter your email to receive a login link</p>
            </div>
          </div>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
