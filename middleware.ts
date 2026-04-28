import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/lib/constants";
import { copyResponseCookies, updateSession } from "@/lib/supabase/middleware";
import { isDemoMode } from "@/lib/utils/mode";

const PROTECTED_CUSTOMER_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.BRIEFS,
  ROUTES.ICP,
  ROUTES.BILLING,
  "/help",
];
const PROTECTED_ADMIN_ROUTES = [ROUTES.ADMIN];
const ADMIN_EMAIL_ALLOWLIST = (process.env.ADMIN_EMAIL_ALLOWLIST || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function middleware(request: NextRequest) {
  if (isDemoMode) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  if (PROTECTED_CUSTOMER_ROUTES.some((route) => path.startsWith(route))) {
    if (!user) {
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set("next", `${path}${request.nextUrl.search}`);

      return copyResponseCookies(
        NextResponse.redirect(loginUrl),
        response,
      );
    }
  }

  if (PROTECTED_ADMIN_ROUTES.some((route) => path.startsWith(route))) {
    const email = user?.email?.toLowerCase();

    if (!user || !email || !ADMIN_EMAIL_ALLOWLIST.includes(email)) {
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
    "/dashboard/:path*",
    "/briefs/:path*",
    "/icp/:path*",
    "/billing/:path*",
    "/help/:path*",
    "/admin/:path*",
  ],
};
