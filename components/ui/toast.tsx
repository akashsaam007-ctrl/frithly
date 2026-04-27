"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      theme="light"
      toastOptions={{
        classNames: {
          actionButton: "!bg-terracotta !text-white",
          cancelButton: "!border-border !bg-white !text-ink",
          closeButton: "!border-border !bg-white !text-muted",
          description: "!text-muted",
          toast: "!rounded-2xl !border !border-border !bg-white !text-ink !shadow-lg",
          title: "!text-ink",
        },
      }}
    />
  );
}

export { Toaster, toast };
