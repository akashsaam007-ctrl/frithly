import "server-only";

import { createHmac } from "node:crypto";
import { env } from "@/lib/utils/env";
import type {
  BackendAnalyticsResponse,
  BackendCampaignCreateRequest,
  BackendCampaignDetail,
  BackendCampaignRead,
  BackendCohortDetailResponse,
  BackendCohortMember,
  BackendCohort,
  BackendDeliveryReleaseResponse,
  BackendDraft,
  BackendDraftGenerateResponse,
  BackendDraftListResponse,
  BackendLeadDetailResponse,
  BackendLeadListResponse,
  BackendRecommendationGenerateResponse,
  BackendRecommendationListResponse,
} from "@/lib/backend-api/types";

const DEFAULT_TIMEOUT_MS = 60_000;
const LONG_RUNNING_TIMEOUT_MS = 90 * 60_000;

export class BackendApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
    this.payload = payload;
  }
}

type QueryValue = boolean | number | string | null | undefined;

export type BackendTenantScope = {
  customerId: string;
  organizationName: string;
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown>;
  query?: Record<string, QueryValue>;
  tenant?: BackendTenantScope;
  timeoutMs?: number;
};

function getBackendBaseUrl() {
  const baseUrl = env.LEADGEN_BACKEND_API_URL?.trim();

  if (!baseUrl) {
    throw new Error(
      "LEADGEN_BACKEND_API_URL is not configured. Point the product shell at the FastAPI backend before using backend-powered lead generation.",
    );
  }

  return baseUrl.replace(/\/+$/, "");
}

function buildUrl(pathname: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${getBackendBaseUrl()}${pathname}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function backendRequest<T>(pathname: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, method, query, tenant, timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = options;
  const response = await fetch(buildUrl(pathname, query), {
    ...rest,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...buildTenantHeaders(tenant),
      ...headers,
    },
    method: method ?? (body ? "POST" : "GET"),
    signal: AbortSignal.timeout(timeoutMs),
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload && "detail" in payload
        ? String((payload as { detail?: unknown }).detail ?? "")
        : typeof payload === "object" && payload && "error" in payload
          ? String((payload as { error?: unknown }).error ?? "")
          : response.statusText;

    throw new BackendApiError(
      detail || `Backend request failed with HTTP ${response.status}`,
      response.status,
      payload,
    );
  }

  return payload as T;
}

async function backendDownload(
  pathname: string,
  query?: Record<string, QueryValue>,
  tenant?: BackendTenantScope,
): Promise<{
  contentType: string | null;
  data: Buffer;
  disposition: string | null;
}> {
  const response = await fetch(buildUrl(pathname, query), {
    cache: "no-store",
    headers: {
      Accept: "*/*",
      "ngrok-skip-browser-warning": "true",
      ...buildTenantHeaders(tenant),
    },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });

  if (!response.ok) {
    const payload = await parseResponse(response);
    const detail =
      typeof payload === "object" && payload && "detail" in payload
        ? String((payload as { detail?: unknown }).detail ?? "")
        : response.statusText;
    throw new BackendApiError(
      detail || `Backend download failed with HTTP ${response.status}`,
      response.status,
      payload,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    contentType: response.headers.get("content-type"),
    data: Buffer.from(arrayBuffer),
    disposition: response.headers.get("content-disposition"),
  };
}

function buildTenantHeaders(tenant?: BackendTenantScope): Record<string, string> {
  if (!tenant) {
    return {};
  }

  const secret = env.LEADGEN_BACKEND_SHARED_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "LEADGEN_BACKEND_SHARED_SECRET is not configured. Add the shared tenant-signing secret before using customer-scoped backend requests.",
    );
  }

  const tenantId = tenant.customerId.trim();
  const tenantName = tenant.organizationName.trim();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac("sha256", secret)
    .update(`${tenantId}:${tenantName}:${timestamp}`)
    .digest("hex");

  return {
    "x-leadgen-tenant-id": tenantId,
    "x-leadgen-tenant-name": tenantName,
    "x-leadgen-tenant-signature": signature,
    "x-leadgen-tenant-ts": timestamp,
  };
}

