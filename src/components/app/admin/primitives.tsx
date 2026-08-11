import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SourceBadge({ source }: { source: "env" | "override" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-[11px]",
        source === "override"
          ? "border-accent/50 bg-accent/15 text-accent-foreground"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      {source}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: "junior" | "senior" | "admin" }) {
  const tone =
    role === "admin"
      ? "border-accent/50 bg-accent/15 text-accent-foreground"
      : role === "senior"
        ? "border-primary/25 bg-primary/10 text-primary"
        : "border-border bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("capitalize", tone)}>
      {role}
    </Badge>
  );
}

export function StatusDot({
  status,
}: {
  status: "connected" | "degraded" | "disconnected";
}) {
  const tone =
    status === "connected"
      ? "bg-success"
      : status === "degraded"
        ? "bg-warning"
        : "bg-muted-foreground/50";
  return (
    <span className="inline-flex items-center gap-2 text-sm capitalize">
      <span className={cn("size-2 rounded-full", tone)} aria-hidden />
      {status}
    </span>
  );
}

export function ActorBadge({ actor }: { actor: "ai" | "human" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "uppercase",
        actor === "ai"
          ? "border-chart-2/40 bg-chart-2/12 text-chart-2"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      {actor}
    </Badge>
  );
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
