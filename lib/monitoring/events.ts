export type AnalyticsEventName =
  | "brief_viewed"
  | "cta_clicked"
  | "dashboard_viewed"
  | "feedback_submitted"
  | "landing_page_viewed"
  | "pricing_section_viewed"
  | "sample_form_completed"
  | "sample_form_submitted"
  | "signup_completed"
  | "signup_started";

export type AnalyticsEventProperties = Record<
  string,
  boolean | number | string | null | undefined
>;
