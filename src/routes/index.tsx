import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { AdminGuard, AppShell } from "@/components/app/AppShell";
import { AdminOverview } from "@/components/app/admin/AdminOverview";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Admin Overview — Coverline OS MGA" },
      {
        name: "description",
        content:
          "Tenant identity, junior premium cap, connector health and recent AI activity for the Coverline OS MGA admin panel.",
      },
      { property: "og:title", content: "Admin Overview — Coverline OS MGA" },
      {
        property: "og:description",
        content: "Tenant settings, users, connectors and audit trail for your MGA workspace.",
      },
    ],
  }),
  component: OverviewRoute,
});

function OverviewRoute() {
  return (
    <AppShell>
      <AdminGuard>
        <Suspense fallback={<Skeleton className="h-72 w-full" />}>
          <AdminOverview />
        </Suspense>
      </AdminGuard>
    </AppShell>
  );
}
