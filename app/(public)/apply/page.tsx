import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function ApplyPage() {
  redirect(ROUTES.BOOK_MEETING);
}
