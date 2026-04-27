"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SignOutButtonProps = Omit<ButtonProps, "children" | "onClick">;

export function SignOutButton(props: SignOutButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
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
