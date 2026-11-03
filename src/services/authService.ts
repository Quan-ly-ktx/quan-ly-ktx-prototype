import { httpClient } from "./httpClient.ts";
import { tokenStorage } from "./api/tokenStorage.ts";
import type {
  LoginRequest,
  AuthResponse,
  UserProfileResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  VerifyResetPasswordOtpResponse,
  ResetPasswordRequest,
  SingleResponse,
  SuccessResponse,
} from "../types/api/endpoints.ts";

export const authService = {
  async login(req: LoginRequest): Promise<AuthResponse> {
    const res = await httpClient.post<SingleResponse<AuthResponse> | AuthResponse>(
      "/auth/login",
      req,
      { skipAuth: true },
    );

    const authData: AuthResponse =
      "data" in res && res.data ? (res.data as AuthResponse) : (res as AuthResponse);

    if (authData.accessToken) {
      tokenStorage.setTokens({
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        tokenType: authData.tokenType,
        expiresIn: authData.expiresIn,
      });
    }

    return authData;
  },

  async logout(): Promise<void> {
    try {
      if (tokenStorage.getAccessToken()) {
        await httpClient.post<SuccessResponse | Record<string, unknown>>(
          "/auth/logout",
          {},
        );
      }
    } finally {
      tokenStorage.clearTokens();
    }
  },

  async getMe(): Promise<UserProfileResponse> {
    const res = await httpClient.get<
      SingleResponse<UserProfileResponse> | UserProfileResponse
    >("/users/me");

    return "data" in res && res.data
      ? (res.data as UserProfileResponse)
      : (res as UserProfileResponse);
  },

  async changePassword(req: ChangePasswordRequest): Promise<void> {
    await httpClient.post<SuccessResponse | Record<string, unknown>>(
      "/auth/change-password",
      req,
    );
  },

  async forgotPassword(req: ForgotPasswordRequest): Promise<void> {
    await httpClient.post<SuccessResponse | Record<string, unknown>>(
      "/auth/forgot-password",
      req,
      { skipAuth: true },
    );
  },

  async verifyForgotPasswordOtp(
    req: VerifyOtpRequest,
  ): Promise<VerifyResetPasswordOtpResponse> {
    const res = await httpClient.post<
      | SingleResponse<VerifyResetPasswordOtpResponse>
      | VerifyResetPasswordOtpResponse
    >("/auth/verify-forgot-password-otp", req, { skipAuth: true });

    return "data" in res && res.data
      ? (res.data as VerifyResetPasswordOtpResponse)
      : (res as VerifyResetPasswordOtpResponse);
  },

  async resetPassword(req: ResetPasswordRequest): Promise<void> {
    await httpClient.post<SuccessResponse | Record<string, unknown>>(
      "/auth/reset-password",
      req,
      { skipAuth: true },
    );
  },
};
