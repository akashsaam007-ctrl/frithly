"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { ROUTES } from "@/lib/constants";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentChoice,
} from "@/lib/monitoring/consent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
});

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
    <div className="no-print fixed inset-x-0 bottom-4 z-50 px-4 sm:bottom-6 sm:px-6 min-[520px]:left-auto min-[520px]:right-6 min-[520px]:max-w-[24rem] min-[520px]:px-0">
      <div className={cn(bodyFont.className, "relative mx-auto max-w-4xl overflow-hidden rounded-[6px] border border-[#262b31] bg-[#14171b] shadow-[0_38px_120px_rgba(0,0,0,0.52)] backdrop-blur-2xl min-[520px]:mx-0 min-[520px]:max-w-[24rem]")}>
        <div className="h-0.5 bg-[linear-gradient(90deg,#f3b583_0%,#ee9fcb_50%,#b6abe8_100%)]" />
        <div className="relative flex flex-col gap-4 p-4 sm:p-5">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-3 rounded-[3px] border border-[#262b31] bg-[#0c0e11]/78 px-3 py-1.5 shadow-[0_12px_34px_rgba(0,0,0,0.22)]">
              <span className="h-px w-6 bg-[#e7a6d6]/70" />
              <p className={cn(monoFont.className, "text-[11px] font-medium uppercase tracking-[0.14em] text-[#e7a6d6]")}>
                Cookie preferences
              </p>
            </div>
            <p className="text-[14px] leading-[1.7] text-[#9ba1a8]">
              We use essential cookies and local storage to keep Frithly working properly.
              Optional analytics stay off unless you allow them. See our{" "}
              <Link
                className="font-semibold text-[#e7a6d6] underline decoration-[#e7a6d6]/35 underline-offset-4 transition-colors hover:text-[#f3f1ea]"
                href={`${ROUTES.PRIVACY}#cookies`}
              >
                cookie details
              </Link>
              .
            </p>
          </div>

          <div className="grid gap-2">
            <Button
              className="h-auto min-h-12 w-full whitespace-normal rounded-[3px] border-[#262b31] bg-[#0c0e11]/78 px-4 py-3 text-center text-sm font-semibold leading-5 text-[#f3f1ea] shadow-none transition-all hover:border-[#9ba1a8] hover:bg-[#0c0e11]/78 hover:text-[#f3f1ea]"
              size="sm"
              variant="secondary"
              onClick={() => saveChoice("rejected")}
            >
              Reject optional cookies
            </Button>
            <Button
              className="h-auto min-h-12 w-full whitespace-normal rounded-[3px] border-0 bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)] px-4 py-3 text-center text-sm font-semibold leading-5 text-[#241522] shadow-none transition-all hover:brightness-[1.08] hover:text-[#241522]"
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
