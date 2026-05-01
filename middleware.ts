import { NextResponse, type NextRequest } from "next/server";
import { getBootstrapRoleForEmail, isMissingCustomerRoleColumnError } from "@/lib/auth/admin-access";
import { hasCustomerWorkspaceAccess } from "@/lib/auth/customer-access";
import { ROUTES } from "@/lib/constants";
import { copyResponseCookies, updateSession } from "@/lib/supabase/middleware";
import { isDemoMode } from "@/lib/utils/mode";

const PROTECTED_CUSTOMER_ROUTES = [
  ROUTES.ACCOUNT,
  ROUTES.DASHBOARD,
  ROUTES.BRIEFS,
  ROUTES.ICP,
  ROUTES.BILLING,
  "/help",
];
const PLAN_REQUIRED_CUSTOMER_ROUTES = [ROUTES.BRIEFS, ROUTES.ICP];
const PROTECTED_ADMIN_ROUTES = [ROUTES.ADMIN];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isOauthCallbackOnHome =
    path === ROUTES.HOME &&
    (request.nextUrl.searchParams.has("code") ||
      request.nextUrl.searchParams.has("token_hash") ||
      request.nextUrl.searchParams.has("error_description") ||
      request.nextUrl.searchParams.has("type"));

  if (isOauthCallbackOnHome) {
    const verifyUrl = new URL("/verify", request.url);
    verifyUrl.search = request.nextUrl.search;

    return NextResponse.redirect(verifyUrl);
  }

  const demoMode = isDemoMode;

  if (demoMode) {
    return NextResponse.next();
  }

  const { response, supabase, user } = await updateSession(request);

  if (PROTECTED_CUSTOMER_ROUTES.some((route) => path.startsWith(route))) {
    if (!user) {
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set("next", `${path}${request.nextUrl.search}`);

      return copyResponseCookies(
        NextResponse.redirect(loginUrl),
        response,
      );
    }

    const email = user.email?.trim().toLowerCase();
    let customerRecord:
      | {
          plan: "design_partner" | "growth" | "scale" | "starter" | null;
          role: "admin" | "customer";
          status: "active" | "cancelled" | "churned" | "paused" | "pending" | null;
        }
      | null = null;

    if (email) {
      const { data, error } = await supabase
        .from("customers")
        .select("role, plan, status")
        .eq("email", email)
        .maybeSingle();

      if (error && isMissingCustomerRoleColumnError(error.message)) {
        const { data: legacyData } = await supabase
          .from("customers")
          .select("plan, status")
          .eq("email", email)
          .maybeSingle();

        customerRecord = legacyData
          ? {
              ...legacyData,
              role: getBootstrapRoleForEmail(email),
            }
          : null;
      } else {
        customerRecord = data;
      }
    }

    const isAdmin = customerRecord?.role === "admin";

    if (
      email &&
      !isAdmin &&
      PLAN_REQUIRED_CUSTOMER_ROUTES.some((route) => path.startsWith(route))
    ) {
      if (!hasCustomerWorkspaceAccess(customerRecord)) {
        const dashboardUrl = new URL(ROUTES.DASHBOARD, request.url);
        dashboardUrl.searchParams.set("access", "plan-required");
        dashboardUrl.searchParams.set(
          "locked",
          path.startsWith(ROUTES.BRIEFS) ? "briefs" : "icp",
        );

        return copyResponseCookies(NextResponse.redirect(dashboardUrl), response);
      }
    }
  }

  if (PROTECTED_ADMIN_ROUTES.some((route) => path.startsWith(route))) {
    const email = user?.email?.toLowerCase();
    let isAdmin = false;

    if (email) {
      const { data, error } = await supabase
        .from("customers")
        .select("role")
        .eq("email", email)
        .maybeSingle();

      if (error && isMissingCustomerRoleColumnError(error.message)) {
        isAdmin = getBootstrapRoleForEmail(email) === "admin";
      } else {
        isAdmin = data?.role === "admin";
      }
    }

    if (!user || !email || !isAdmin) {
      return copyResponseCookies(
        NextResponse.redirect(new URL(ROUTES.HOME, request.url)),
        response,
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/account/:path*",
    "/dashboard/:path*",
    "/briefs/:path*",
    "/icp/:path*",
    "/billing/:path*",
    "/help/:path*",
    "/admin/:path*",
  ],
};
