"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

type CustomerRoleControlsProps = {
  customerEmail: string;
  customerId: string;
  initialRole: "admin" | "customer";
  viewerEmail: string;
};

export function CustomerRoleControls({
  customerEmail,
  customerId,
  initialRole,
  viewerEmail,
}: CustomerRoleControlsProps) {
  const router = useRouter();
  const [role, setRole] = useState(initialRole);
  const [isPending, startTransition] = useTransition();
  const isViewingOwnAccount = customerEmail.trim().toLowerCase() === viewerEmail.trim().toLowerCase();

  async function updateRole(nextRole: "admin" | "customer") {
    if (nextRole === role) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/customers/${customerId}/role`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: nextRole }),
        });

        const payload = (await response.json()) as { error?: string; role?: "admin" | "customer" };

        if (!response.ok) {
          toast.error(payload.error ?? "We couldn't update the customer role right now.");
          return;
        }

        setRole(payload.role ?? nextRole);
        toast.success(
          nextRole === "admin"
            ? "Customer promoted to admin."
            : "Admin changed back to customer.",
        );
        router.refresh();
      } catch (error) {
        console.error("Customer role update failed", error);
        toast.error("We couldn't update the customer role right now.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
          Access role
        </p>
        <p className="text-sm text-muted">
          Control whether this account can access the admin workspace or the customer workspace.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          disabled={isPending || role === "customer"}
          onClick={() => updateRole("customer")}
          variant={role === "customer" ? "primary" : "secondary"}
        >
          Customer
        </Button>
        <Button
          disabled={isPending || role === "admin"}
          onClick={() => updateRole("admin")}
          variant={role === "admin" ? "primary" : "secondary"}
        >
          Admin
        </Button>
        <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink">
          Current: {role}
        </span>
      </div>

      {isViewingOwnAccount ? (
        <p className="mt-3 text-sm text-muted">
          You can keep your own role visible here, but self-demotion is blocked to avoid locking
          yourself out of admin.
        </p>
      ) : null}
    </div>
  );
}
