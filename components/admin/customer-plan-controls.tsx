"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

type CustomerPlan = "design_partner" | "growth" | "scale" | "starter" | "unassigned";
type CustomerStatus = "active" | "cancelled" | "churned" | "paused" | "pending";

type CustomerPlanControlsProps = {
  customerId: string;
  initialPlan: Exclude<CustomerPlan, "unassigned"> | null;
  initialStatus: CustomerStatus | null;
};

const planOptions: Array<{ label: string; value: CustomerPlan }> = [
  { label: "Unassigned", value: "unassigned" },
  { label: "Design Partner", value: "design_partner" },
  { label: "Starter", value: "starter" },
  { label: "Growth", value: "growth" },
  { label: "Scale", value: "scale" },
];

const statusOptions: Array<{ label: string; value: CustomerStatus }> = [
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Churned", value: "churned" },
];

function humanizePlan(value: CustomerPlan) {
  return planOptions.find((option) => option.value === value)?.label ?? value;
}

export function CustomerPlanControls({
  customerId,
  initialPlan,
  initialStatus,
}: CustomerPlanControlsProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<CustomerPlan>(initialPlan ?? "unassigned");
  const [status, setStatus] = useState<CustomerStatus>(initialStatus ?? "pending");
  const [isPending, startTransition] = useTransition();

  const hasChanges = plan !== (initialPlan ?? "unassigned") || status !== (initialStatus ?? "pending");

  async function saveChanges() {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/customers/${customerId}/subscription`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan, status }),
        });

        const payload = (await response.json()) as {
          error?: string;
          plan?: Exclude<CustomerPlan, "unassigned"> | null;
          status?: CustomerStatus | null;
        };

        if (!response.ok) {
          toast.error(payload.error ?? "We couldn't update the customer's plan right now.");
          return;
        }

        setPlan(payload.plan ?? "unassigned");
        setStatus(payload.status ?? status);
        toast.success(
          payload.plan
            ? `${humanizePlan(payload.plan)} plan saved with ${payload.status ?? status} access.`
            : `Customer access updated to ${payload.status ?? status}.`,
        );
        router.refresh();
      } catch (error) {
        console.error("Customer plan update failed", error);
        toast.error("We couldn't update the customer's plan right now.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
          Plan access
        </p>
        <p className="text-sm text-muted">
          Manually assign a plan and access state for sales-led customers or manual overrides.
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Plan</span>
          <select
            className="h-11 w-full rounded-lg border border-border bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-terracotta"
            disabled={isPending}
            onChange={(event) => setPlan(event.target.value as CustomerPlan)}
            value={plan}
          >
            {planOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Status</span>
          <select
            className="h-11 w-full rounded-lg border border-border bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-terracotta"
            disabled={isPending}
            onChange={(event) => setStatus(event.target.value as CustomerStatus)}
            value={status}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button disabled={isPending || !hasChanges} onClick={saveChanges}>
          {isPending ? "Saving..." : "Save plan access"}
        </Button>
        <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink">
          Current: {humanizePlan(plan)} / {status}
        </span>
      </div>

      <p className="mt-3 text-sm text-muted">
        Customers only unlock the workspace when a plan is assigned and status is active or pending.
      </p>
    </div>
  );
}
