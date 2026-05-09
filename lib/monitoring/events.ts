export type AnalyticsEventName =
  | "account_settings_viewed"
  | "analytics_viewed"
  | "apply_flow_completed"
  | "apply_flow_started"
  | "apply_flow_submitted"
  | "apply_flow_viewed"
  | "brief_viewed"
  | "campaign_detail_viewed"
  | "campaigns_viewed"
  | "cohort_detail_viewed"
  | "cohorts_viewed"
  | "cta_clicked"
  | "dashboard_viewed"
  | "draft_detail_viewed"
  | "drafts_viewed"
  | "exports_viewed"
  | "feedback_submitted"
  | "icp_demo_completed"
  | "icp_demo_started"
  | "icp_demo_viewed"
  | "landing_page_viewed"
  | "pricing_section_viewed"
  | "recommendation_detail_viewed"
  | "recommendations_viewed"
  | "roi_calculator_updated"
  | "roi_calculator_viewed"
  | "sample_form_completed"
  | "sample_form_submitted"
  | "signup_completed"
  | "signup_started"
  | "smtp_detail_viewed"
  | "smtp_viewed";

export type AnalyticsEventProperties = Record<
  string,
  boolean | number | string | null | undefined
>;
