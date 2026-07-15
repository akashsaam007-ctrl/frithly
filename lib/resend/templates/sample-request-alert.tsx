import { EmailLayout, EmailList, EmailParagraph } from "@/lib/resend/templates/shared";

export type SampleRequestAlertEmailProps = {
  additionalRequirements?: string | null;
  companySizes: string[];
  companyWebsite: string;
  email: string;
  fullName: string;
  offerDescription: string;
  recipientEmail: string;
  requestId: string;
  submittedAt: string;
  targetDescription: string;
  targetRegions: string[];
  whatsapp?: string | null;
};

export function SampleRequestAlertEmail(props: SampleRequestAlertEmailProps) {
  return (
    <EmailLayout
      preview={`New personalized sample request from ${props.fullName}`}
      recipientEmail={props.recipientEmail}
      title="New personalized sample request"
    >
      <EmailList
        items={[
          `Request ID: ${props.requestId}`,
          `Full name: ${props.fullName}`,
          `Work email: ${props.email}`,
          `Company website: ${props.companyWebsite}`,
          `WhatsApp: ${props.whatsapp ?? "Not provided"}`,
          `Target regions: ${props.targetRegions.join(", ")}`,
          `Company sizes: ${props.companySizes.join(", ")}`,
          `Submitted at: ${props.submittedAt}`,
          "Meeting status: not_scheduled",
        ]}
      />
      <EmailParagraph>
        <strong>What the company sells</strong>
      </EmailParagraph>
      <EmailParagraph>{props.offerDescription}</EmailParagraph>
      <EmailParagraph>
        <strong>Who they want to target</strong>
      </EmailParagraph>
      <EmailParagraph>{props.targetDescription}</EmailParagraph>
      {props.additionalRequirements ? (
        <>
          <EmailParagraph>
            <strong>Additional requirements</strong>
          </EmailParagraph>
          <EmailParagraph>{props.additionalRequirements}</EmailParagraph>
        </>
      ) : null}
    </EmailLayout>
  );
}
