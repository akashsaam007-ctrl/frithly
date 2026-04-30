import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CALCOM_URL } from "@/lib/constants";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  description: "Talk to sales to activate a Frithly plan.",
  noIndex: true,
  path: "/pay",
  title: "Talk to sales | Frithly",
});

export default function PayPage() {
  redirect(CALCOM_URL);
}
