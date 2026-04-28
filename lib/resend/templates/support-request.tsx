import { EmailLayout, EmailList, EmailParagraph } from "@/lib/resend/templates/shared";

export type SupportRequestEmailProps = {
  companyName?: string | null;
  customerEmail: string;
  customerName: string;
  message: string;
  recipientEmail: string;
  subject: string;
};

export function SupportRequestEmail(props: SupportRequestEmailProps) {
  return (
    <EmailLayout
      preview={`Support request from ${props.customerName}`}
      recipientEmail={props.recipientEmail}
      title="New Frithly support request"
    >
      <EmailList
        items={[
          `Customer: ${props.customerName}`,
          `Email: ${props.customerEmail}`,
          `Company: ${props.companyName ?? "Not provided"}`,
          `Subject: ${props.subject}`,
        ]}
      />
      <EmailParagraph>{props.message}</EmailParagraph>
    </EmailLayout>
  );
}
