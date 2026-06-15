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
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[1.15rem] border border-white/[0.06] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_34%),linear-gradient(180deg,rgba(11,12,16,0.98),rgba(4,5,8,1))] shadow-[0_32px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl min-[460px]:mx-0 min-[460px]:max-w-[20.25rem]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.1),transparent_60%)]" />
        <div className="relative flex flex-col gap-3 p-3.5 sm:p-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Cookie preferences</p>
            <p className="text-[0.88rem] leading-6 text-slate-300">
              We use essential cookies and local storage to keep Frithly working properly.
              Optional analytics stay off unless you allow them. See our{" "}
              <Link
                className="font-semibold text-white/82 underline decoration-white/16 underline-offset-4 transition-colors hover:text-white"
                href={`${ROUTES.PRIVACY}#cookies`}
              >
                cookie details
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              className="w-full rounded-[0.88rem] border-white/[0.08] bg-white/[0.035] px-4 text-center text-white hover:border-white/[0.14] hover:bg-white/[0.06] sm:w-auto"
              size="sm"
              variant="secondary"
              onClick={() => saveChoice("rejected")}
            >
              Reject optional cookies
            </Button>
            <Button
              className="w-full rounded-[0.88rem] border-white/[0.08] bg-[linear-gradient(180deg,rgba(23,27,34,0.98),rgba(11,14,18,1))] px-4 text-center text-white shadow-[0_18px_42px_rgba(0,0,0,0.22)] hover:border-white/[0.14] hover:bg-[linear-gradient(180deg,rgba(28,33,40,1),rgba(13,16,20,1))] sm:w-auto"
              size="sm"
              onClick={() => saveChoice("accepted")}
            >
              Accept cookies
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
