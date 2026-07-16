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
    <div className="no-print fixed inset-x-0 bottom-4 z-50 px-4 sm:bottom-6 sm:px-6 min-[520px]:left-auto min-[520px]:right-6 min-[520px]:max-w-[24rem] min-[520px]:px-0">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[1.35rem] border border-white/[0.09] bg-[radial-gradient(circle_at_12%_0%,rgba(244,194,139,0.12),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(201,183,255,0.14),transparent_34%),linear-gradient(180deg,rgba(18,18,20,0.96),rgba(5,5,5,0.98))] shadow-[0_38px_120px_rgba(0,0,0,0.52),0_0_55px_rgba(201,183,255,0.08)] backdrop-blur-2xl min-[520px]:mx-0 min-[520px]:max-w-[24rem]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_28%,rgba(255,255,255,0.025)_58%,transparent)]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,#f4c28b,#e8a7d7,#c9b7ff,transparent)] opacity-80" />
        <div className="relative flex flex-col gap-4 p-4 sm:p-5">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 shadow-[0_12px_34px_rgba(0,0,0,0.22)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c9b7ff] shadow-[0_0_18px_rgba(201,183,255,0.75)]" />
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white">
                Cookie preferences
              </p>
            </div>
            <p className="text-[0.92rem] leading-6 text-[#c9d0dc]">
              We use essential cookies and local storage to keep Frithly working properly.
              Optional analytics stay off unless you allow them. See our{" "}
              <Link
                className="font-semibold text-white underline decoration-[#c9b7ff]/35 underline-offset-4 transition-colors hover:text-[#e8a7d7]"
                href={`${ROUTES.PRIVACY}#cookies`}
              >
                cookie details
              </Link>
              .
            </p>
          </div>

          <div className="grid gap-2">
            <Button
              className="h-auto min-h-12 w-full whitespace-normal rounded-2xl border-white/[0.1] bg-white/[0.035] px-4 py-3 text-center text-sm font-bold leading-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all hover:border-[#c9b7ff]/35 hover:bg-white/[0.06]"
              size="sm"
              variant="secondary"
              onClick={() => saveChoice("rejected")}
            >
              Reject optional cookies
            </Button>
            <Button
              className="h-auto min-h-12 w-full whitespace-normal rounded-2xl border-0 bg-[linear-gradient(100deg,#f4c28b_0%,#e8a7d7_54%,#c9b7ff_100%)] px-4 py-3 text-center text-sm font-black leading-5 text-black shadow-[0_18px_50px_rgba(232,167,215,0.18),0_0_38px_rgba(201,183,255,0.12)] transition-all hover:brightness-105"
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
