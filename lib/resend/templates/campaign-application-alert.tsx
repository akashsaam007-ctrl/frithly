import { EmailLayout, EmailList, EmailParagraph } from "@/lib/resend/templates/shared";

export type CampaignApplicationAlertEmailProps = {
  averageClientValueLabel: string;
  company: string;
  companySize: string;
  currentChallenges: string;
  email: string;
  founderConfidenceMin: number;
  fullName: string;
  geography: string;
  industry: string;
  leadGoal: number;
  linkedinProfile?: string | null;
  minimumScore: number;
  outboundMaturity: string;
  preferredContactMethod: "email" | "linkedin" | "telegram" | "whatsapp";
  recipientEmail: string;
  requiredContactability: string;
  role?: string | null;
  services: string[];
  storage: string;
  successDefinition?: string | null;
  telegramHandle?: string | null;
  targetTitles: string[];
  whatsappNumber: string;
  website?: string | null;
};

export function CampaignApplicationAlertEmail(props: CampaignApplicationAlertEmailProps) {
  return (
    <EmailLayout
      preview={`New campaign application from ${props.fullName}`}
      recipientEmail={props.recipientEmail}
      title="New campaign application"
    >
      <EmailList
        items={[
          `Name: ${props.fullName}`,
          `Email: ${props.email}`,
          `Company: ${props.company}`,
          `Role: ${props.role ?? "Not provided"}`,
          `Website: ${props.website ?? "Not provided"}`,
          `LinkedIn: ${props.linkedinProfile ?? "Not provided"}`,
          `WhatsApp: ${props.whatsappNumber}`,
          `Preferred contact method: ${props.preferredContactMethod}`,
          `Telegram: ${props.telegramHandle ?? "Not provided"}`,
          `Industry: ${props.industry}`,
          `Geography: ${props.geography}`,
          `Company size: ${props.companySize}`,
          `Lead goal: ${props.leadGoal}`,
          `Minimum score: ${props.minimumScore}`,
          `Required contactability: ${props.requiredContactability}`,
          `Founder confidence min: ${props.founderConfidenceMin}`,
          `Average client value: ${props.averageClientValueLabel}`,
          `Outbound maturity: ${props.outboundMaturity}`,
          `Target titles: ${props.targetTitles.length > 0 ? props.targetTitles.join(", ") : "Not provided"}`,
          `Services: ${props.services.length > 0 ? props.services.join(", ") : "Not provided"}`,
          `Stored in: ${props.storage}`,
        ]}
      />
      <EmailParagraph>{props.currentChallenges}</EmailParagraph>
      {props.successDefinition ? <EmailParagraph>{props.successDefinition}</EmailParagraph> : null}
    </EmailLayout>
  );
}
