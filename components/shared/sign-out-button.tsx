"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import { resetAnalyticsUser } from "@/lib/monitoring/posthog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/utils/mode";

type SignOutButtonProps = Omit<ButtonProps, "children" | "onClick">;

export function SignOutButton(props: SignOutButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    resetAnalyticsUser();

    if (!isDemoMode) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Button {...props} onClick={handleSignOut}>
      <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
      Logout
    </Button>
  );
}
