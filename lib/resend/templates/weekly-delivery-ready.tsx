import {
  EmailButton,
  EmailLayout,
  EmailList,
  EmailParagraph,
} from "@/lib/resend/templates/shared";

export type WeeklyDeliveryReadyEmailProps = {
  cohortName: string;
  cohortUrl: string;
  deliveryWeekLabel: string;
  draftReadyCount: number;
  firstName: string;
  premiumOpportunityCount: number;
  recipientEmail: string;
  reviewedOpportunityCount: number;
  smtpSafeCount: number;
};

export function getWeeklyDeliveryReadyEmailSubject(firstName: string) {
  return `Your weekly Frithly delivery is ready, ${firstName}`;
}

export function getWeeklyDeliveryReadyEmailText({
  cohortName,
  cohortUrl,
  deliveryWeekLabel,
  draftReadyCount,
  firstName,
  premiumOpportunityCount,
  reviewedOpportunityCount,
  smtpSafeCount,
}: WeeklyDeliveryReadyEmailProps) {
  return [
    `Hey ${firstName},`,
    "",
    `${deliveryWeekLabel} is ready in Frithly.`,
    "",
    `This week's package, ${cohortName}, is now available to review.`,
    "",
    "What is inside:",
    `- ${reviewedOpportunityCount} reviewed opportunities`,
    `- ${premiumOpportunityCount} premium opportunities`,
    `- ${smtpSafeCount} SMTP-safe contacts`,
    `- ${draftReadyCount} outreach-ready drafts`,
    "",
    `Open your delivery: ${cohortUrl}`,
    "",
    "Reply if you want us to tune next week's delivery around a different ICP, city, or offer.",
  ].join("\n");
}

export function WeeklyDeliveryReadyEmail(props: WeeklyDeliveryReadyEmailProps) {
  return (
    <EmailLayout
      preview={`${props.deliveryWeekLabel} is ready in Frithly.`}
      recipientEmail={props.recipientEmail}
      title={`Your weekly delivery is ready, ${props.firstName}`}
    >
      <EmailParagraph>Hey {props.firstName},</EmailParagraph>
      <EmailParagraph>
        {props.deliveryWeekLabel} is ready in Frithly. This week&apos;s package,{" "}
        {props.cohortName}, is now available to review.
      </EmailParagraph>
      <EmailButton href={props.cohortUrl} label="Open this week's delivery" />
      <EmailList
        items={[
          `${props.reviewedOpportunityCount} reviewed opportunities`,
          `${props.premiumOpportunityCount} premium opportunities`,
          `${props.smtpSafeCount} SMTP-safe contacts`,
          `${props.draftReadyCount} outreach-ready drafts`,
        ]}
      />
      <EmailParagraph>
        Reply if you want us to tune next week&apos;s delivery around a different ICP, city, or
        offer.
      </EmailParagraph>
    </EmailLayout>
  );
}
