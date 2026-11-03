import { createContext, useState, useEffect, type ReactNode } from "react";
import type { Role, UserProfile, LoginRequest } from "../types/index.ts";
import { authService } from "../services/authService.ts";
import { tokenStorage } from "../services/api/tokenStorage.ts";
import {
  toFrontendRole,
  toFrontendUserProfile,
} from "../services/api/adapters/authAdapter.ts";

export type AuthContextType = {
  role: Role | null;
  currentUser: UserProfile | null;
  isLoading: boolean;
  login: (roleOrCredentials: Role | LoginRequest) => Promise<void> | void;
  loginWithCredentials: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void> | void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isLoginRequest(val: unknown): val is LoginRequest {
  return (
    typeof val === "object" &&
    val !== null &&
    "identifier" in val &&
    "password" in val
  );
}

export function AuthProvider({
  children,
  initialRole = null,
  initialUser = null,
}: {
  children: ReactNode;
  initialRole?: Role | null;
  initialUser?: UserProfile | null;
}) {
  const [role, setRole] = useState<Role | null>(initialRole);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize from token if available on mount
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (token && !role) {
      let isMounted = true;
      setIsLoading(true);
      authService
        .getMe()
        .then((profileRes) => {
          if (isMounted) {
            const userProfile = toFrontendUserProfile(profileRes);
            setCurrentUser(userProfile);
            setRole(userProfile.role);
          }
        })
        .catch(() => {
          if (isMounted) {
            tokenStorage.clearTokens();
            setRole(null);
            setCurrentUser(null);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [role]);

  const loginWithCredentials = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const authData = await authService.login(credentials);
      const frontendRole = toFrontendRole(authData.user.role);
      setRole(frontendRole);

      // Attempt to load full profile
      try {
        const profileRes = await authService.getMe();
        setCurrentUser(toFrontendUserProfile(profileRes));
      } catch {
        setCurrentUser({
          name: authData.user.username,
          email: authData.user.email,
          role: frontendRole,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = (roleOrCredentials: Role | LoginRequest): Promise<void> | void => {
    if (isLoginRequest(roleOrCredentials)) {
      return loginWithCredentials(roleOrCredentials);
    }
    // Backward compatibility with demo buttons and test suites
    setRole(roleOrCredentials);
    setCurrentUser({
      name:
        roleOrCredentials === "manager"
          ? "Quản lý KTX"
          : roleOrCredentials === "technician"
            ? "Kỹ thuật viên"
            : "Sinh viên",
      email: `${roleOrCredentials}@ktxhub.vn`,
      role: roleOrCredentials,
    });
  };

  const logout = (): Promise<void> | void => {
    setRole(null);
    setCurrentUser(null);
    return authService.logout().catch(() => {
      // Ignored: tokenStorage is cleared in authService.logout() finally block
    });
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        currentUser,
        isLoading,
        login,
        loginWithCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
