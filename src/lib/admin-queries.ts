import { queryOptions } from "@tanstack/react-query";

import {
  getAudit,
  getSettings,
  getTenant,
  listConnectors,
  listUsers,
} from "./admin-api";

export const tenantQuery = queryOptions({
  queryKey: ["admin", "tenant"],
  queryFn: () => getTenant(),
});

export const usersQuery = queryOptions({
  queryKey: ["admin", "users"],
  queryFn: () => listUsers(),
});

export const settingsQuery = queryOptions({
  queryKey: ["admin", "settings"],
  queryFn: () => getSettings(),
});

export const connectorsQuery = queryOptions({
  queryKey: ["admin", "connectors"],
  queryFn: () => listConnectors(),
});

export const auditQuery = (params?: {
  workflow?: string;
  actor?: string;
  limit?: number;
}) =>
  queryOptions({
    queryKey: ["admin", "audit", params ?? {}],
    queryFn: () => getAudit(params),
  });
