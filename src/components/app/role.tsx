import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Role } from "@/lib/admin-api";

export type { Role };

export const ROLE_IDENTITY: Record<Role, { name: string; title: string; initials: string }> = {
  senior: { name: "Priya R.", title: "Sr. Underwriter", initials: "PR" },
  junior: { name: "Sofia A.", title: "Jr. Underwriter", initials: "SA" },
  admin: { name: "Alex M.", title: "Platform Admin", initials: "AM" },
};

export const DEMO_LOGINS: { email: string; role: Role; label: string }[] = [
  { email: "admin@coverline.test", role: "admin", label: "Platform Admin" },
  { email: "senior@coverline.test", role: "senior", label: "Senior UW" },
  { email: "junior@coverline.test", role: "junior", label: "Junior UW" },
];

const STORAGE_KEY = "coverline.role";

type RoleContextValue = { role: Role; setRole: (role: Role) => void };

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("admin");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "admin" || stored === "senior" || stored === "junior") setRole(stored);
  }, []);

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      setRole: (next) => {
        window.localStorage.setItem(STORAGE_KEY, next);
        setRole(next);
      },
    }),
    [role],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}

export function useIsAdmin(): boolean {
  return useRole().role === "admin";
}
