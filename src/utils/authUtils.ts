import type { Role } from "../types/index.ts";

export function resolveRole(email: string): Role | null {
  const value = email.trim().toLowerCase();
  if (!/^[^\s@]+@gmail\.com$/.test(value)) return null;
  if (value.startsWith("tenant") || value.startsWith("student")) return "tenant";
  if (value.startsWith("tech")) return "technician";
  if (value.startsWith("manager") || value.startsWith("admin")) return "manager";
  return null;
}
