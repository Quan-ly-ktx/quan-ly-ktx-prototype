import test from "node:test";
import assert from "node:assert/strict";
import { authService } from "../services/authService.ts";
import { tokenStorage } from "../services/api/tokenStorage.ts";
import type {
  AuthResponse,
  UserProfileResponse,
  VerifyResetPasswordOtpResponse,
  SingleResponse,
  SuccessResponse,
} from "../types/api/endpoints.ts";

test("authService.login performs request, stores tokens, and returns AuthResponse", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    tokenStorage.clearTokens();
  });

  const mockAuthRes: SingleResponse<AuthResponse> = {
    status: "SUCCESS",
    message: "Login successful",
    data: {
      accessToken: "mock_access_token_123",
      refreshToken: "mock_refresh_token_456",
      tokenType: "Bearer",
      expiresIn: 3600,
      user: {
        id: "usr-1",
        username: "manager1",
        email: "manager@ktxhub.vn",
        phone: "0901234567",
        role: "MANAGER",
        status: "ACTIVE",
      },
    },
  };

  let capturedUrl = "";
  let capturedBody = "";
  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    capturedUrl = input.toString();
    capturedBody = (init?.body as string) || "";
    return new Response(JSON.stringify(mockAuthRes), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const result = await authService.login({
    identifier: "manager@ktxhub.vn",
    password: "Password123!",
  });

  assert.ok(capturedUrl.includes("/api/v1/auth/login"));
  assert.equal(JSON.parse(capturedBody).identifier, "manager@ktxhub.vn");
  assert.equal(result.accessToken, "mock_access_token_123");
  assert.equal(tokenStorage.getAccessToken(), "mock_access_token_123");
  assert.equal(tokenStorage.getRefreshToken(), "mock_refresh_token_456");
});

test("authService.getMe fetches user profile", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const mockProfileRes: SingleResponse<UserProfileResponse> = {
    status: "SUCCESS",
    message: "User profile retrieved",
    data: {
      id: "usr-1",
      username: "manager1",
      email: "manager@ktxhub.vn",
      phone: "0901234567",
      role: "MANAGER",
      status: "ACTIVE",
      staffProfile: {
        id: "staff-1",
        fullName: "Thu Lan",
        phone: "0901234567",
        active: true,
      },
    },
  };

  let capturedUrl = "";
  globalThis.fetch = async (input: string | URL | Request) => {
    capturedUrl = input.toString();
    return new Response(JSON.stringify(mockProfileRes), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const profile = await authService.getMe();
  assert.ok(capturedUrl.includes("/api/v1/users/me"));
  assert.equal(profile.id, "usr-1");
  assert.equal(profile.role, "MANAGER");
  assert.equal(profile.staffProfile?.fullName, "Thu Lan");
});

test("authService.changePassword posts to change-password endpoint", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let capturedUrl = "";
  let capturedBody = "";
  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    capturedUrl = input.toString();
    capturedBody = (init?.body as string) || "";
    const res: SuccessResponse = { status: "SUCCESS", message: "Password changed successfully" };
    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  await authService.changePassword({
    oldPassword: "OldPassword123!",
    newPassword: "NewSecurePassword123!",
    confirmPassword: "NewSecurePassword123!",
  });

  assert.ok(capturedUrl.includes("/api/v1/auth/change-password"));
  const parsed = JSON.parse(capturedBody);
  assert.equal(parsed.oldPassword, "OldPassword123!");
  assert.equal(parsed.newPassword, "NewSecurePassword123!");
  assert.equal(parsed.confirmPassword, "NewSecurePassword123!");
});

test("authService.logout clears tokens and calls logout endpoint", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    tokenStorage.clearTokens();
  });

  tokenStorage.setTokens({
    accessToken: "valid_token",
    refreshToken: "valid_refresh",
  });

  let capturedUrl = "";
  globalThis.fetch = async (input: string | URL | Request) => {
    capturedUrl = input.toString();
    return new Response(JSON.stringify({ status: "SUCCESS", message: "Logged out" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  await authService.logout();
  assert.ok(capturedUrl.includes("/api/v1/auth/logout"));
  assert.equal(tokenStorage.getAccessToken(), null);
  assert.equal(tokenStorage.getRefreshToken(), null);
});

test("authService.forgotPassword, verifyForgotPasswordOtp, resetPassword flow", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const urls: string[] = [];
  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    const url = input.toString();
    urls.push(url);

    if (url.includes("/api/v1/auth/forgot-password")) {
      const res: SuccessResponse = { status: "SUCCESS", message: "OTP sent" };
      return new Response(JSON.stringify(res), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("/api/v1/auth/verify-forgot-password-otp")) {
      const res: SingleResponse<VerifyResetPasswordOtpResponse> = {
        status: "SUCCESS",
        message: "OTP valid",
        data: { resetToken: "jwt_reset_token_xyz" },
      };
      return new Response(JSON.stringify(res), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("/api/v1/auth/reset-password")) {
      const res: SuccessResponse = { status: "SUCCESS", message: "Password reset" };
      return new Response(JSON.stringify(res), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: "ERROR" }), { status: 400 });
  };

  await authService.forgotPassword({ email: "user@ktxhub.vn" });
  assert.ok(urls[0].includes("/api/v1/auth/forgot-password"));

  const otpRes = await authService.verifyForgotPasswordOtp({
    email: "user@ktxhub.vn",
    otp: "123456",
  });
  assert.ok(urls[1].includes("/api/v1/auth/verify-forgot-password-otp"));
  assert.equal(otpRes.resetToken, "jwt_reset_token_xyz");

  await authService.resetPassword({
    email: "user@ktxhub.vn",
    resetToken: otpRes.resetToken,
    newPassword: "NewSecurePassword123!",
    confirmPassword: "NewSecurePassword123!",
  });
  assert.ok(urls[2].includes("/api/v1/auth/reset-password"));
});
