"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

export function BatchFeedbackForm() {
  const [comment, setComment] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setComment("");
    toast.success("Feedback submitted. We'll use it to sharpen next week's batch.");
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
      <Button type="submit">Submit Feedback</Button>
    </form>
  );
}
