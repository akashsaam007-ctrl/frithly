import { clsx, type ClassValue } from "clsx";
import { format, nextMonday } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    currency,
    style: "currency",
  }).format(value);
}

export function formatLongDate(value: Date | number | string) {
  return format(new Date(value), "EEEE, d MMMM yyyy");
}

export function getNextMondayLabel() {
  return format(nextMonday(new Date()), "EEEE d MMMM");
}
