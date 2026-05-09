import { Badge } from "@/components/ui/badge";

type CampaignStatusBadgeProps = {
  status: string;
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  created: "Created",
  exhausted: "Exhausted",
  failed: "Failed",
  queued: "Queued",
  running: "Running",
};

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const normalizedStatus = status.trim().toLowerCase();
  const label = STATUS_LABELS[normalizedStatus] ?? status;

  if (normalizedStatus === "completed") {
    return <Badge variant="success">{label}</Badge>;
  }

  if (normalizedStatus === "exhausted") {
    return <Badge variant="outline">{label}</Badge>;
  }

  if (normalizedStatus === "running" || normalizedStatus === "queued" || normalizedStatus === "created") {
    return <Badge>{label}</Badge>;
  }

  return <Badge variant="muted">{label}</Badge>;
}
