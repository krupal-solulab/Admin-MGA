# Master Prompt — Complete the Admin Panel

## Coverline OS — MGA Vertical

**Use this prompt with:** an AI coding agent (Claude Code or equivalent) that has
read/write access to both repos below. Paste this whole file as the system/task
prompt, or work through it phase by phase per Section 4.

**Grounded in:** `ADMIN_PANEL_MGA.md` (this file operationalizes it as a build
prompt — do not re-derive architecture decisions already made there).

---

## 0. Mission

Implement the admin panel described in `ADMIN_PANEL_MGA.md` across both repos:

- **`AI-OS-BE`** — backend, FastAPI/SQLModel
- **`IndustryAI-Insaurance-MGA`** — frontend, TanStack Start/React

The panel gives a tenant's `admin` role a dedicated section to manage their
own tenant identity, users, platform settings, integrations, and audit log.
It is **tenant-scoped only** — no cross-tenant admin in this pass.

You are extending an existing, working application. Every file path, table
name, and code pattern below is already verified against the current
codebase. Match existing conventions exactly rather than introducing new
ones — this codebase already has a router/service split, a `*-api.ts`
client pattern, a thin-route/component split, and a shadcn/ui component
library. Reuse them.

---

## 1. Non-negotiable constraints

- **Do not build cross-tenant admin.** An admin manages only their own
  tenant (`ctx.tenant_id`). This is explicitly out of scope per the spec's
  open decisions (Section 4 of the spec) — confirm it's still correct
  before starting, since it's the single biggest scope lever if wrong.
- **Do not give `senior` any admin visibility.** The route guard is a hard
  `role !== "admin"` redirect. No partial access.
- **Do not add user deactivation / `is_active`.** Not in scope for this pass.
- **Never leak cross-tenant existence.** A `user_id` that belongs to another
  tenant returns 404, not 403, matching this codebase's existing convention.
- **Router functions stay thin.** All business logic (mutations, cap
  validation, `PlatformSetting` upsert) lives in `src/core/admin/service.py`,
  not in `router.py` — matching every existing workflow's `router.py` /
  `service.py` split.
- **`require_role(Role.ADMIN)` is applied once, at the router level**, via
  `dependencies=[...]`. Don't scatter it per-route unless you first verify
  router-level `dependencies=` doesn't compose cleanly — check, don't assume.
- **Settings overrides go through `get_effective_setting()` everywhere.**
  Every one of the 6 tunable keys currently read via `get_settings().<key>`
  must be swapped to `get_effective_setting(session, ctx.tenant_id, "<key>")`
  at **every real call site** — this is a multi-file grep-and-swap across
  `src/verticals/mga/*/service.py` and `src/core/**/*.py`, not a single edit.
  Report each call site you changed explicitly; don't assume there's only one.
- **No new frontend data-fetching convention.** Check whether
  `@tanstack/react-query` is already a dependency (likely, alongside
  TanStack Start/Router). If yes, use it. If not, match the manual
  `useEffect` + `useState` pattern already used by the 10 workflow
  components (check `SubmissionTriage.tsx` as the reference) — don't
  introduce a third pattern.
- **Don't duplicate write-capable UI.** The existing Settings page keeps
  read-only Organization/Team panels for all roles; only `/app/admin` gets
  the editable versions (role changes, cap edits).
- **Migrations chain onto the current head revision.** Don't branch.

---

## 2. Backend — `AI-OS-BE`

Implement in this order (each depends on the previous):

1. **`PlatformSetting` table** (`src/core/models/tables.py`) + Alembic
   migration in `migrations/versions/`, following the naming and structure
   of the existing 10 migrations. Unique index on `(tenant_id, key)`.
2. **`src/core/admin/settings_override.py`** — `SETTINGS_KEYS` dict and
   `get_effective_setting(session, tenant_id, key)` returning
   `(value, source)` where source is `"override"` or `"env"`.
3. **Swap all 6 real call sites** to use `get_effective_setting()` instead
   of reading `get_settings().<key>` directly. Grep for each key:
   `junior_premium_cap`, `connectors_mode`, `nango_inbox_query`,
   `quote_rank_price_weight`, `quote_rank_subjectivity_penalty`,
   `carrier_appetite_min_total_outcomes`.
4. **`src/core/admin/schema.py`** — Pydantic schemas mirroring an existing
   vertical's `schema.py` (e.g. `submission_triage/schema.py`): `TenantOut`,
   `TenantPatch`, `UserOut`, `UserCreate`, `UserPatch`, `SettingOut`,
   `SettingsPatch`, `AuditEntryOut`.
