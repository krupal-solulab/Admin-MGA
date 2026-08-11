/**
 * Client-side metadata the real backend (AI-OS-BE's core/admin/service.py)
 * can't send over the wire: what kind of input control each setting needs,
 * plus the real Nango provider registry and the real MGA workflow slugs.
 * Everything else — label, description, current value, env default, override
 * provenance — comes live from `GET /api/core/admin/settings` (see
 * lib/api/admin.ts's `SettingOut`). Do not hardcode a label/description/
 * default here — that drifts from the real backend silently.
 */

export type SettingType = "currency" | "number" | "integer" | "text" | "enum";

export interface SettingTypeDef {
  key: string;
  type: SettingType;
  options?: string[];
}

export const SETTING_TYPES: SettingTypeDef[] = [
  { key: "junior_premium_cap", type: "currency" },
  { key: "connectors_mode", type: "enum", options: ["mock", "live"] },
  { key: "nango_inbox_query", type: "text" },
  { key: "quote_rank_price_weight", type: "number" },
  { key: "quote_rank_subjectivity_penalty", type: "number" },
  { key: "carrier_appetite_min_total_outcomes", type: "integer" },
];

export function getSettingType(key: string): SettingTypeDef {
  return SETTING_TYPES.find((definition) => definition.key === key) ?? { key, type: "text" };
}

/** Returns an error message, or null when the value is acceptable. Mirrors
 * (but doesn't replace) the real validation in core/admin/service.py's
 * `_validate_setting_value` — this is a client-side nicety, not the source
 * of truth; the backend rejects an invalid value regardless. */
export function validateSettingValue(definition: SettingTypeDef, raw: string): string | null {
  const value = raw.trim();
  if (value === "") return "Value is required.";

  if (definition.type === "enum") {
    return definition.options?.includes(value)
      ? null
      : `Must be one of: ${definition.options?.join(", ")}.`;
  }

  if (definition.type === "text") {
    return value.length <= 240 ? null : "Must be 240 characters or fewer.";
  }

  if (!/^-?\d+(\.\d+)?$/.test(value)) return "Must be a number.";
  const parsed = Number(value);

  if (definition.type === "integer") {
    if (!Number.isInteger(parsed)) return "Must be a whole number.";
    if (parsed < 0) return "Must be zero or greater.";
    return null;
  }

  if (definition.type === "currency") {
    if (parsed < 0) return "Must be zero or greater.";
    if (parsed > 100_000_000) return "Unrealistically large cap.";
    return null;
  }

  if (parsed < 0) return "Must be zero or greater.";
  return null;
}

// Real Nango provider keys (AI-OS-BE core/config.py's nango_integration_*) —
// must match exactly what GET /api/core/integrations/connections returns.
// Shared core infra, same registry for both the ES and MGA verticals.
export const CONNECTORS = [
  { id: "google-mail", label: "Gmail", description: "Real inbox access for submission intake." },
  {
    id: "google-sheet",
    label: "Google Sheets",
    description: "Connect/disconnect only for now — no data is read or written yet.",
  },
  {
    id: "google-drive",
    label: "Google Drive",
    description: "Connect/disconnect only for now — no data is read or written yet.",
  },
  {
    id: "google-calendar",
    label: "Google Calendar",
    description: "Connect/disconnect only for now — no data is read or written yet.",
  },
] as const;

// Real MGA vertical workflow slugs (each verticals/mga/<workflow>/service.py's
// module-level `WORKFLOW` constant) — what actually appears in
// AuditEntry.workflow for this tenant. Kept here rather than derived so the
// Activity Log filter offers exactly the slugs that exist, no more no less.
export const WORKFLOWS = [
  "submission-triage",
  "appetite-governance",
  "quoting-rating",
  "bind-issuance",
  "endorsement-processing",
  "renewal-management",
  "claims-intake",
  "bordereau-reporting",
  "broker-copilot",
  "portfolio-reporting",
] as const;

export const ROLES = ["junior", "senior", "admin"] as const;
export type Role = (typeof ROLES)[number];
