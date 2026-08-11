// Local demo data layer for the Coverline OS admin panel.
// Mirrors the DTO shapes of the core admin API so it can be swapped for
// real fetch() calls against VITE_CORE_API_BASE_URL later.

export type Role = "junior" | "senior" | "admin";

export type TenantDTO = {
  id: string;
  name: string;
  vertical: string;
  juniorPremiumCap: number | null;
};

export type UserDTO = {
  id: string;
  tenantId: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
};

export type SettingDTO = {
  key: string;
  label: string;
  description: string;
  value: string;
  source: "env" | "override";
  updatedAt?: string;
  updatedBy?: string;
};

export type AuditEntryDTO = {
  id: string;
  at: string;
  who: string;
  what: string;
  workflow: string;
  actor: "ai" | "human";
  detail: Record<string, unknown> | null;
};

export type ConnectorDTO = {
  id: string;
  name: string;
  category: string;
  status: "connected" | "degraded" | "disconnected";
  lastSyncedAt: string | null;
};

const TENANT_ID = "demo-mga";

let tenant: TenantDTO = {
  id: TENANT_ID,
  name: "Meridian MGA",
  vertical: "Commercial Property & Casualty",
  juniorPremiumCap: 25000,
};

let users: UserDTO[] = [
  {
    id: "u_1",
    tenantId: TENANT_ID,
    email: "admin@coverline.test",
    name: "Alex M.",
    role: "admin",
    createdAt: "2026-01-14T09:12:00Z",
  },
  {
    id: "u_2",
    tenantId: TENANT_ID,
    email: "senior@coverline.test",
    name: "Priya R.",
    role: "senior",
    createdAt: "2026-02-03T14:40:00Z",
  },
  {
    id: "u_3",
    tenantId: TENANT_ID,
    email: "junior@coverline.test",
    name: "Sofia A.",
    role: "junior",
    createdAt: "2026-03-21T08:05:00Z",
  },
  {
    id: "u_4",
    tenantId: TENANT_ID,
    email: "d.okafor@coverline.test",
    name: "Daniel O.",
    role: "junior",
    createdAt: "2026-05-02T11:30:00Z",
  },
  {
    id: "u_5",
    tenantId: TENANT_ID,
    email: "l.tanaka@coverline.test",
    name: "Lena T.",
    role: "senior",
    createdAt: "2026-06-18T16:22:00Z",
  },
];

let settings: SettingDTO[] = [
  {
    key: "junior_premium_cap",
    label: "Junior premium cap",
    description: "Maximum bound premium a junior underwriter can approve unaided. Policy checks this per-tenant value; falling back to the env default if no override is set.",
    value: "25000",
    source: "override",
    updatedAt: "2026-07-30T10:02:00Z",
    updatedBy: "admin@coverline.test",
  },
  {
    key: "connectors_mode",
    label: "Connectors mode",
    description: "Controls whether real integrations fire (live) or run in sandbox mode (mock). Swap to mock for UAT or when an upstream is degraded.",
    value: "live",
    source: "env",
  },
  {
    key: "nango_inbox_query",
    label: "Nango inbox query",
    description: "IMAP / API filter used to pull inbound submissions from the Outlook inbox connector. Syntax is provider-specific.",
    value: "subject:submission OR folder:Submissions",
    source: "override",
    updatedAt: "2026-08-04T07:44:00Z",
    updatedBy: "admin@coverline.test",
  },
  {
    key: "quote_rank_price_weight",
    label: "Quote rank — price weight",
    description: "Relative weight (0 – 1) of premium price vs subjectivity count when ranking carrier quotes. Complement is applied to subjectivity.",
    value: "0.60",
    source: "env",
  },
  {
    key: "quote_rank_subjectivity_penalty",
    label: "Quote rank — subjectivity penalty",
    description: "Score penalty applied per open subjectivity item when ranking quotes. Higher values make subjectivity-heavy quotes rank lower.",
    value: "0.08",
    source: "override",
    updatedAt: "2026-06-11T12:15:00Z",
    updatedBy: "admin@coverline.test",
  },
  {
    key: "carrier_appetite_min_total_outcomes",
    label: "Carrier appetite — min outcomes",
    description: "Minimum number of historical submission outcomes required before a carrier's appetite score is trusted rather than treated as unrated.",
    value: "50",
    source: "env",
  },
];

