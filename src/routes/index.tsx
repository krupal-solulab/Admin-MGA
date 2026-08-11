import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";

import { AdminGuard, AppShell } from "@/components/app/AppShell";
import { AdminOverview } from "@/components/app/admin/AdminOverview";
import { Skeleton } from "@/components/ui/skeleton";
import { clearIdentity, getIdentity } from "@/lib/api/identity";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    const identity = getIdentity();
    if (!identity) throw redirect({ to: "/auth" });
    if (identity.role !== "admin") {
      clearIdentity();
      throw redirect({ to: "/auth" });
    }
  },
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
