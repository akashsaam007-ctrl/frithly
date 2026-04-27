import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Feedback submission has not been implemented yet.",
    },
    { status: 501 },
  );
}
