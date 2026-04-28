import { EmailButton, EmailLayout, EmailParagraph } from "@/lib/resend/templates/shared";

export type SampleDeliveryEmailProps = {
  firstName: string;
  leadCount: number;
  recipientEmail: string;
  sampleUrl: string;
};

export function getSampleDeliveryEmailSubject() {
  return "Your Frithly sample is ready";
}

export function getSampleDeliveryEmailText({
  firstName,
  leadCount,
  sampleUrl,
}: SampleDeliveryEmailProps) {
  return [
    `Hey ${firstName},`,
    "",
    `Your Frithly sample is ready. We researched ${leadCount} leads with context and personalized opener ideas for your team.`,
    "",
    `Review your sample: ${sampleUrl}`,
    "",
    "Reply with what feels on-target, what misses, and what you want us to tune next.",
    "",
    "Frithly",
  ].join("\n");
}

export function SampleDeliveryEmail(props: SampleDeliveryEmailProps) {
  return (
    <EmailLayout
      preview="Your researched Frithly sample is ready to review."
      recipientEmail={props.recipientEmail}
      title="Your Frithly sample is ready"
    >
      <EmailParagraph>Hey {props.firstName},</EmailParagraph>
      <EmailParagraph>
        We researched {props.leadCount} leads with context and personalized opener ideas for your
        team.
      </EmailParagraph>
      <EmailButton href={props.sampleUrl} label="Review your sample" />
      <EmailParagraph>
        Reply with what feels on-target, what misses, and what you want us to tune next.
      </EmailParagraph>
    </EmailLayout>
  );
}
