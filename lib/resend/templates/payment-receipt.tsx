import { formatLongDate } from "@/lib/utils";
import { EmailButton, EmailLayout, EmailParagraph } from "@/lib/resend/templates/shared";

export type PaymentReceiptEmailProps = {
  amountLabel: string;
  firstName: string;
  invoiceUrl?: string | null;
  paidAt: string;
  planName: string;
  recipientEmail: string;
};

export function getPaymentReceiptEmailSubject(planName: string) {
  return `${planName} payment received`;
}

export function getPaymentReceiptEmailText({
  amountLabel,
  firstName,
  invoiceUrl,
  paidAt,
  planName,
}: PaymentReceiptEmailProps) {
  return [
    `Hey ${firstName},`,
    "",
    `We received your ${amountLabel} payment for the ${planName} plan on ${formatLongDate(paidAt)}.`,
    invoiceUrl ? `Invoice: ${invoiceUrl}` : "",
    "",
    "Thank you for building with Frithly.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function PaymentReceiptEmail(props: PaymentReceiptEmailProps) {
  return (
    <EmailLayout
      preview="Your Frithly payment was received successfully."
      recipientEmail={props.recipientEmail}
      title="Payment received"
    >
      <EmailParagraph>Hey {props.firstName},</EmailParagraph>
      <EmailParagraph>
        We received your {props.amountLabel} payment for the {props.planName} plan on{" "}
        {formatLongDate(props.paidAt)}.
      </EmailParagraph>
      {props.invoiceUrl ? <EmailButton href={props.invoiceUrl} label="View invoice" /> : null}
      <EmailParagraph>Thank you for building with Frithly.</EmailParagraph>
    </EmailLayout>
  );
}
