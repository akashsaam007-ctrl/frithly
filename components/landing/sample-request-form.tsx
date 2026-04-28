"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { captureEvent } from "@/lib/monitoring/posthog";

const initialFormState = {
  company: "",
  companySize: "",
  email: "",
  frustration: "",
  fullName: "",
  geography: "",
  industry: "",
  targetRole: "",
};

export function SampleRequestForm() {
  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    captureEvent("sample_form_submitted", {
      location: pathname,
    });

    try {
      const response = await fetch("/api/sample-request", {
        body: JSON.stringify(formState),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("We couldn't submit your sample request right now.");
      }

      setFormState(initialFormState);
      captureEvent("sample_form_completed", {
        location: pathname,
      });
      captureEvent("signup_completed", {
        location: pathname,
      });
      toast.success("Sample request received. We'll be in touch within 48 hours.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "We couldn't submit your sample request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            required
            id="fullName"
            name="fullName"
            placeholder="Alex Morgan"
            value={formState.fullName}
            onChange={(event) =>
              setFormState((current) => ({ ...current, fullName: event.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            required
            id="email"
            name="email"
            type="email"
            placeholder="alex@company.com"
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({ ...current, email: event.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            placeholder="Acme SaaS"
            value={formState.company}
            onChange={(event) =>
              setFormState((current) => ({ ...current, company: event.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            name="industry"
            placeholder="B2B SaaS"
            value={formState.industry}
            onChange={(event) =>
              setFormState((current) => ({ ...current, industry: event.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetRole">Target role</Label>
          <Input
            id="targetRole"
            name="targetRole"
            placeholder="Head of Sales"
            value={formState.targetRole}
            onChange={(event) =>
              setFormState((current) => ({ ...current, targetRole: event.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySize">Company size</Label>
          <Input
            id="companySize"
            name="companySize"
            placeholder="11-50 employees"
            value={formState.companySize}
            onChange={(event) =>
              setFormState((current) => ({ ...current, companySize: event.target.value }))
            }
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="geography">Geography</Label>
          <Input
            id="geography"
            name="geography"
            placeholder="UK, US East Coast"
            value={formState.geography}
            onChange={(event) =>
              setFormState((current) => ({ ...current, geography: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frustration">What&apos;s frustrating about your current lead sourcing?</Label>
        <Textarea
          required
          id="frustration"
          name="frustration"
          placeholder="Apollo gives us lists, but our SDRs still spend hours researching and replies are weak..."
          value={formState.frustration}
          onChange={(event) =>
            setFormState((current) => ({ ...current, frustration: event.target.value }))
          }
        />
      </div>

      <Button className="w-full sm:w-auto" size="lg" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Request My Free 5-Lead Sample"}
      </Button>
    </form>
  );
}
