"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

export function BatchBuilder() {
  const [customer, setCustomer] = useState("Northstar Labs");
  const [deliveryDate, setDeliveryDate] = useState("2026-05-04");
  const [leads, setLeads] = useState('[{"full_name":"Sarah Chen","company_name":"Volcano Digital"}]');
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="batch-customer">Customer</Label>
          <Input
            id="batch-customer"
            value={customer}
            onChange={(event) => setCustomer(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="batch-date">Delivery date</Label>
          <Input
            id="batch-date"
            type="date"
            value={deliveryDate}
            onChange={(event) => setDeliveryDate(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="batch-leads">Leads (JSON or CSV)</Label>
        <Textarea
          id="batch-leads"
          rows={10}
          value={leads}
          onChange={(event) => setLeads(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="batch-notes">Notes</Label>
        <Textarea
          id="batch-notes"
          placeholder="Optional internal notes..."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-cream p-4 text-sm text-muted md:grid-cols-2">
        <div>
          <p className="font-semibold text-ink">Preview</p>
          <p>Customer: {customer}</p>
          <p>Delivery date: {deliveryDate}</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Validation</p>
          <p>{leads.trim().startsWith("[") ? "JSON detected" : "CSV format expected"}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => toast.success("Batch preview ready.")}>
          Preview Batch
        </Button>
        <Button variant="secondary" onClick={() => toast.success("Draft saved.")}>
          Save as Draft
        </Button>
        <Button onClick={() => toast.success("Batch published and customer notification queued.")}>
          Publish & Notify
        </Button>
      </div>
    </div>
  );
}
