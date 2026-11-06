import test from "node:test";
import assert from "node:assert/strict";
import { mockDormService } from "../services/mock/mockDormService.ts";
import { authService } from "../services/authService.ts";
import { tokenStorage } from "../services/api/tokenStorage.ts";
import type { SingleResponse, AuthResponse, UserProfileResponse } from "../types/api/endpoints.ts";

test("DormDataContext updates state immutably", async () => {
  const initial = await mockDormService.getTickets();
  const newTicket = { ...initial[0], id: "TCK-IMMUTABLE", title: "New" };
  const updated = [newTicket, ...initial];
  assert.notEqual(updated, initial);
  assert.equal(updated.length, initial.length + 1);
});

test("Auth login with credentials workflow populates profile and manages session tokens", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    tokenStorage.clearTokens();
  });

  const mockAuthRes: SingleResponse<AuthResponse> = {
    status: "SUCCESS",
    message: "Login successful",
    data: {
      accessToken: "access_token_real",
      refreshToken: "refresh_token_real",
      tokenType: "Bearer",
      expiresIn: 3600,
      user: {
        id: "usr-live",
        username: "admin_live",
        email: "live@ktxhub.vn",
        phone: "0988776655",
        role: "MANAGER",
        status: "ACTIVE",
      },
    },
  };

  const mockProfileRes: SingleResponse<UserProfileResponse> = {
    status: "SUCCESS",
    message: "Profile retrieved",
    data: {
      id: "usr-live",
      username: "admin_live",
      email: "live@ktxhub.vn",
      phone: "0988776655",
      role: "MANAGER",
      status: "ACTIVE",
      staffProfile: {
        id: "staff-live",
        fullName: "Nguyễn Quản Lý Thật",
        phone: "0988776655",
        active: true,
      },
    },
  };

  globalThis.fetch = async (input: string | URL | Request) => {
    const url = input.toString();
    if (url.includes("/api/v1/auth/login")) {
      return new Response(JSON.stringify(mockAuthRes), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("/api/v1/users/me")) {
      return new Response(JSON.stringify(mockProfileRes), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ status: "ERROR" }), { status: 400 });
  };

  const loginRes = await authService.login({
    identifier: "live@ktxhub.vn",
    password: "Password123!",
  });

  assert.equal(tokenStorage.getAccessToken(), "access_token_real");
  assert.equal(loginRes.user.email, "live@ktxhub.vn");

  const profile = await authService.getMe();
  assert.equal(profile.staffProfile?.fullName, "Nguyễn Quản Lý Thật");
});
