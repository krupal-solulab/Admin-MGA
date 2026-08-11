import { createFileRoute } from "@tanstack/react-router";

import { AdminGuard, AppShell } from "@/components/app/AppShell";
import { AdminAudit } from "@/components/app/admin/AdminAudit";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Activity Log — Coverline OS Admin" },
      {
        name: "description",
        content:
          "Filterable audit trail of AI and human underwriting decisions across triage, quoting, referrals and binding.",
      },
      { property: "og:title", content: "Activity Log — Coverline OS Admin" },
      {
        property: "og:description",
        content: "Every AI and human decision recorded for your tenant.",
      },
    ],
  }),
  component: AuditRoute,
});

function AuditRoute() {
  return (
    <AppShell>
      <AdminGuard>
        <AdminAudit />
      </AdminGuard>
    </AppShell>
  );
}
