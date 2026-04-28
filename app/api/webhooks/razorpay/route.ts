import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Razorpay billing is no longer the active provider for this project. Configure Lemon Squeezy webhooks at /api/webhooks/lemonsqueezy instead.",
    },
    { status: 410 },
  );
}
