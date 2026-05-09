import { EmailLayout, EmailMuted, EmailParagraph } from "@/lib/resend/templates/shared";

export type CampaignApplicationReceivedEmailProps = {
  firstName: string;
  recipientEmail: string;
};

export function getCampaignApplicationReceivedEmailSubject() {
  return "We received your Frithly campaign application";
}

export function getCampaignApplicationReceivedEmailText({
  firstName,
}: CampaignApplicationReceivedEmailProps) {
  return [
    `Hey ${firstName},`,
    "",
    "We received your Frithly campaign application.",
    "",
    "Our team is reviewing your ICP, quality thresholds, geography, and outbound context now. If there is a fit, we will come back with the recommended campaign shape and the best next step.",
    "",
    "You can expect a response within one business day.",
    "",
    "Frithly",
  ].join("\n");
}

export function CampaignApplicationReceivedEmail(
  props: CampaignApplicationReceivedEmailProps,
) {
  return (
    <EmailLayout
      preview="Your Frithly campaign application is in and under review."
      recipientEmail={props.recipientEmail}
      title="Your campaign application is in"
    >
      <EmailParagraph>Hey {props.firstName},</EmailParagraph>
      <EmailParagraph>We received your Frithly campaign application.</EmailParagraph>
      <EmailMuted>
        Our team is reviewing your ICP, quality thresholds, geography, and outbound context now.
        If there is a fit, we will reply with the recommended campaign shape and best next step.
      </EmailMuted>
      <EmailParagraph>You can expect a response within one business day.</EmailParagraph>
    </EmailLayout>
  );
}
