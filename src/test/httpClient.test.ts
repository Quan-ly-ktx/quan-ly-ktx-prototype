import test from "node:test";
import assert from "node:assert/strict";
import { httpClient, ApiError, request } from "../services/httpClient.ts";
import { tokenStorage } from "../services/api/tokenStorage.ts";

test("httpClient adds Authorization header when token exists", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    tokenStorage.clearTokens();
  });

  tokenStorage.setTokens({
    accessToken: "jwt_token_abc",
    refreshToken: "refresh_token_xyz",
  });

  let capturedHeaders: HeadersInit | undefined;
  globalThis.fetch = async (_input: string | URL | Request, init?: RequestInit) => {
    capturedHeaders = init?.headers;
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const res = await httpClient.get<{ success: boolean }>("/test-endpoint");
  assert.equal(res.success, true);
  
  const headers = capturedHeaders as Record<string, string>;
  assert.equal(headers["Authorization"], "Bearer jwt_token_abc");
});

test("httpClient handles 401 and refreshes token successfully", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    tokenStorage.clearTokens();
  });

  tokenStorage.setTokens({
    accessToken: "expired_token",
    refreshToken: "valid_refresh_token",
  });

  const calls: string[] = [];
  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    const url = input.toString();
    calls.push(url);

    if (url.includes("/test-protected")) {
      const authHeader = (init?.headers as Record<string, string>)?.["Authorization"];
      if (authHeader === "Bearer new_access_token") {
        return new Response(JSON.stringify({ data: "protected_data" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({
          httpStatus: 401,
          errorCode: "TOKEN_EXPIRED",
          message: "Token has expired",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (url.includes("/api/v1/auth/refresh-token")) {
      const body = JSON.parse((init?.body as string) || "{}");
      assert.equal(body.refreshToken, "valid_refresh_token");
      return new Response(
        JSON.stringify({
          httpStatus: "OK",
          message: "Refreshed",
          data: {
            accessToken: "new_access_token",
            refreshToken: "new_refresh_token",
            tokenType: "Bearer",
            expiresIn: 3600,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response("Not found", { status: 404 });
  };

  const res = await httpClient.get<{ data: string }>("/test-protected");
  assert.equal(res.data, "protected_data");
  assert.equal(tokenStorage.getAccessToken(), "new_access_token");
  assert.equal(tokenStorage.getRefreshToken(), "new_refresh_token");
});

test("httpClient clears tokens and throws ApiError when refresh token fails on 401", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    tokenStorage.clearTokens();
  });

  tokenStorage.setTokens({
    accessToken: "bad_access_token",
    refreshToken: "invalid_refresh_token",
  });

  globalThis.fetch = async (input: string | URL | Request) => {
    const url = input.toString();
    if (url.includes("/api/v1/auth/refresh-token")) {
      return new Response(
        JSON.stringify({
          httpStatus: 401,
          errorCode: "INVALID_REFRESH_TOKEN",
          message: "Refresh token is invalid or expired",
          timestamp: new Date().toISOString(),
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(
      JSON.stringify({
        httpStatus: 401,
        errorCode: "UNAUTHORIZED",
        message: "Unauthorized",
        timestamp: new Date().toISOString(),
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  };

  await assert.rejects(
    async () => {
      await httpClient.get("/test-protected");
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 401);
      assert.equal(tokenStorage.getAccessToken(), null);
      assert.equal(tokenStorage.getRefreshToken(), null);
      return true;
    },
  );
});

test("httpClient does not refresh when request itself is auth endpoint (avoid infinite loop)", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    tokenStorage.clearTokens();
  });

  tokenStorage.setTokens({
    accessToken: "some_access",
    refreshToken: "some_refresh",
  });

  let refreshCallCount = 0;
  globalThis.fetch = async (input: string | URL | Request) => {
    const url = input.toString();
    if (url.includes("/api/v1/auth/refresh-token")) {
      refreshCallCount++;
      return new Response(JSON.stringify({ message: "refresh response" }), { status: 401 });
    }
    if (url.includes("/api/v1/auth/login")) {
      return new Response(
        JSON.stringify({
          httpStatus: 401,
          errorCode: "BAD_CREDENTIALS",
          message: "Tên đăng nhập hoặc mật khẩu không chính xác",
          timestamp: new Date().toISOString(),
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response("Not found", { status: 404 });
  };

  await assert.rejects(
    async () => {
      await httpClient.post("/api/v1/auth/login", { identifier: "a", password: "b" });
    },
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 401);
      assert.equal(err.message, "Tên đăng nhập hoặc mật khẩu không chính xác");
      return true;
    },
  );

  assert.equal(refreshCallCount, 0, "Should not call refresh-token for /api/v1/auth/login 401");
});
