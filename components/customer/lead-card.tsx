"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

type LeadCardProps = {
  company: string;
  email: string;
  emailStatus: string;
  fitScore: string;
  name: string;
  openers: readonly string[];
  recommendedAngle: string;
  role: string;
  signals: readonly string[];
  triggerSummary: string;
  whyNow: string;
};

export function LeadCard({
  company,
  email,
  emailStatus,
  fitScore,
  name,
  openers,
  recommendedAngle,
  role,
  signals,
  triggerSummary,
  whyNow,
}: LeadCardProps) {
  const [feedback, setFeedback] = useState<"negative" | "positive" | null>(null);

  async function copyText(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  }

  function setLeadFeedback(value: "negative" | "positive") {
    setFeedback(value);
    toast.success(`Lead marked ${value}.`);
  }

  return (
    <details className="group">
      <summary className="list-none">
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl text-ink">{name}</h3>
                <Badge variant="outline">{fitScore}</Badge>
              </div>
              <p className="text-sm text-muted md:text-base">
                {role} · {company} · {email} ({emailStatus})
              </p>
              <p className="text-sm text-ink md:text-base">{triggerSummary}</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void copyText(email, "Email");
                }}
              >
                Copy Email
              </Button>
              <span className="text-sm font-medium text-terracotta group-open:hidden">Expand</span>
            </div>
          </CardContent>
        </Card>
      </summary>

      <div className="pt-4">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div>
              <h4 className="text-lg">Why this lead, right now</h4>
              <p className="mt-2 text-muted">{whyNow}</p>
            </div>

            <div>
              <h4 className="text-lg">Trigger signals</h4>
              <ul className="mt-3 space-y-2 text-muted">
                {signals.map((signal) => (
                  <li key={signal}>- {signal}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h4 className="text-lg">Personalized openers</h4>
                <Badge>{recommendedAngle} recommended</Badge>
              </div>

              {openers.map((opener, index) => (
                <div key={opener} className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink">Option {String.fromCharCode(65 + index)}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void copyText(opener, `Opener ${String.fromCharCode(65 + index)}`)}
                      >
                        Copy opener
                      </Button>
                  </div>
                  <p className="text-muted">{opener}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                variant={feedback === "positive" ? "primary" : "secondary"}
                onClick={() => setLeadFeedback("positive")}
              >
                <ThumbsUp className="mr-2 h-4 w-4" aria-hidden="true" />
                Helpful
              </Button>
              <Button
                size="sm"
                variant={feedback === "negative" ? "primary" : "secondary"}
                onClick={() => setLeadFeedback("negative")}
              >
                <ThumbsDown className="mr-2 h-4 w-4" aria-hidden="true" />
                Not a fit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </details>
  );
}
