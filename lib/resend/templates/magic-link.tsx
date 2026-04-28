import { EmailButton, EmailLayout, EmailParagraph } from "@/lib/resend/templates/shared";

export type MagicLinkEmailProps = {
  firstName: string;
  loginUrl: string;
  recipientEmail: string;
};

export function getMagicLinkEmailSubject() {
  return "Your Frithly login link";
}

export function getMagicLinkEmailText({ firstName, loginUrl }: MagicLinkEmailProps) {
  return [
    `Hey ${firstName},`,
    "",
    "Use the secure link below to log in to Frithly.",
    "",
    loginUrl,
    "",
    "If you did not request this link, you can ignore this email.",
    "",
    "Frithly",
  ].join("\n");
}

export function MagicLinkEmail(props: MagicLinkEmailProps) {
  return (
    <EmailLayout
      preview="Use this secure Frithly login link."
      recipientEmail={props.recipientEmail}
      title="Your Frithly login link"
    >
      <EmailParagraph>Hey {props.firstName},</EmailParagraph>
      <EmailParagraph>Use the secure link below to log in to Frithly.</EmailParagraph>
      <EmailButton href={props.loginUrl} label="Log in to Frithly" />
      <EmailParagraph>If you did not request this link, you can ignore this email.</EmailParagraph>
    </EmailLayout>
  );
}
