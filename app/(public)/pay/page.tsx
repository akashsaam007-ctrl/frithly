import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  description: "Apply or book a meeting to activate a Frithly plan.",
  noIndex: true,
  path: "/pay",
  title: "Apply or book a meeting | Frithly",
});

export default function PayPage() {
  redirect(ROUTES.CONTACT_SALES);
}
