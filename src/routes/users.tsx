import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { AdminGuard, AppShell } from "@/components/app/AppShell";
import { AdminUsers } from "@/components/app/admin/AdminUsers";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users — Coverline OS Admin" },
      {
        name: "description",
        content:
          "Tenant-scoped user directory: invite underwriters and change junior, senior or admin roles.",
      },
      { property: "og:title", content: "Users — Coverline OS Admin" },
      {
        property: "og:description",
        content: "Invite users and manage underwriting roles inside your tenant.",
      },
    ],
  }),
  component: UsersRoute,
});

function UsersRoute() {
  return (
    <AppShell>
      <AdminGuard>
        <Suspense fallback={<Skeleton className="h-72 w-full" />}>
          <AdminUsers />
        </Suspense>
      </AdminGuard>
    </AppShell>
  );
}
