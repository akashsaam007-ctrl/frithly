import "server-only";

import { env } from "@/lib/utils/env";

export type GooglePlacesSeed = {
  address: string | null;
  categoryHints: string[];
  companyName: string;
  domain: string | null;
  mapsUrl: string | null;
  query: string;
  rating: number | null;
  snippet: string;
  url: string | null;
};

type GooglePlacesResponse = {
  places?: {
    businessStatus?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    googleMapsUri?: string;
    nationalPhoneNumber?: string;
    primaryType?: string;
    primaryTypeDisplayName?: { text?: string };
    rating?: number;
    userRatingCount?: number;
    websiteUri?: string;
  }[];
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function dedupeStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function safeDomainFromUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function getLanguageCode() {
  const configured = (env.SEARXNG_LANGUAGE ?? "en-US").trim();
  return configured.includes("-") ? configured : "en-US";
}

export function googleMapsSearchEnabled() {
  return Boolean(env.GOOGLE_MAPS_API_KEY?.trim());
}

export async function runGooglePlacesSearch(query: string, pageSize = 10) {
  const apiKey = env.GOOGLE_MAPS_API_KEY?.trim();

  if (!apiKey) {
    return [] as GooglePlacesSeed[];
  }

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    body: JSON.stringify({
      languageCode: getLanguageCode(),
      pageSize: Math.min(Math.max(pageSize, 1), 20),
      textQuery: query,
    }),
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.googleMapsUri,places.primaryType,places.primaryTypeDisplayName,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.businessStatus",
    },
    method: "POST",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Google Places HTTP ${response.status}`);
  }

  const data = (await response.json()) as GooglePlacesResponse;

  return (data.places ?? [])
    .map((place) => {
      const companyName = normalizeWhitespace(place.displayName?.text ?? "");
      const address = normalizeWhitespace(place.formattedAddress ?? "");
      const websiteUrl = place.websiteUri?.trim() ?? null;
      const domain = safeDomainFromUrl(websiteUrl);
      const categoryHints = dedupeStrings([
        place.primaryTypeDisplayName?.text ?? "",
        place.primaryType ?? "",
        address,
      ]);
      const snippet = dedupeStrings([
        place.primaryTypeDisplayName?.text ?? "",
        address,
        typeof place.rating === "number" ? `Rating ${place.rating.toFixed(1)}` : "",
        typeof place.userRatingCount === "number" ? `${place.userRatingCount} reviews` : "",
        place.nationalPhoneNumber ?? "",
        place.businessStatus ?? "",
      ]).join(" • ");

      if (!companyName) {
        return null;
      }

      return {
        address: address || null,
        categoryHints,
        companyName,
        domain,
        mapsUrl: place.googleMapsUri?.trim() ?? null,
        query,
        rating: typeof place.rating === "number" ? place.rating : null,
        snippet,
        url: websiteUrl,
      } satisfies GooglePlacesSeed;
    })
    .filter((place): place is GooglePlacesSeed => Boolean(place));
}
