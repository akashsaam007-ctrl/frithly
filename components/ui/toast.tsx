"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      theme="dark"
      toastOptions={{
        classNames: {
          actionButton: "!bg-terracotta !text-white",
          cancelButton: "!border-white/12 !bg-[#0b1520] !text-ink",
          closeButton: "!border-white/12 !bg-[#0b1520] !text-muted",
          description: "!text-muted",
          toast: "!rounded-2xl !border !border-white/12 !bg-[#0b1520] !text-ink !shadow-[0_22px_80px_rgba(0,0,0,0.36)]",
          title: "!text-ink",
        },
      }}
    />
  );
}

export { Toaster, toast };
