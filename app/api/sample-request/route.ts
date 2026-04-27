import { NextResponse } from "next/server";
import { z } from "zod";

const sampleRequestSchema = z.object({
  company: z.string().optional(),
  companySize: z.string().optional(),
  email: z.string().email(),
  frustration: z.string().min(10),
  fullName: z.string().min(2),
  geography: z.string().optional(),
  industry: z.string().optional(),
  targetRole: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = sampleRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please provide your name, work email, and a short description of your current lead-sourcing frustration.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    message: "Sample request received.",
    success: true,
  });
}
