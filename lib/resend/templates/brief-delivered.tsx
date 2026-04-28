import {
  EmailButton,
  EmailLayout,
  EmailList,
  EmailParagraph,
} from "@/lib/resend/templates/shared";

export type BriefDeliveredEmailProps = {
  batchUrl: string;
  firstName: string;
  founderName: string;
  highConfidenceLeadCount: number;
  leadCount: number;
  recentActivityLeadCount: number;
  recipientEmail: string;
  verifiedEmails: number;
};

export function getBriefDeliveredEmailSubject(firstName: string) {
  return `Your Frithly brief is ready, ${firstName}`;
}

export function getBriefDeliveredEmailText({
  batchUrl,
  firstName,
  founderName,
  highConfidenceLeadCount,
  leadCount,
  recentActivityLeadCount,
  verifiedEmails,
}: BriefDeliveredEmailProps) {
  return [
    `Hey ${firstName},`,
    "",
    "Your Monday brief is ready.",
    "",
    `${leadCount} hyper-researched leads, fully briefed, with personalized openers ready to send.`,
    "",
    `View your brief: ${batchUrl}`,
    "",
    "Quick stats:",
    `- ${verifiedEmails} verified emails`,
    `- ${highConfidenceLeadCount} leads with high-confidence trigger signals`,
    `- ${recentActivityLeadCount} leads with very recent activity`,
    "",
    "Have a great week of meetings.",
    "",
    `- ${founderName}`,
    "Founder, Frithly",
  ].join("\n");
}

export function BriefDeliveredEmail(props: BriefDeliveredEmailProps) {
  return (
    <EmailLayout
      preview="Your Monday Frithly brief is ready to send."
      recipientEmail={props.recipientEmail}
      title={`Your Frithly brief is ready, ${props.firstName}`}
    >
      <EmailParagraph>Hey {props.firstName},</EmailParagraph>
      <EmailParagraph>Your Monday brief is ready.</EmailParagraph>
      <EmailParagraph>
        {props.leadCount} hyper-researched leads, fully briefed, with personalized openers ready
        to send.
      </EmailParagraph>
      <EmailButton href={props.batchUrl} label="View your brief" />
      <EmailList
        items={[
          `${props.verifiedEmails} verified emails`,
          `${props.highConfidenceLeadCount} leads with high-confidence trigger signals`,
          `${props.recentActivityLeadCount} leads with very recent activity`,
        ]}
      />
      <EmailParagraph>Have a great week of meetings.</EmailParagraph>
      <EmailParagraph>
        - {props.founderName}
        <br />
        Founder, Frithly
      </EmailParagraph>
    </EmailLayout>
  );
}
