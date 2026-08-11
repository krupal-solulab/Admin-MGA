import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { PageHeader } from "../AppShell";
import { ActorBadge, formatDateTime } from "./primitives";
import { AUDIT_WORKFLOWS } from "@/lib/admin-api";
import { auditQuery } from "@/lib/admin-queries";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminAudit() {
  const [workflow, setWorkflow] = useState("all");
  const [actor, setActor] = useState("all");
  const { data: rows, isPending } = useQuery(auditQuery({ workflow, actor }));

  return (
    <div>
      <PageHeader
        title="Activity log"
        description="Every AI and human decision recorded for this tenant, filterable by workflow and actor."
        actions={
          <div className="flex gap-2">
            <Select value={workflow} onValueChange={setWorkflow}>
              <SelectTrigger className="w-[190px]" aria-label="Filter by workflow">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All workflows</SelectItem>
                {AUDIT_WORKFLOWS.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actor} onValueChange={setActor}>
              <SelectTrigger className="w-[150px]" aria-label="Filter by actor">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actors</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
                <SelectItem value="human">Human</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">When</TableHead>
                <TableHead className="w-[90px]">Actor</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="w-[170px]">Workflow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows && rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(row.at)}
                    </TableCell>
                    <TableCell>
                      <ActorBadge actor={row.actor} />
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{row.what}</p>
                      <p className="text-xs text-muted-foreground">{row.who}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {row.workflow}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No activity matches these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
