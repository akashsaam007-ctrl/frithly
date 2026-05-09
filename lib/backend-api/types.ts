export type BackendContactabilityTier = "premium" | "strong" | "medium" | "low" | "unknown";

export type BackendCampaignCreateRequest = {
  campaign_name: string;
  client_name?: string | null;
  industry: string;
  countries: string[];
  cities: string[];
  employee_range?: string | null;
  minimum_score: number;
  lead_goal: number;
  required_contactability: "premium" | "strong" | "medium" | "low";
  founder_confidence_min: number;
  services: string[];
  technologies: string[];
  exclude: string[];
};

export type BackendCampaignRead = {
  id: number;
  name: string;
  client_name?: string | null;
  industry?: string | null;
  countries: string[];
  cities: string[];
  minimum_score: number;
  lead_goal: number;
  status: string;
  requested_leads: number;
  generated_leads: number;
  qualified_leads: number;
  average_score: number;
  premium_leads: number;
  send_ready_leads: number;
  created_at: string;
  updated_at: string;
};

export type BackendCampaignRule = {
  id: number;
  rule_type: string;
  rule_value: Record<string, unknown>;
};

export type BackendCampaignLead = {
  company_id: number;
  company_name: string;
  status: string;
  recommendation_score: number | null;
  lead_score: number;
  founder_name?: string | null;
  founder_email?: string | null;
  founder_confidence?: number | null;
  contactability: BackendContactabilityTier | string;
  services: string[];
  tech_stack: string[];
  source_query?: string | null;
  lead_metadata: Record<string, unknown>;
};

export type BackendCampaignDetail = {
  campaign: BackendCampaignRead;
  rules: BackendCampaignRule[];
  progress: Record<string, unknown>;
  query_plan: Record<string, unknown>[];
  leads: BackendCampaignLead[];
};

export type BackendRecommendation = {
  id: number;
  company_id: number;
  contact_id?: number | null;
  company_name: string;
  founder_name?: string | null;
  founder_role?: string | null;
  founder_email?: string | null;
  lead_score: number;
  recommendation_score: number;
  reason?: string | null;
  founder_confidence?: number | null;
  contactability?: string | null;
  domain_priority?: number | null;
  freshness?: number | null;
  city?: string | null;
  niche?: string | null;
  last_enrichment?: string | null;
  smtp_state?: string | null;
  reviewed: boolean;
  approved: boolean;
  source_query?: string | null;
  domain?: string | null;
  updated_at: string;
};

export type BackendRecommendationListResponse = {
  items: BackendRecommendation[];
  stats: Record<string, unknown>;
};

export type BackendRecommendationGenerateResponse = {
  generated_at: string;
  total_candidates: number;
  total_saved: number;
  triggered_by: string;
};

export type BackendDraft = {
  id: number;
  company_id: number;
  contact_id?: number | null;
  company_name?: string | null;
  founder_name?: string | null;
  founder_email?: string | null;
  status: string;
  subject_line?: string | null;
  first_line?: string | null;
  short_pitch?: string | null;
  cta?: string | null;
  full_body?: string | null;
  lead_score?: number;
  recommendation_score?: number | null;
  generated_with_ai?: boolean | null;
  model_name?: string | null;
  reviewer?: string | null;
  review_notes?: string | null;
  reviewed_at?: string | null;
  updated_at: string;
  [key: string]: unknown;
};

export type BackendDraftListResponse = {
  items: BackendDraft[];
  total: number;
  approved: number;
  pending_review: number;
  ai_generated: number;
};

export type BackendDraftGenerateResponse = {
  generated_at: string;
  total_saved: number;
  total_updated: number;
  triggered_by: string;
};

