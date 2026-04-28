import { EmailButton, EmailLayout, EmailMuted, EmailParagraph } from "@/lib/resend/templates/shared";

export type SubscriptionCancelledEmailProps = {
  billingUrl: string;
  firstName: string;
  recipientEmail: string;
};

export function getSubscriptionCancelledEmailSubject() {
  return "Your Frithly subscription has been cancelled";
}

export function getSubscriptionCancelledEmailText({
  billingUrl,
  firstName,
}: SubscriptionCancelledEmailProps) {
  return [
    `Hey ${firstName},`,
    "",
    "Your Frithly subscription has been cancelled.",
    "",
    "If this was a mistake, you can use the billing link below to reactivate or reply to this email and we will help.",
    "",
    `Billing: ${billingUrl}`,
    "",
    "Thank you for giving Frithly a try.",
  ].join("\n");
}

export function SubscriptionCancelledEmail(props: SubscriptionCancelledEmailProps) {
  return (
    <EmailLayout
      preview="Your Frithly subscription has been cancelled."
      recipientEmail={props.recipientEmail}
      title="Your subscription has been cancelled"
    >
      <EmailParagraph>Hey {props.firstName},</EmailParagraph>
      <EmailParagraph>Your Frithly subscription has been cancelled.</EmailParagraph>
      <EmailMuted>
        If this was a mistake, you can use the billing link below to reactivate or reply to this
        email and we will help.
      </EmailMuted>
      <EmailButton href={props.billingUrl} label="Review billing" />
      <EmailParagraph>Thank you for giving Frithly a try.</EmailParagraph>
    </EmailLayout>
  );
}
