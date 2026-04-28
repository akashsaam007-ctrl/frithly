import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Stripe billing is no longer the active provider for this project. Configure Paddle webhooks at /api/webhooks/paddle instead.",
    },
    { status: 410 },
  );
}
