export interface TokenData {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
}

const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

function hasLocalStorage(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined" &&
      window.localStorage !== null
    );
  } catch {
    return false;
  }
}

export const tokenStorage = {
  getAccessToken(): string | null {
    if (hasLocalStorage()) {
      return window.localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return inMemoryAccessToken;
  },

  getRefreshToken(): string | null {
    if (hasLocalStorage()) {
      return window.localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return inMemoryRefreshToken;
  },

  setTokens(tokens: { accessToken: string; refreshToken: string; tokenType?: string; expiresIn?: number }): void {
    if (hasLocalStorage()) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
    inMemoryAccessToken = tokens.accessToken;
    inMemoryRefreshToken = tokens.refreshToken;
  },

  clearTokens(): void {
    if (hasLocalStorage()) {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
  },
};
