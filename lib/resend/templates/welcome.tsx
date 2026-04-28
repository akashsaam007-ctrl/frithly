import { EmailButton, EmailLayout, EmailMuted, EmailParagraph } from "@/lib/resend/templates/shared";

export type WelcomeEmailProps = {
  dashboardUrl: string;
  firstName: string;
  planName: string;
  recipientEmail: string;
};

export function getWelcomeEmailSubject(firstName: string) {
  return `Welcome to Frithly, ${firstName}`;
}

export function getWelcomeEmailText({
  dashboardUrl,
  firstName,
  planName,
}: WelcomeEmailProps) {
  return [
    `Hey ${firstName},`,
    "",
    `Welcome to Frithly. Your ${planName} subscription is active and your workspace is ready.`,
    "",
    "Next steps:",
    "- Confirm your ICP if you have not already.",
    "- Watch for your first lead batch within 7 days.",
    "- Use the dashboard to review briefs, billing, and feedback.",
    "",
    `Open your dashboard: ${dashboardUrl}`,
    "",
    "Frithly",
  ].join("\n");
}

export function WelcomeEmail(props: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview="Your Frithly account is live and your first delivery window is open."
      recipientEmail={props.recipientEmail}
      title={`Welcome to Frithly, ${props.firstName}`}
    >
      <EmailParagraph>
        Your {props.planName} subscription is active and your workspace is ready.
      </EmailParagraph>
      <EmailMuted>
        Confirm your ICP, watch for your first lead batch within 7 days, and use the dashboard to
        review briefs, billing, and feedback.
      </EmailMuted>
      <EmailButton href={props.dashboardUrl} label="Open your dashboard" />
    </EmailLayout>
  );
}