export type BackendLeadSummary = {
  company_id: number;
  company_name: string;
  domain?: string | null;
  website?: string | null;
  source_query?: string | null;
  category?: string | null;
  country?: string | null;
  score: number;
  score_band?: "premium" | "usable" | "low_priority";
  export_ready?: boolean;
  contactability_tier: string;
  founder_name?: string | null;
  founder_role?: string | null;
  founder_confidence?: number | null;
  founder_email?: string | null;
  founder_email_confidence?: number | null;
  founder_email_status?: string | null;
  founder_email_observed?: boolean;
  smtp_validation_status?: string | null;
  smtp_checked_at?: string | null;
  smtp_probe_attempted?: boolean;
  linkedin_url?: string | null;
  contact_page?: string | null;
  generic_email_only?: boolean;
  services: string[];
  tech_stack: string[];
  review: {
    status: "pending" | "approved" | "rejected";
    reviewer?: string | null;
    notes?: string | null;
    selected_email?: string | null;
    selected_contact_id?: number | null;
    confidence_override?: number | null;
    reviewed_at?: string | null;
  };
  outbound_status?: string | null;
  outbound_campaign?: string | null;
  updated_at?: string;
  [key: string]: unknown;
};

export type BackendLeadListResponse = {
  items: BackendLeadSummary[];
  stats: Record<string, unknown>;
};

export type BackendLeadDetailResponse = {
  summary: BackendLeadSummary;
  contactability: Record<string, unknown>;
  founder_candidates: Record<string, unknown>;
  contacts: Record<string, unknown>[];
  emails: Record<string, unknown>[];
  services: string[];
  tech_stack: string[];
  about_text?: string | null;
  ai_summary?: string | null;
  pain_points: string[];
  outreach_angle?: string | null;
  quality_signals: Record<string, unknown>;
  lead_score_breakdown: Record<string, number>;
  lead_score_reasons: string[];
  smtp_validation: Record<string, unknown>;
  outbound: Record<string, unknown>;
  [key: string]: unknown;
};

export type BackendAnalyticsResponse = Record<string, unknown>;

export type BackendDeliveryChecklist = {
  total_members: number;
  reviewed_members: number;
  premium_members: number;
  approved_drafts: number;
  smtp_safe_members: number;
  smtp_failure_members: number;
  export_ready_members: number;
  customer_assigned: boolean;
  recommendations_reviewed: boolean;
  drafts_approved: boolean;
  smtp_safe_validated: boolean;
  exports_generated: boolean;
  cohort_finalized: boolean;
  qa_confirmed: boolean;
  all_checks_passed: boolean;
};

export type BackendCohort = {
  name: string;
  channel?: string | null;
  status: string;
  delivery_state: "preparing" | "reviewing" | "approved" | "scheduled" | "delivered";
  total_members: number;
  sent_count: number;
  replied_count: number;
  positive_reply_count: number;
  bounced_count: number;
  meeting_count: number;
  sending_domain?: string | null;
  sender_inbox?: string | null;
  organization_name?: string | null;
  organization_external_customer_id?: string | null;
  delivery_notes?: string | null;
  delivery_week?: string | null;
  delivery_week_label?: string | null;
  scheduled_for?: string | null;
  delivered_at?: string | null;
  approved_at?: string | null;
  reviewed_at?: string | null;
  delivery_email_status?: string | null;
  delivery_email_sent_at?: string | null;
  release_ready: boolean;
  checklist: BackendDeliveryChecklist;
  priority_score: number;
  blocked: boolean;
  blockers: string[];
  blocker_tags: string[];
  review_owner?: string | null;
  ops_notes?: string | null;
  qa_confirmed: boolean;
  qa_confirmed_at?: string | null;
  qa_confirmed_by?: string | null;
  qa_notes?: string | null;
  premium_density: number;
  smtp_safe_rate: number;
  review_completion_rate: number;
  draft_ready_rate: number;
  average_lead_score: number;
  average_founder_confidence: number;
  high_confidence_founder_count: number;
  time_to_review_hours?: number | null;
  time_to_approval_hours?: number | null;
  time_to_delivery_hours?: number | null;
  time_to_export_hours?: number | null;
  delivered_on_time?: boolean | null;
  created_at?: string | null;
  last_run_at?: string | null;
};

export type BackendCohortMember = {
  company_id: number;
  company_name: string;
  campaign_id: number;
  status: string;
  selected_email?: string | null;
  founder_name?: string | null;
  score: number;
  contactability_tier: string;
  source_query?: string | null;
  review_status?: string | null;
  latest_signal?: string | null;
  last_event_at?: string | null;
};

export type BackendCohortDetailResponse = {
  cohort: BackendCohort;
  members: BackendCohortMember[];
};

export type BackendDeliveryReleaseResponse = {
  released_at: string;
  released_count: number;
  released_names: string[];
  triggered_by: string;
};
