import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Razorpay billing is no longer the active provider for this project. Configure Cashfree webhooks at /api/webhooks/cashfree instead.",
    },
    { status: 410 },
  );
}
