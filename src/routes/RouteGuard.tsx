import type { ReactNode } from "react";
import type { Role } from "../types/auth.ts";

export function RouteGuard({
  allowedRoles,
  currentRole,
  fallback = null,
  children,
}: {
  allowedRoles: Role[];
  currentRole: Role | null;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
