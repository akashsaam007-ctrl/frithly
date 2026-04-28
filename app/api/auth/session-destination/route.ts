import { NextResponse } from "next/server";
import { getPostLoginRoute } from "@/lib/auth/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ destination: ROUTES.LOGIN }, { status: 401 });
  }

  return NextResponse.json({
    destination: getPostLoginRoute(user.email),
  });
}
