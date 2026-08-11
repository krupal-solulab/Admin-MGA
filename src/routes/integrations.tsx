import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { AdminGuard, AppShell } from "@/components/app/AppShell";
import { AdminIntegrations } from "@/components/app/admin/AdminIntegrations";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Coverline OS Admin" },
      {
        name: "description",
        content:
          "Connector inventory and sync health for policy admin, intake, binding and analytics systems.",
      },
      { property: "og:title", content: "Integrations — Coverline OS Admin" },
      {
        property: "og:description",
        content: "Monitor connector status and last sync times for your tenant.",
      },
    ],
  }),
  component: IntegrationsRoute,
});

function IntegrationsRoute() {
  return (
    <AppShell>
      <AdminGuard>
        <Suspense fallback={<Skeleton className="h-72 w-full" />}>
          <AdminIntegrations />
        </Suspense>
      </AdminGuard>
    </AppShell>
  );
}
