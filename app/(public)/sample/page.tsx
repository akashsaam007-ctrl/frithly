import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function SamplePage() {
  redirect(ROUTES.CONTACT_SALES);
}
