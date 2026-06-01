"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentChoice,
} from "@/lib/monitoring/consent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existingChoice = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

    if (!existingChoice) {
      setVisible(true);
    }
  }, []);

  function saveChoice(choice: CookieConsentChoice) {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice);
    window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="no-print fixed inset-x-0 bottom-3 z-50 px-3 sm:bottom-4 sm:px-4 min-[460px]:left-auto min-[460px]:right-5 min-[460px]:max-w-[20.25rem] min-[460px]:px-0">
      <Card className="mx-auto max-w-4xl border-white/[0.05] bg-[#081018]/86 shadow-[0_22px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl min-[460px]:mx-0 min-[460px]:max-w-[20.25rem]">
        <CardContent className="flex flex-col gap-3 p-3 sm:p-3.5">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-ink">Cookie preferences</p>
            <p className="text-[0.88rem] leading-6 text-muted">
              We use essential cookies and local storage to keep Frithly working properly.
              Optional analytics stay off unless you allow them. See our{" "}
              <Link className="font-semibold text-white/78 underline decoration-white/16 underline-offset-4 transition-colors hover:text-white" href={`${ROUTES.PRIVACY}#cookies`}>
                cookie details
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col gap-2 min-[460px]:flex-row min-[460px]:justify-end">
            <Button className="w-full min-[460px]:w-auto" size="sm" variant="secondary" onClick={() => saveChoice("rejected")}>
              Reject optional cookies
            </Button>
            <Button className="w-full min-[460px]:w-auto" size="sm" onClick={() => saveChoice("accepted")}>
              Accept cookies
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
