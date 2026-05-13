import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    error:
      "ICP updates are managed by Frithly admin. Contact support if you need the targeting brief changed.",
  }, { status: 403 });
}
