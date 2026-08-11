import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { AdminGuard, AppShell } from "@/components/app/AppShell";
import { AdminSettings } from "@/components/app/admin/AdminSettings";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Platform Settings — Coverline OS Admin" },
      {
        name: "description",
        content:
          "Edit tenant tunables such as the junior premium cap, auto-triage threshold and referral SLA.",
      },
      { property: "og:title", content: "Platform Settings — Coverline OS Admin" },
      {
        property: "og:description",
        content: "Environment defaults and tenant overrides for underwriting automation.",
      },
    ],
  }),
  component: SettingsRoute,
});

function SettingsRoute() {
  return (
    <AppShell>
      <AdminGuard>
        <Suspense fallback={<Skeleton className="h-72 w-full" />}>
          <AdminSettings />
        </Suspense>
      </AdminGuard>
    </AppShell>
  );
}
