import { createContext, useState, useEffect, type ReactNode } from "react";
import type { Role, UserProfile, LoginRequest } from "../types/index.ts";
import { authService } from "../services/authService.ts";
import { tokenStorage } from "../services/api/tokenStorage.ts";
import { env } from "../config/env.ts";
import { demoLogin, demoLogout } from "../services/mock/mockAuth.ts";
import { toFrontendUserProfile } from "../services/api/adapters/authAdapter.ts";

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
    if (env.USE_MOCK) return;
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
      if (env.USE_MOCK) {
        const profile = await demoLogin(credentials);
        setCurrentUser(profile);
        setRole(profile.role);
        return;
      }
      try {
        const authData = await authService.login(credentials);
        const profile = toFrontendUserProfile(await authService.getMe());
        if (profile.userId !== authData.user.id) throw new Error("Thông tin phiên không khớp.");
        setCurrentUser(profile);
        setRole(profile.role);
      } catch (error) {
        tokenStorage.clearTokens();
        setCurrentUser(null);
        setRole(null);
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = (roleOrCredentials: Role | LoginRequest): Promise<void> | void => {
    if (isLoginRequest(roleOrCredentials)) {
      return loginWithCredentials(roleOrCredentials);
    }
    throw new Error("Vui lòng đăng nhập bằng thông tin tài khoản.");
  };

  const logout = (): Promise<void> | void => {
    if (env.USE_MOCK) demoLogout();
    setRole(null);
    setCurrentUser(null);
    if (!env.USE_MOCK) return authService.logout().catch(() => {
      // Local session is cleared even when server logout fails.
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
