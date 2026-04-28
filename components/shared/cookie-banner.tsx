"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const consentStorageKey = "frithly-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existingChoice = window.localStorage.getItem(consentStorageKey);

    if (!existingChoice) {
      setVisible(true);
    }
  }, []);

  function saveChoice(choice: "accepted" | "rejected") {
    window.localStorage.setItem(consentStorageKey, choice);
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="no-print fixed inset-x-0 bottom-4 z-50 px-4">
      <Card className="mx-auto max-w-4xl shadow-lg">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-ink">Cookie preferences</p>
            <p className="text-sm text-muted md:text-base">
              We use essential cookies and local storage to keep Frithly secure and working
              properly. Optional analytics or similar tracking will only be enabled after consent
              where required. See our{" "}
              <Link className="font-semibold text-terracotta" href={`${ROUTES.PRIVACY}#cookies`}>
                cookie details
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => saveChoice("rejected")}>
              Reject optional cookies
            </Button>
            <Button onClick={() => saveChoice("accepted")}>Accept cookies</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
