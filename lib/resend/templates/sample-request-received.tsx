import { EmailLayout, EmailMuted, EmailParagraph } from "@/lib/resend/templates/shared";

export type SampleRequestReceivedEmailProps = {
  firstName: string;
  recipientEmail: string;
};

export function getSampleRequestReceivedEmailSubject() {
  return "We received your Frithly sample request";
}

export function getSampleRequestReceivedEmailText({
  firstName,
}: SampleRequestReceivedEmailProps) {
  return [
    `Hey ${firstName},`,
    "",
    "We received your request for a free 5-lead Frithly sample.",
    "",
    "Our team is reviewing your ICP now. We will send your sample within 48 hours with researched leads, why-now context, and opener ideas.",
    "",
    "If there is anything urgent we should know, just reply to this email.",
    "",
    "Frithly",
  ].join("\n");
}

export function SampleRequestReceivedEmail(props: SampleRequestReceivedEmailProps) {
  return (
    <EmailLayout
      preview="Your Frithly sample request is in and our team is reviewing it now."
      recipientEmail={props.recipientEmail}
      title="Your Frithly sample request is in"
    >
      <EmailParagraph>Hey {props.firstName},</EmailParagraph>
      <EmailParagraph>
        We received your request for a free 5-lead Frithly sample.
      </EmailParagraph>
      <EmailMuted>
        Our team is reviewing your ICP now. We will send your sample within 48 hours with
        researched leads, why-now context, and opener ideas.
      </EmailMuted>
      <EmailParagraph>If there is anything urgent we should know, just reply here.</EmailParagraph>
    </EmailLayout>
  );
}
