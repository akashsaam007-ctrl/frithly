import type { CSSProperties, ReactNode } from "react";
import { APP_NAME, APP_TAGLINE, SUPPORT_EMAIL } from "@/lib/constants";

const styles = {
  body: {
    backgroundColor: "#faf8f5",
    color: "#1A1A1A",
    fontFamily: "Inter, Arial, sans-serif",
    margin: 0,
    padding: "24px 12px",
  } satisfies CSSProperties,
  button: {
    backgroundColor: "#D4623A",
    borderRadius: "12px",
    color: "#FFFFFF",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 700,
    padding: "14px 20px",
    textDecoration: "none",
  } satisfies CSSProperties,
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E4DD",
    borderRadius: "24px",
    margin: "0 auto",
    maxWidth: "600px",
    padding: "32px",
  } satisfies CSSProperties,
  eyebrow: {
    color: "#D4623A",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    margin: 0,
    textTransform: "uppercase",
  } satisfies CSSProperties,
  footer: {
    color: "#6B6B6B",
    fontSize: "13px",
    lineHeight: 1.7,
    marginTop: "32px",
  } satisfies CSSProperties,
  heading: {
    color: "#1A1A1A",
    fontSize: "30px",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    margin: "16px 0",
  } satisfies CSSProperties,
  list: {
    color: "#1A1A1A",
    lineHeight: 1.7,
    margin: "16px 0",
    paddingLeft: "20px",
  } satisfies CSSProperties,
  muted: {
    color: "#6B6B6B",
    fontSize: "15px",
    lineHeight: 1.7,
    margin: "12px 0",
  } satisfies CSSProperties,
  paragraph: {
    color: "#1A1A1A",
    fontSize: "16px",
    lineHeight: 1.7,
    margin: "12px 0",
  } satisfies CSSProperties,
  preview: {
    color: "#faf8f5",
    display: "none",
    fontSize: "1px",
    lineHeight: "1px",
    maxHeight: "0",
    maxWidth: "0",
    opacity: 0,
    overflow: "hidden",
  } satisfies CSSProperties,
  rule: {
    borderTop: "1px solid #E8E4DD",
    margin: "24px 0",
  } satisfies CSSProperties,
} as const;

function buildUnsubscribeHref(recipientEmail: string) {
  const subject = encodeURIComponent(`${APP_NAME} unsubscribe request`);
  const body = encodeURIComponent(
    `Please unsubscribe ${recipientEmail} from future Frithly emails.`,
  );

  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

export function EmailLayout({
  children,
  preview,
  recipientEmail,
  title,
}: {
  children: ReactNode;
  preview: string;
  recipientEmail: string;
  title: string;
}) {
  return (
    <html lang="en">
      <body style={styles.body}>
        <div style={styles.preview}>{preview}</div>
        <div style={styles.card}>
          <p style={styles.eyebrow}>{APP_NAME}</p>
          <p style={{ ...styles.muted, marginTop: "4px" }}>{APP_TAGLINE}</p>
          <h1 style={styles.heading}>{title}</h1>
          {children}
          <div style={styles.rule} />
          <div style={styles.footer}>
            <p style={{ margin: "0 0 12px" }}>
              Reply to this email or write to{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "#D4623A" }}>
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
            <p style={{ margin: 0 }}>
              Need fewer emails?{" "}
              <a href={buildUnsubscribeHref(recipientEmail)} style={{ color: "#D4623A" }}>
                Unsubscribe here
              </a>
              .
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

export function EmailButton({ href, label }: { href: string; label: string }) {
  return (
    <p style={{ margin: "24px 0" }}>
      <a href={href} style={styles.button}>
        {label}
      </a>
    </p>
  );
}

export function EmailList({ items }: { items: string[] }) {
  return (
    <ul style={styles.list}>
      {items.map((item) => (
        <li key={item} style={{ marginBottom: "8px" }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function EmailMuted({ children }: { children: ReactNode }) {
  return <p style={styles.muted}>{children}</p>;
}

export function EmailParagraph({ children }: { children: ReactNode }) {
  return <p style={styles.paragraph}>{children}</p>;
}
