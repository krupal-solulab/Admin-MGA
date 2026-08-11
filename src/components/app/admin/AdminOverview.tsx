import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Gauge, Users } from "lucide-react";

import { PageHeader } from "../AppShell";
import {
  ActorBadge,
  StatusDot,
  formatCurrency,
  formatDateTime,
} from "./primitives";
import { auditQuery, connectorsQuery, tenantQuery, usersQuery } from "@/lib/admin-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminOverview() {
  const { data: tenant } = useSuspenseQuery(tenantQuery);
  const { data: users } = useSuspenseQuery(usersQuery);
  const { data: connectors } = useSuspenseQuery(connectorsQuery);
  const { data: audit } = useSuspenseQuery(auditQuery({ limit: 5 }));

  const stats = [
    {
      label: "Tenant",
      value: tenant.name,
      hint: tenant.vertical,
      icon: Building2,
    },
    {
      label: "Junior premium cap",
      value: formatCurrency(tenant.juniorPremiumCap),
      hint: "Per-tenant approval ceiling",
      icon: Gauge,
    },
    {
      label: "Users",
      value: String(users.length),
      hint: `${users.filter((u) => u.role === "admin").length} admin · ${
        users.filter((u) => u.role === "senior").length
      } senior · ${users.filter((u) => u.role === "junior").length} junior`,
      icon: Users,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Admin overview"
        description="Tenant identity, approval limits, connector health and the latest platform activity."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <p className="text-eyebrow text-muted-foreground">{s.label}</p>
                <s.icon className="size-4 text-accent" aria-hidden />
              </div>
              <p className="mt-3 font-display text-xl font-semibold">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Connectors</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/integrations">
                Manage <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {connectors.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 border-b border-border/70 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.category}</p>
                </div>
                <StatusDot status={c.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Recent activity</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/audit">
                Full log <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {audit.map((row) => (
              <div key={row.id} className="flex gap-3">
                <ActorBadge actor={row.actor} />
                <div className="min-w-0">
                  <p className="text-sm">{row.what}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {row.who} · {row.workflow} · {formatDateTime(row.at)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
