import { EmailButton, EmailLayout, EmailParagraph } from "@/lib/resend/templates/shared";

export type PaymentFailedEmailProps = {
  billingUrl: string;
  firstName: string;
  planName: string;
  recipientEmail: string;
};

export function getPaymentFailedEmailSubject() {
  return "Action needed: Frithly payment failed";
}

export function getPaymentFailedEmailText({
  billingUrl,
  firstName,
  planName,
}: PaymentFailedEmailProps) {
  return [
    `Hey ${firstName},`,
    "",
    `We could not process the latest payment for your ${planName} subscription.`,
    "",
    `Update your billing details here: ${billingUrl}`,
    "",
    "Once billing is updated, we can keep your next delivery on schedule.",
    "",
    "Frithly",
  ].join("\n");
}

export function PaymentFailedEmail(props: PaymentFailedEmailProps) {
  return (
    <EmailLayout
      preview="Your latest Frithly payment needs attention."
      recipientEmail={props.recipientEmail}
      title="Your latest Frithly payment needs attention"
    >
      <EmailParagraph>Hey {props.firstName},</EmailParagraph>
      <EmailParagraph>
        We could not process the latest payment for your {props.planName} subscription.
      </EmailParagraph>
      <EmailButton href={props.billingUrl} label="Update billing details" />
      <EmailParagraph>
        Once billing is updated, we can keep your next delivery on schedule.
      </EmailParagraph>
    </EmailLayout>
  );
}
