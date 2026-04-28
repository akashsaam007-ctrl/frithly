import { EmailLayout, EmailList, EmailParagraph } from "@/lib/resend/templates/shared";

export type SampleRequestAlertEmailProps = {
  company?: string | null;
  companySize?: string | null;
  email: string;
  frustration: string;
  fullName: string;
  geography?: string | null;
  industry?: string | null;
  recipientEmail: string;
  targetRole?: string | null;
};

export function SampleRequestAlertEmail(props: SampleRequestAlertEmailProps) {
  return (
    <EmailLayout
      preview={`New sample request from ${props.fullName}`}
      recipientEmail={props.recipientEmail}
      title="New sample request"
    >
      <EmailList
        items={[
          `Name: ${props.fullName}`,
          `Email: ${props.email}`,
          `Company: ${props.company ?? "Not provided"}`,
          `Industry: ${props.industry ?? "Not provided"}`,
          `Target role: ${props.targetRole ?? "Not provided"}`,
          `Company size: ${props.companySize ?? "Not provided"}`,
          `Geography: ${props.geography ?? "Not provided"}`,
        ]}
      />
      <EmailParagraph>{props.frustration}</EmailParagraph>
    </EmailLayout>
  );
}
