import { EmailLayout, EmailMuted, EmailParagraph } from "@/lib/resend/templates/shared";

export type SampleRequestReceivedEmailProps = {
  bookingLink: string;
  firstName: string;
  recipientEmail: string;
  requestId: string;
};

export function getSampleRequestReceivedEmailSubject() {
  return "We received your Frithly sample request";
}

export function getSampleRequestReceivedEmailText({
  bookingLink,
  firstName,
  requestId,
}: SampleRequestReceivedEmailProps) {
  return [
    `Hi ${firstName},`,
    "",
    "We have received your personalized lead sample request. Our research team will review your company, target market, and requirements before preparing the sample.",
    "",
    `Request ID: ${requestId}`,
    "",
    `You can schedule your video review here: ${bookingLink}`,
    "",
    "During the call, we will explain the companies selected, the relevant buying signals, and the targeting logic behind the sample.",
    "",
    "Frithly",
  ].join("\n");
}

export function SampleRequestReceivedEmail(props: SampleRequestReceivedEmailProps) {
  return (
    <EmailLayout
      preview="We received your Frithly sample request."
      recipientEmail={props.recipientEmail}
      title="We received your Frithly sample request"
    >
      <EmailParagraph>Hi {props.firstName},</EmailParagraph>
      <EmailParagraph>
        We have received your personalized lead sample request. Our research team will review your
        company, target market, and requirements before preparing the sample.
      </EmailParagraph>
      <EmailMuted>Request ID: {props.requestId}</EmailMuted>
      <EmailParagraph>
        You can schedule your video review here:{" "}
        <a href={props.bookingLink}>{props.bookingLink}</a>
      </EmailParagraph>
      <EmailParagraph>
        During the call, we will explain the companies selected, the relevant buying signals, and
        the targeting logic behind the sample.
      </EmailParagraph>
    </EmailLayout>
  );
}
