import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

type VerifyPageProps = {
  searchParams?: Promise<{
    code?: string | string[] | undefined;
    error_description?: string | string[] | undefined;
    next?: string | string[] | undefined;
    token_hash?: string | string[] | undefined;
    type?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function isSafeNextPath(value: string) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const code = readParam(resolvedSearchParams?.code);
  const errorDescription = readParam(resolvedSearchParams?.error_description);
  const nextPath = readParam(resolvedSearchParams?.next);

  if (code || errorDescription) {
    const callbackParams = new URLSearchParams();

    if (code) {
      callbackParams.set("code", code);
    }

    if (errorDescription) {
      callbackParams.set("error_description", errorDescription);
    }

    if (isSafeNextPath(nextPath)) {
      callbackParams.set("next", nextPath);
    }

    redirect(
      callbackParams.toString()
        ? `/auth/callback?${callbackParams.toString()}`
        : "/auth/callback",
    );
  }

  const loginParams = new URLSearchParams();
  loginParams.set("auth", "google");

  if (isSafeNextPath(nextPath)) {
    loginParams.set("next", nextPath);
  }

  const loginHref = `${ROUTES.LOGIN}?${loginParams.toString()}`;

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <Card className="w-full max-w-[560px]">
        <CardContent className="space-y-6 p-8 text-center">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
              Sign-in updated
            </p>
            <h1 className="text-4xl md:text-5xl">Email magic links are retired.</h1>
            <p className="text-muted">
              Frithly now uses Google sign-in only. Continue with the Google account tied to your
              workspace and we&apos;ll route you to the correct customer or admin experience.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link className="btn-primary" href={loginHref}>
              Continue with Google
            </Link>
            <Link className="btn-secondary" href={ROUTES.HOME}>
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
