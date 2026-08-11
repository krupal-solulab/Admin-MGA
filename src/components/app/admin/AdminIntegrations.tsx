import { useSuspenseQuery } from "@tanstack/react-query";

import { PageHeader } from "../AppShell";
import { StatusDot, formatDateTime } from "./primitives";
import { connectorsQuery } from "@/lib/admin-queries";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminIntegrations() {
  const { data: connectors } = useSuspenseQuery(connectorsQuery);

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Tenant-scoped connector inventory shared with the Foundation settings panel — read the same source, manage it here."
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Connector</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Last sync</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connectors.map((connector) => (
                <TableRow key={connector.id}>
                  <TableCell className="font-medium">{connector.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {connector.category}
                  </TableCell>
                  <TableCell>
                    <StatusDot status={connector.status} />
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {connector.lastSyncedAt ? formatDateTime(connector.lastSyncedAt) : "Never"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
