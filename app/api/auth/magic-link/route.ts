import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let nextPath = "";

  try {
    const body = (await request.json()) as { nextPath?: string };
    nextPath = typeof body.nextPath === "string" ? body.nextPath.trim() : "";
  } catch {}

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("auth", "google");

  if (nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.json(
    {
      code: "magic_link_retired",
      error: "Email magic-link sign-in has been retired. Continue with Google instead.",
      loginUrl: loginUrl.toString(),
    },
    { status: 410 },
  );
}
