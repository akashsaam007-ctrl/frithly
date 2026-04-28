"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

type BatchFeedbackFormProps = {
  batchId: string;
};

export function BatchFeedbackForm({ batchId }: BatchFeedbackFormProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!comment.trim()) {
      toast.error("Please add a few notes before submitting feedback.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        body: JSON.stringify({ batchId, comment }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "We couldn't save your batch feedback.");
      }

      setComment("");
      toast.success("Feedback submitted. We'll use it to sharpen next week's batch.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "We couldn't save your batch feedback.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="batch-feedback">How was this batch? Leave general feedback</Label>
        <Textarea
          id="batch-feedback"
          placeholder="What felt on target, what missed, and what patterns we should push harder next week..."
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </div>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  );
}
