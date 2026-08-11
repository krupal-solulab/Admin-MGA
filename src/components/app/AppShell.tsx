import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  UserCog,
  SlidersHorizontal,
  Plug,
  ScrollText,
  ShieldCheck,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { ROLE_IDENTITY, useRole, type Role } from "./role";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const adminNav: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/users", label: "Users", icon: UserCog },
  { to: "/settings", label: "Platform Settings", icon: SlidersHorizontal },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/audit", label: "Activity Log", icon: ScrollText },
];

function Sidebar({ pathname }: { pathname: string }) {
  const { role } = useRole();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="grid size-9 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold text-sidebar-accent-foreground">
            Coverline OS
          </p>
          <p className="text-[11px] text-sidebar-foreground/60">MGA vertical</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="text-eyebrow px-2 pb-2 text-sidebar-foreground/45">Admin</p>
        {role === "admin" ? (
          adminNav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon
                  className={cn("size-4", active && "text-sidebar-primary")}
                  aria-hidden
                />
                {item.label}
              </Link>
            );
          })
        ) : (
          <p className="px-3 text-sm text-sidebar-foreground/55">
            Admin navigation is hidden for the {role} role.
          </p>
        )}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4 text-[11px] text-sidebar-foreground/55">
        Tenant-scoped · demo-mga
      </div>
    </aside>
  );
}

function RoleSwitcher() {
  const { role, setRole } = useRole();
  const identity = ROLE_IDENTITY[role];

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right leading-tight sm:block">
        <p className="text-sm font-semibold">{identity.name}</p>
        <p className="text-xs text-muted-foreground">{identity.title}</p>
      </div>
      <div className="grid size-9 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {identity.initials}
      </div>
      <Select value={role} onValueChange={(v) => setRole(v as Role)}>
        <SelectTrigger className="w-[150px]" aria-label="Switch demo role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Platform Admin</SelectItem>
          <SelectItem value="senior">Senior UW</SelectItem>
          <SelectItem value="junior">Junior UW</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function buildCrumbs(pathname: string): string[] {
  const match = adminNav.find((n) => n.to === pathname);
  return ["Admin", match?.label ?? "Overview"];
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const { role } = useRole();
  if (role === "admin") return <>{children}</>;

  return (
    <div className="panel mx-auto mt-10 max-w-lg p-8 text-center">
      <div className="mx-auto grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="size-5" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold">Admin access required</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The {role} role has no admin visibility. Switch to Platform Admin in the header to
        continue.
      </p>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumbs = buildCrumbs(pathname);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar pathname={pathname} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-6 py-3">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={c}>
                {i > 0 ? <span className="px-2 text-border">/</span> : null}
                <span className={i === crumbs.length - 1 ? "text-foreground" : undefined}>{c}</span>
              </span>
            ))}
          </nav>
          <RoleSwitcher />
        </header>
        <main className="flex-1 px-6 py-8 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
