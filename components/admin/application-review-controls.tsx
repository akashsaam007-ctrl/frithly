"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import type {
  AdminApplicationPlanRecommendation,
  AdminApplicationRecord,
  AdminApplicationStatus,
} from "@/lib/supabase/admin-data";

type ApplicationReviewControlsProps = {
  application: Pick<
    AdminApplicationRecord,
    | "company"
    | "encodedId"
    | "feasibilityNotes"
    | "linkedCustomerId"
    | "linkedCustomerPlan"
    | "linkedCustomerStatus"
    | "onboardingNotes"
    | "planRecommendation"
    | "qualificationNotes"
    | "recommendedPlan"
    | "riskNotes"
    | "status"
  >;
};

type PlanOption = NonNullable<AdminApplicationRecord["recommendedPlan"]>;

const statusOptions: AdminApplicationStatus[] = [
  "pending",
  "reviewing",
  "qualified",
  "accepted",
  "rejected",
  "onboarding",
  "active",
];

const statusActions: Array<{ label: string; status: AdminApplicationStatus }> = [
  { label: "Mark reviewing", status: "reviewing" },
  { label: "Qualify", status: "qualified" },
  { label: "Accept", status: "accepted" },
  { label: "Reject", status: "rejected" },
  { label: "Start onboarding", status: "onboarding" },
  { label: "Activate customer", status: "active" },
];

const planOptions: Array<{ label: string; value: PlanOption }> = [
  { label: "Design Partner", value: "design_partner" },
  { label: "Starter", value: "starter" },
  { label: "Growth", value: "growth" },
  { label: "Scale", value: "scale" },
];

function humanizeStatus(status: AdminApplicationStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "reviewing":
      return "Reviewing";
    case "qualified":
      return "Qualified";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "onboarding":
      return "Onboarding";
    case "active":
      return "Active";
  }
}

function humanizePlanRecommendation(plan: AdminApplicationPlanRecommendation) {
  return `${plan.label} recommended because ${plan.reason.charAt(0).toLowerCase()}${plan.reason.slice(1)}`;
}

export function ApplicationReviewControls({
  application,
}: ApplicationReviewControlsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<AdminApplicationStatus>(application.status);
  const [recommendedPlan, setRecommendedPlan] = useState<PlanOption>(
    application.recommendedPlan ?? application.planRecommendation.planId,
  );
  const [qualificationNotes, setQualificationNotes] = useState(application.qualificationNotes ?? "");
  const [feasibilityNotes, setFeasibilityNotes] = useState(application.feasibilityNotes ?? "");
  const [riskNotes, setRiskNotes] = useState(application.riskNotes ?? "");
  const [onboardingNotes, setOnboardingNotes] = useState(application.onboardingNotes ?? "");
  const [isPending, startTransition] = useTransition();

  const initialPlan = application.recommendedPlan ?? application.planRecommendation.planId;
  const hasChanges = useMemo(
    () =>
      status !== application.status ||
      recommendedPlan !== initialPlan ||
      qualificationNotes !== (application.qualificationNotes ?? "") ||
      feasibilityNotes !== (application.feasibilityNotes ?? "") ||
      riskNotes !== (application.riskNotes ?? "") ||
      onboardingNotes !== (application.onboardingNotes ?? ""),
    [
      application.feasibilityNotes,
      application.onboardingNotes,
      application.qualificationNotes,
      application.riskNotes,
      application.status,
      feasibilityNotes,
      initialPlan,
      onboardingNotes,
      qualificationNotes,
      recommendedPlan,
      riskNotes,
      status,
    ],
  );

  function persistChanges(nextStatus?: AdminApplicationStatus) {
    const statusToSave = nextStatus ?? status;

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/applications/${encodeURIComponent(application.encodedId)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              feasibilityNotes,
              onboardingNotes,
              qualificationNotes,
              recommendedPlan,
              riskNotes,
              status: statusToSave,
            }),
          },
        );

        const payload = (await response.json()) as {
          error?: string;
          linkedCustomerId?: string | null;
          linkedCustomerPlan?: string | null;
          linkedCustomerStatus?: string | null;
          recommendedPlan?: PlanOption | null;
          status?: AdminApplicationStatus;
        };

        if (!response.ok) {
          toast.error(payload.error ?? "We couldn't save the application review right now.");
          return;
        }

        setStatus(payload.status ?? statusToSave);
        setRecommendedPlan(payload.recommendedPlan ?? recommendedPlan);
        toast.success(
          payload.linkedCustomerId
            ? `${application.company} moved to ${humanizeStatus(payload.status ?? statusToSave)} and linked to a customer record.`
            : `${application.company} moved to ${humanizeStatus(payload.status ?? statusToSave)}.`,
        );
        router.refresh();
      } catch (error) {
        console.error("Application review update failed", error);
        toast.error("We couldn't save the application review right now.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
          Qualification controls
        </p>
        <p className="text-sm text-muted">
          Move this application through intake, capture operator notes, and keep onboarding
          context attached to the record.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Workflow stage</span>
          <select
            className="field-dark-select"
            disabled={isPending}
            onChange={(event) => setStatus(event.target.value as AdminApplicationStatus)}
            value={status}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {humanizeStatus(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Recommended plan</span>
          <select
            className="field-dark-select"
            disabled={isPending}
            onChange={(event) => setRecommendedPlan(event.target.value as PlanOption)}
            value={recommendedPlan}
          >
            {planOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-muted">
        <span className="font-semibold text-ink">System recommendation:</span>{" "}
        {humanizePlanRecommendation(application.planRecommendation)}
      </div>

      <div className="mt-5 grid gap-4">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Qualification notes</span>
          <Textarea
            disabled={isPending}
            onChange={(event) => setQualificationNotes(event.target.value)}
            placeholder="Explain ICP fit, founder confidence expectations, and whether this should progress."
            rows={4}
            value={qualificationNotes}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Campaign feasibility notes</span>
          <Textarea
            disabled={isPending}
            onChange={(event) => setFeasibilityNotes(event.target.value)}
            placeholder="Capture expected recommendation density, likely bottlenecks, and scope adjustments."
            rows={4}
            value={feasibilityNotes}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Risk and deliverability notes</span>
          <Textarea
            disabled={isPending}
            onChange={(event) => setRiskNotes(event.target.value)}
            placeholder="Note niche warnings, region density risk, reply risk, or deliverability concerns."
            rows={4}
            value={riskNotes}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Onboarding observations</span>
          <Textarea
            disabled={isPending}
            onChange={(event) => setOnboardingNotes(event.target.value)}
            placeholder="Capture kickoff notes, CRM/export needs, send-domain concerns, or onboarding prep."
            rows={4}
            value={onboardingNotes}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button disabled={isPending || !hasChanges} onClick={() => persistChanges()}>
          {isPending ? "Saving..." : "Save assessment"}
        </Button>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink">
          Current: {humanizeStatus(status)}
        </span>
        {application.linkedCustomerId ? (
          <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink">
            Customer: {application.linkedCustomerPlan ?? "unassigned"} / {application.linkedCustomerStatus ?? "pending"}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {statusActions.map((action) => (
          <Button
            key={action.status}
            disabled={isPending || action.status === status}
            onClick={() => persistChanges(action.status)}
            variant={action.status === status ? "primary" : "secondary"}
          >
            {action.label}
          </Button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted">
        Accepted, onboarding, and active stages will create or update a customer record so the
        onboarding workflow stays connected to the application.
      </p>
    </div>
  );
}
