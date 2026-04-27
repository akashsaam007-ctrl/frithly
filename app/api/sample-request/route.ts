import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Sample request handling has not been implemented yet.",
    },
    { status: 501 },
  );
}
