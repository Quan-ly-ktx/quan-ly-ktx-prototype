import { env } from "../config/env.ts";
import { tokenStorage } from "./api/tokenStorage.ts";
import type { DetailedErrorResponse, SingleResponse, AuthResponse } from "../types/api/endpoints.ts";

export type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
};

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly data?: unknown;
  readonly errorCode?: string;

  constructor(status: number, statusText: string, data?: unknown) {
    let detailedMessage = `API Error ${status}: ${statusText}`;
    let extractedCode: string | undefined;

    if (data && typeof data === "object") {
      if ("message" in data && typeof data.message === "string") {
        detailedMessage = data.message;
      }
      if ("errorCode" in data && typeof data.errorCode === "string") {
        extractedCode = data.errorCode;
      }
    }

    super(detailedMessage);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.errorCode = extractedCode;
  }
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    tokenStorage.clearTokens();
    return null;
  }

  try {
    const refreshUrl = `${env.API_BASE_URL}/auth/refresh-token`;
    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      tokenStorage.clearTokens();
      return null;
    }

    const json: unknown = await response.json();
    let authData: AuthResponse | null = null;

    if (json && typeof json === "object") {
      if ("data" in json && json.data && typeof json.data === "object" && "accessToken" in json.data) {
        authData = json.data as AuthResponse;
      } else if ("accessToken" in json) {
        authData = json as AuthResponse;
      }
    }

    if (authData && authData.accessToken) {
      tokenStorage.setTokens({
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken || refreshToken,
        tokenType: authData.tokenType,
        expiresIn: authData.expiresIn,
      });
      return authData.accessToken;
    }

    tokenStorage.clearTokens();
    return null;
  } catch {
    tokenStorage.clearTokens();
    return null;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, headers, skipAuth, ...customConfig } = options;
  const url = new URL(
    endpoint.startsWith("http") ? endpoint : `${env.API_BASE_URL}${endpoint}`,
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const token = !skipAuth ? tokenStorage.getAccessToken() : null;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string> | undefined),
  };

  const config: RequestInit = {
    headers: requestHeaders,
    ...customConfig,
  };

  let response = await fetch(url.toString(), config);

  // Check for 401 Unauthorized
  const isAuthEndpoint =
    url.pathname.includes("/auth/login") ||
    url.pathname.includes("/auth/refresh-token") ||
    url.pathname.includes("/auth/forgot-password") ||
    url.pathname.includes("/auth/verify-forgot-password-otp") ||
    url.pathname.includes("/auth/reset-password");

  if (response.status === 401 && !isAuthEndpoint && !skipAuth) {
    // Attempt token refresh
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const newAccessToken = await refreshPromise;

    if (newAccessToken) {
      // Retry request once with new token
      const retryHeaders: Record<string, string> = {
        ...requestHeaders,
        Authorization: `Bearer ${newAccessToken}`,
      };

      response = await fetch(url.toString(), {
        ...config,
        headers: retryHeaders,
      });
    }
  }

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new ApiError(response.status, response.statusText, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const httpClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: "GET", ...options }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: "DELETE", ...options }),
};
