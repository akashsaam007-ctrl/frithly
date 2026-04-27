import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/briefs/:path*",
    "/icp/:path*",
    "/billing/:path*",
    "/admin/:path*",
  ],
};