export const backendApi = {
  campaigns: {
    create(payload: BackendCampaignCreateRequest, tenant?: BackendTenantScope) {
      return backendRequest<BackendCampaignDetail>("/api/v1/ops/campaigns", {
        body: payload,
        method: "POST",
        tenant,
      });
    },
    get(campaignId: number, tenant?: BackendTenantScope) {
      return backendRequest<BackendCampaignDetail>(`/api/v1/ops/campaigns/${campaignId}`, { tenant });
    },
    list(limit = 100, tenant?: BackendTenantScope) {
      return backendRequest<BackendCampaignRead[]>("/api/v1/ops/campaigns", {
        query: { limit },
        tenant,
      });
    },
    launch(campaignId: number, autoStart = true, tenant?: BackendTenantScope) {
      return backendRequest<BackendCampaignDetail>(`/api/v1/ops/campaigns/${campaignId}/launch`, {
        method: "POST",
        query: { auto_start: autoStart },
        tenant,
      });
    },
    run(campaignId: number, tenant?: BackendTenantScope) {
      return backendRequest<BackendCampaignDetail>(`/api/v1/ops/campaigns/${campaignId}/run`, {
        method: "POST",
        tenant,
        timeoutMs: LONG_RUNNING_TIMEOUT_MS,
      });
    },
  },
  recommendations: {
    generate(limit?: number, tenant?: BackendTenantScope) {
      return backendRequest<BackendRecommendationGenerateResponse>("/api/v1/ops/recommendations/generate", {
        method: "POST",
        query: { limit },
        tenant,
      });
    },
    list(options?: { approved?: boolean; limit?: number; reviewed?: boolean; tenant?: BackendTenantScope }) {
      return backendRequest<BackendRecommendationListResponse>("/api/v1/ops/recommendations", {
        query: {
          approved: options?.approved,
          limit: options?.limit ?? 100,
          reviewed: options?.reviewed,
        },
        tenant: options?.tenant,
      });
    },
  },
  drafts: {
    generateApproved(options?: { force?: boolean; limit?: number; tenant?: BackendTenantScope }) {
      return backendRequest<BackendDraftGenerateResponse>("/api/v1/ops/drafts/generate-approved", {
        method: "POST",
        query: {
          force: options?.force,
          limit: options?.limit,
        },
        tenant: options?.tenant,
      });
    },
    generateForCompany(companyId: number, force = true, tenant?: BackendTenantScope) {
      return backendRequest<BackendDraft>(`/api/v1/ops/recommendations/${companyId}/draft`, {
        method: "POST",
        query: { force },
        tenant,
      });
    },
    get(companyId: number, tenant?: BackendTenantScope) {
      return backendRequest<BackendDraft>(`/api/v1/ops/drafts/${companyId}`, { tenant });
    },
    list(options?: { limit?: number; status?: string; tenant?: BackendTenantScope }) {
      return backendRequest<BackendDraftListResponse>("/api/v1/ops/drafts", {
        query: {
          limit: options?.limit ?? 100,
          status: options?.status,
        },
        tenant: options?.tenant,
      });
    },
    update(
      companyId: number,
      payload: Record<string, unknown>,
      tenant?: BackendTenantScope,
    ) {
      return backendRequest<BackendDraft>(`/api/v1/ops/drafts/${companyId}`, {
        body: payload,
        method: "PATCH",
        tenant,
      });
    },
  },
  leads: {
    get(companyId: number, tenant?: BackendTenantScope) {
      return backendRequest<BackendLeadDetailResponse>(`/api/v1/ops/leads/${companyId}`, { tenant });
    },
    list(query?: Record<string, QueryValue>, tenant?: BackendTenantScope) {
      return backendRequest<BackendLeadListResponse>("/api/v1/ops/leads", {
        query,
        tenant,
      });
    },
    review(companyId: number, payload: Record<string, unknown>, tenant?: BackendTenantScope) {
      return backendRequest<BackendLeadDetailResponse>(`/api/v1/ops/leads/${companyId}/review`, {
        body: payload,
        method: "POST",
        tenant,
      });
    },
    validateSmtp(
      companyId: number,
      payload: { email?: string | null; reviewer?: string | null },
      tenant?: BackendTenantScope,
    ) {
      return backendRequest<BackendLeadDetailResponse>(`/api/v1/ops/leads/${companyId}/smtp-validate`, {
        body: payload,
        method: "POST",
        tenant,
      });
    },
  },
  analytics: {
    get(cohortName?: string, tenant?: BackendTenantScope) {
      return backendRequest<BackendAnalyticsResponse>("/api/v1/ops/analytics", {
        query: { cohort_name: cohortName },
        tenant,
      });
    },
  },
  cohorts: {
    create(payload: Record<string, unknown>, tenant?: BackendTenantScope) {
      return backendRequest<BackendCohortDetailResponse>("/api/v1/ops/cohorts", {
        body: payload,
        method: "POST",
        tenant,
      });
    },
    get(name: string, tenant?: BackendTenantScope) {
      return backendRequest<BackendCohortDetailResponse>(`/api/v1/ops/cohorts/${encodeURIComponent(name)}`, {
        tenant,
      });
    },
    list(tenant?: BackendTenantScope) {
      return backendRequest<BackendCohort[]>("/api/v1/ops/cohorts", { tenant });
    },
    updateDeliveryState(
      name: string,
      payload: {
        actor?: string | null;
        notes?: string | null;
        scheduled_for?: string | null;
        state: "preparing" | "reviewing" | "approved" | "scheduled" | "delivered";
      },
      tenant?: BackendTenantScope,
    ) {
      return backendRequest<BackendCohortDetailResponse>(`/api/v1/ops/cohorts/${encodeURIComponent(name)}/delivery-state`, {
        body: payload,
        method: "POST",
        tenant,
      });
    },
    updateWorkflow(
      name: string,
      payload: {
        actor?: string | null;
        review_owner?: string | null;
        ops_notes?: string | null;
        blocker_tags?: string[] | null;
        qa_confirmed?: boolean | null;
        qa_notes?: string | null;
      },
      tenant?: BackendTenantScope,
    ) {
      return backendRequest<BackendCohortDetailResponse>(`/api/v1/ops/cohorts/${encodeURIComponent(name)}/workflow`, {
        body: payload,
        method: "POST",
        tenant,
      });
    },
    markDeliveryEmailSent(name: string, actor?: string, tenant?: BackendTenantScope) {
      return backendRequest<BackendCohortDetailResponse>(`/api/v1/ops/cohorts/${encodeURIComponent(name)}/delivery-email-sent`, {
        method: "POST",
        query: { actor },
        tenant,
      });
    },
    releaseDue(actor?: string, tenant?: BackendTenantScope) {
      return backendRequest<BackendDeliveryReleaseResponse>("/api/v1/ops/deliveries/release-due", {
        method: "POST",
        query: { actor },
        tenant,
      });
    },
    recordSignal(campaignId: number, payload: Record<string, unknown>, tenant?: BackendTenantScope) {
      return backendRequest<BackendCohortMember>(`/api/v1/ops/cohorts/members/${campaignId}/signals`, {
        body: payload,
        method: "POST",
        tenant,
      });
    },
  },
  exports: {
    download(query?: Record<string, QueryValue>, tenant?: BackendTenantScope) {
      return backendDownload("/api/v1/ops/export", query, tenant);
    },
  },
};
