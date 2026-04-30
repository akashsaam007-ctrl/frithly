import { NextResponse, type NextRequest } from "next/server";
import { getPostLoginRoute, getUserRoleByEmail } from "@/lib/auth/admin-access";
import { ensureCustomerRecordForUser } from "@/lib/auth/customer-provisioning";
import { ROUTES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isSafeNextPath(value: string | null) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

function buildLoginRedirect(request: NextRequest, nextPath: string | null) {
  const loginUrl = new URL(ROUTES.LOGIN, request.url);

  if (isSafeNextPath(nextPath)) {
    loginUrl.searchParams.set("next", nextPath!);
  }

  loginUrl.searchParams.set("auth", "google");
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = requestUrl.searchParams.get("next");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (errorDescription || !code) {
    return buildLoginRedirect(request, nextPath);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return buildLoginRedirect(request, nextPath);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let destination: string = ROUTES.DASHBOARD;
  let userRole: "admin" | "customer" = "customer";

  if (user?.email) {
    await ensureCustomerRecordForUser(user);
    userRole = await getUserRoleByEmail(user.email);
    destination = await getPostLoginRoute(user.email);
  }

  if (isSafeNextPath(nextPath)) {
    if (nextPath!.startsWith(ROUTES.ADMIN) && userRole !== "admin") {
      return NextResponse.redirect(new URL(destination, request.url));
    }

    return NextResponse.redirect(new URL(nextPath!, request.url));
  }
  return NextResponse.redirect(new URL(destination, request.url));
}