5. **`src/core/admin/service.py`** — all business logic: tenant patch,
   user create/patch (with cross-tenant 404 guard), settings upsert
   (writing `PlatformSetting` rows, `updated_by` = acting admin's user id),
   audit query delegation to the existing `AuditService.query()`.
6. **`src/core/admin/router.py`** — thin router per the spec's exact route
   list: `GET/PATCH /tenant`, `GET/POST/PATCH /users(/{user_id})`,
   `GET/PATCH /settings`, `GET /audit`. Router-level
   `dependencies=[Depends(require_role(Role.ADMIN))]`.
7. **Mount the router** in `src/main.py` alongside existing `core_router`
   mounts. Confirm the resulting path is `/api/core/admin/*`.
8. **Seed an admin user** in `src/core/seed.py` — one `Role.ADMIN` user per
   tenant, alongside the existing junior/senior seeds. This is a hard
   prerequisite; nothing is testable end-to-end without it.
9. **Verify the `junior_premium_cap` wiring.** Grep `can_approve` in
   `core/auth/policy.py` and confirm whether it already reads
   `Tenant.junior_premium_cap` or only the global env value. If only the
   global value, thread the per-tenant cap through (`ctx` carrying the
   resolved tenant, or caller passing
   `cap=tenant.junior_premium_cap or get_settings().junior_premium_cap`).
   Do not mark this done without actually confirming which branch fires —
   the spec explicitly flags this as unconfirmed, not assumed-working.

---

## 3. Frontend — `IndustryAI-Insaurance-MGA`

Implement in this order (each depends on the previous):

1. **Extend the role model first** — `src/components/app/role.tsx`:
   `Role` becomes `"junior" | "senior" | "admin"`; extend
   `ROLE_IDENTITY` and `DEMO_LOGINS` with the admin entry
   (`admin@coverline.test` / `coverline`); add `useIsAdmin()` helper.
   `resolveRoleFromLogin`'s unknown-email fallback stays `"senior"`.
2. **`src/lib/admin-api.ts`** — same shape as `submission-triage-api.ts`,
   but hitting `VITE_CORE_API_BASE_URL` (same base already used by
   `integrations-api.ts`, not `VITE_MGA_API_BASE_URL`). Export
   `getTenant`, `patchTenant`, `listUsers`, `createUser`, `patchUser`,
   `getSettings`, `patchSettings`, `getAudit`, matching the DTO shapes and
   header pattern (`x-tenant-id`, `x-user-id`, `x-role`) already used
   elsewhere.
3. **Route guard** — `src/routes/app.admin.tsx` as a layout route
   (mirrors `app.foundation.$slug.tsx`'s parent/child structure): redirect
   to `/app` via `<Navigate>` before rendering `<Outlet />` if
   `role !== "admin"` — no flash of admin content.
4. **Child routes** — thin route files delegating to components:
   - `app.admin.index.tsx` → `AdminOverview`
   - `app.admin.users.tsx` → `AdminUsers`
   - `app.admin.settings.tsx` → `AdminSettings`
   - `app.admin.integrations.tsx` → `AdminIntegrations`
   - `app.admin.audit.tsx` → `AdminAudit`
5. **Sidebar nav** — `src/components/app/AppShell.tsx`'s `Sidebar()`:
   conditionally render an "Admin" section (via `useRole()`) after the
   existing Workflows/Foundation/misc sections, with the 5 nav items from
   the spec. Extend `buildCrumbs()` with an `admin` branch matching the
   existing per-section pattern.
6. **Components** — `src/components/app/admin/`, one file per screen,
   styled with existing `Card`/`Table`/`Badge`/`Dialog` shadcn primitives
   and `PageHeader`:
   - `AdminOverview.tsx` — tenant name/vertical, `junior_premium_cap`,
     connector status chips, last 5 audit rows
   - `AdminUsers.tsx` — user table, role `<Select>`, "New user" dialog
   - `AdminSettings.tsx` — 6 tunables: label, current value, source badge
     (env/override), inline edit
   - `AdminIntegrations.tsx` — thin-wrap the existing Integrations panel;
     no changes to `core/integrations/router.py`, reuse as-is
   - `AdminAudit.tsx` — filterable table (workflow/actor dropdowns),
     calls `getAudit()`
7. **Replace the fake Settings panels (AP-07)** — in `Foundation.tsx`'s
   `SettingsPage`, the hardcoded Organization/Team panels get real data
   from `getTenant()`/`listUsers()`, kept **read-only** for all roles. The
   editable version lives only under `/app/admin`.

---

## 4. Required rollout order

Do not start a later phase before the previous phase's acceptance criterion
is verified — this is the actual dependency order, not a suggestion:

1. **Prereq** — seed admin user (2.8) + extend frontend `Role` type (3.1).
   Nothing else is testable without both.
2. **Phase 1 (read-only, proves the guard pattern)** — `/admin/audit`
   route only, `/app/admin` guard + nav, `AdminIntegrations` reuse. No
   writes yet — lowest risk. Verify: a junior/senior hitting `/app/admin*`
   redirects instead of flashing admin content.
3. **Phase 2 (management)** — `/admin/tenant`, `/admin/users`,
   `AdminUsers`/`AdminOverview`. Verify: role changes and cap edits persist
   and are reflected immediately.
4. **Phase 3 (settings)** — `PlatformSetting` table + migration,
   `get_effective_setting`, wire all 6 call sites, `/admin/settings`,
   `AdminSettings.tsx`, then AP-07. Verify against the concrete PRD
   acceptance criterion — e.g. "changing the cap blocks a junior's next
   real approval" — not just "the endpoint returns 200."

---

## 5. Open decisions — confirm, don't silently resolve

Before or while building, confirm these explicitly (flag in your summary if
any assumption changes):

- Cross-tenant admin is out of scope — confirm this is still correct.
- `senior` gets no partial admin visibility — confirm this default holds.
- User deactivation is out of scope for this pass.
- Whether `can_approve` already reads the per-tenant cap or only the global
  env value (Section 2, step 9) — this must be verified, not assumed.

---

## 6. Definition of Done

- All 3 phases implemented and individually verified against their
  acceptance criterion, in order.
- Every one of the 6 settings keys reads through `get_effective_setting()`
  at every real call site — list each file/line changed.
- `require_role(Role.ADMIN)` gates the entire `/admin` router; confirmed
  working at router level (or documented why per-route was needed instead).
- Cross-tenant user access returns 404, not 403.
- `/app/admin*` hard-redirects non-admins with no content flash.
- No duplicate write-capable UI — Settings page stays read-only for
  Organization/Team; edits only under `/app/admin`.
- No new frontend data-fetching pattern introduced beyond what the
  codebase already uses.
- No features, screens, or workflows added beyond what's specified above.
