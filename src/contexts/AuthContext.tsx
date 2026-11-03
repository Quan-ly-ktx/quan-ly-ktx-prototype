import { createContext, useState, type ReactNode } from "react";
import type { Role } from "../types/index.ts";

export type AuthContextType = {
  role: Role | null;
  login: (role: Role) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialRole = null,
}: {
  children: ReactNode;
  initialRole?: Role | null;
}) {
  const [role, setRole] = useState<Role | null>(initialRole);

  const login = (newRole: Role) => setRole(newRole);
  const logout = () => setRole(null);

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
