// Real data layer for the Coverline OS MGA admin panel — talks to AI-OS-BE's
// `/api/core/admin/*` (+ `/api/core/integrations/*` for connectors) via
// lib/api/admin.ts. Exported types/signatures here are kept stable so the
// existing screen components (AdminOverview, AdminUsers, ...) don't need to
// change — only the implementation moved from an in-memory mock to real
// fetch() calls.
import {
  clearSetting as apiClearSetting,
  createUser as apiCreateUser,
  getTenant as apiGetTenant,
  listAudit,
  listConnections,
  listSettings,
  listUsers as apiListUsers,
  saveSetting,
  updateTenant,
  updateUser as apiUpdateUser,
  type AuditEntryOut,
  type SettingOut,
  type UserOut,
} from "./api/admin";
import { getIdentity } from "./api/identity";
import { CONNECTORS, WORKFLOWS } from "./admin-settings";

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

function tenantDTO(t: {
  id: string;
  name: string;
  vertical: string;
  junior_premium_cap: number | null;
}): TenantDTO {
  return { id: t.id, name: t.name, vertical: t.vertical, juniorPremiumCap: t.junior_premium_cap };
}

function userDTO(u: UserOut): UserDTO {
  return {
    id: u.id,
    tenantId: getIdentity()?.tenantId ?? "",
    email: u.email,
    name: u.name,
    role: u.role as Role,
    createdAt: u.created_at,
  };
}

function settingDTO(s: SettingOut): SettingDTO {
  return {
    key: s.key,
    label: s.label,
    description: s.description,
    value: s.value,
    source: s.source === "admin_override" ? "override" : "env",
    ...(s.updated_at ? { updatedAt: s.updated_at } : {}),
    ...(s.updated_by ? { updatedBy: s.updated_by } : {}),
  };
}

function auditDTO(e: AuditEntryOut, index: number): AuditEntryDTO {
  return {
    id: `a_${index}_${e.at ?? "unknown"}`,
    at: e.at ?? new Date(0).toISOString(),
    who: e.who,
    what: e.what,
    workflow: e.workflow,
    actor: e.actor === "ai" ? "ai" : "human",
    detail: e.detail ?? null,
  };
}

export async function getTenant(): Promise<TenantDTO> {
  return tenantDTO(await apiGetTenant());
}

export async function patchTenant(
  body: Partial<Pick<TenantDTO, "name" | "juniorPremiumCap">>,
): Promise<TenantDTO> {
  const updated = await updateTenant({
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.juniorPremiumCap !== undefined ? { junior_premium_cap: body.juniorPremiumCap } : {}),
  });
  return tenantDTO(updated);
}

export async function listUsers(): Promise<UserDTO[]> {
  return (await apiListUsers()).map(userDTO);
}

export async function createUser(body: {
  email: string;
  name: string;
  role: Role;
}): Promise<UserDTO> {
  return userDTO(await apiCreateUser(body));
}

export async function patchUser(
  userId: string,
  body: Partial<Pick<UserDTO, "name" | "role">>,
): Promise<UserDTO> {
  return userDTO(await apiUpdateUser(userId, body));
}

export async function getSettings(): Promise<SettingDTO[]> {
  return (await listSettings()).map(settingDTO);
}

export async function patchSettings(updates: Record<string, string>): Promise<SettingDTO[]> {
  await Promise.all(Object.entries(updates).map(([key, value]) => saveSetting(key, value)));
  return getSettings();
}

export async function clearSetting(key: string): Promise<SettingDTO[]> {
  await apiClearSetting(key);
  return getSettings();
}

export async function getAudit(params?: {
  workflow?: string;
  actor?: string;
  limit?: number;
}): Promise<AuditEntryDTO[]> {
  const rows = await listAudit(params ?? {});
  return rows.map((row, index) => auditDTO(row, index));
}

export async function listConnectors(): Promise<ConnectorDTO[]> {
  const connections = await listConnections();
  const statusByProvider = new Map(connections.map((c) => [c.provider, c.status]));
  return CONNECTORS.map((connector) => ({
    id: connector.id,
    name: connector.label,
    category: connector.description,
    status: (statusByProvider.get(connector.id) === "connected"
      ? "connected"
      : "disconnected") as ConnectorDTO["status"],
    lastSyncedAt: null,
  }));
}

export const AUDIT_WORKFLOWS: string[] = [...WORKFLOWS];
