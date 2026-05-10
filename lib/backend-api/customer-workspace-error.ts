import { BackendApiError } from "@/lib/backend-api/client";

export function getCustomerWorkspaceErrorMessage(error: unknown, fallback: string) {
  if (error instanceof BackendApiError) {
    if (error.status === 404) {
      return "The live intelligence workspace is reconnecting to the outbound backend. Please try again in a moment.";
    }

    if (error.status >= 500) {
      return "The outbound intelligence backend is temporarily unavailable. Please try again shortly.";
    }
  }

  if (error instanceof Error) {
    const message = error.message.trim();

    if (!message || message === "Not Found") {
      return "The live intelligence workspace is reconnecting to the outbound backend. Please try again in a moment.";
    }

    if (/ngrok|ERR_NGROK/i.test(message)) {
      return "The secure intelligence tunnel is temporarily unavailable. Please try again shortly.";
    }

    return message;
  }

  return fallback;
}
