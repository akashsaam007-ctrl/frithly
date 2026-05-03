"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

export function HelpForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/help", {
        body: JSON.stringify({ message, subject }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "We couldn't send your support request.");
      }

      setSubject("");
      setMessage("");
      toast.success("Support request queued. We'll reply from support@frithly.com.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "We couldn't send your support request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="help-subject">Subject</Label>
        <Input
          required
          id="help-subject"
          placeholder="Need help refining our ICP"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="help-message">Message</Label>
        <Textarea
          required
          id="help-message"
          placeholder="Tell us what's blocking you and what you'd like us to adjust."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