const audit: AuditEntryDTO[] = [
  {
    id: "a_1",
    at: "2026-08-11T06:58:00Z",
    who: "copilot",
    what: "Auto-triaged submission SUB-4821 to Property queue",
    workflow: "submission-triage",
    actor: "ai",
    detail: { confidence: 0.91, queue: "property" },
  },
  {
    id: "a_2",
    at: "2026-08-11T06:31:00Z",
    who: "priya.r@coverline.test",
    what: "Approved quote QT-1190 at $41,200 premium",
    workflow: "quoting",
    actor: "human",
    detail: { premium: 41200 },
  },
  {
    id: "a_3",
    at: "2026-08-11T05:47:00Z",
    who: "copilot",
    what: "Flagged loss-run gap on ACC-3320",
    workflow: "risk-appetite",
    actor: "ai",
    detail: { missingYears: 2 },
  },
  {
    id: "a_4",
    at: "2026-08-10T18:20:00Z",
    who: "sofia.a@coverline.test",
    what: "Referred SUB-4790 — exceeds junior premium cap",
    workflow: "referrals",
    actor: "human",
    detail: { premium: 63500, cap: 25000 },
  },
  {
    id: "a_5",
    at: "2026-08-10T15:02:00Z",
    who: "admin@coverline.test",
    what: "Changed platform setting quote_rank_subjectivity_penalty 0.05 → 0.08",
    workflow: "admin",
    actor: "human",
    detail: { key: "quote_rank_subjectivity_penalty" },
  },
  {
    id: "a_6",
    at: "2026-08-10T11:48:00Z",
    who: "copilot",
    what: "Drafted binder for QT-1174",
    workflow: "binding",
    actor: "ai",
    detail: { docPages: 14 },
  },
  {
    id: "a_7",
    at: "2026-08-09T09:14:00Z",
    who: "lena.t@coverline.test",
    what: "Declined SUB-4712 — outside appetite (wildfire zone)",
    workflow: "risk-appetite",
    actor: "human",
    detail: { reason: "wildfire" },
  },
  {
    id: "a_8",
    at: "2026-08-08T13:36:00Z",
    who: "admin@coverline.test",
    what: "Invited d.okafor@coverline.test as junior",
    workflow: "admin",
    actor: "human",
    detail: null,
  },
];

const connectors: ConnectorDTO[] = [
  {
    id: "c_1",
    name: "Guidewire PolicyCenter",
    category: "Policy admin",
    status: "connected",
    lastSyncedAt: "2026-08-11T06:55:00Z",
  },
  {
    id: "c_2",
    name: "Verisk ISO ClaimSearch",
    category: "Data enrichment",
    status: "connected",
    lastSyncedAt: "2026-08-11T06:12:00Z",
  },
  {
    id: "c_3",
    name: "Outlook Submission Inbox",
    category: "Intake",
    status: "degraded",
    lastSyncedAt: "2026-08-10T22:04:00Z",
  },
  {
    id: "c_4",
    name: "DocuSign eSignature",
    category: "Binding",
    status: "connected",
    lastSyncedAt: "2026-08-09T17:41:00Z",
  },
  {
    id: "c_5",
    name: "Snowflake Loss Warehouse",
    category: "Analytics",
    status: "disconnected",
    lastSyncedAt: null,
  },
];

const latency = () => new Promise((r) => setTimeout(r, 220));

export async function getTenant(): Promise<TenantDTO> {
  await latency();
  return { ...tenant };
}

export async function patchTenant(
  body: Partial<Pick<TenantDTO, "name" | "juniorPremiumCap">>,
): Promise<TenantDTO> {
  await latency();
  tenant = { ...tenant, ...body };
  settings = settings.map((s) =>
    s.key === "junior_premium_cap" && body.juniorPremiumCap != null
      ? { ...s, value: String(body.juniorPremiumCap), source: "override" }
      : s,
  );
  return { ...tenant };
}

export async function listUsers(): Promise<UserDTO[]> {
  await latency();
  return users.map((u) => ({ ...u }));
}

export async function createUser(body: {
  email: string;
  name: string;
  role: Role;
}): Promise<UserDTO> {
  await latency();
  const user: UserDTO = {
    id: `u_${users.length + 1}_${Date.now()}`,
    tenantId: TENANT_ID,
    createdAt: new Date().toISOString(),
    ...body,
  };
  users = [...users, user];
  return user;
}

export async function patchUser(
  userId: string,
  body: Partial<Pick<UserDTO, "name" | "role">>,
): Promise<UserDTO> {
  await latency();
  users = users.map((u) => (u.id === userId ? { ...u, ...body } : u));
  const updated = users.find((u) => u.id === userId);
  if (!updated) throw new Error("User not found");
  return { ...updated };
}

export async function getSettings(): Promise<SettingDTO[]> {
  await latency();
  return settings.map((s) => ({ ...s }));
}

export async function patchSettings(
  updates: Record<string, string>,
): Promise<SettingDTO[]> {
  await latency();
  settings = settings.map((s) =>
    s.key in updates
      ? {
          ...s,
          value: updates[s.key]!,
          source: "override",
          updatedAt: new Date().toISOString(),
          updatedBy: "admin@coverline.test",
        }
      : s,
  );
  if ("junior_premium_cap" in updates) {
    tenant = { ...tenant, juniorPremiumCap: Number(updates["junior_premium_cap"]) };
  }
  return settings.map((s) => ({ ...s }));
}

export async function getAudit(params?: {
  workflow?: string;
  actor?: string;
  limit?: number;
}): Promise<AuditEntryDTO[]> {
  await latency();
  let rows = [...audit];
  if (params?.workflow && params.workflow !== "all") {
    rows = rows.filter((r) => r.workflow === params.workflow);
  }
  if (params?.actor && params.actor !== "all") {
    rows = rows.filter((r) => r.actor === params.actor);
  }
  return params?.limit ? rows.slice(0, params.limit) : rows;
}

export async function listConnectors(): Promise<ConnectorDTO[]> {
  await latency();
  return connectors.map((c) => ({ ...c }));
}

export const AUDIT_WORKFLOWS = [
  "submission-triage",
  "risk-appetite",
  "quoting",
  "referrals",
  "binding",
  "admin",
];
