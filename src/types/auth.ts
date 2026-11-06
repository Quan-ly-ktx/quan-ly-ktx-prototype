export type Role = "manager" | "tenant" | "technician";

export const ROLES: Role[] = ["manager", "tenant", "technician"];

export type Person = {
  name: string;
  gender: "Nam" | "Nữ";
  phone: string;
  cccd: string;
  email: string;
  address: string;
};

export type UserProfile = {
  name: string;
  email: string;
  role: Role;
  avatar?: string;
};

export type LoginCredentials = {
  email: string;
  password?: string;
  remember?: boolean;
};

export type BackendUserRole = "MANAGER" | "TECHNICIAN" | "TENANT";
export type BackendUserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";
export type BackendResidentStatus = "ACTIVE" | "CHECKED_OUT" | "RESERVED";

export type StaffInfo = {
  id: string;
  fullName: string;
  phone: string;
  active: boolean;
};

export type TenantInfo = {
  id: string;
  tenantCode: string;
  fullName: string;
  gender: string;
  idCardNumber: string;
  phone: string;
  email: string;
  permanentAddress: string;
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  residentStatus?: BackendResidentStatus;
};

export type UserProfileResponse = {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: BackendUserRole;
  status: BackendUserStatus;
  staffProfile?: StaffInfo | null;
  tenantProfile?: TenantInfo | null;
};

export type UserResponse = {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: BackendUserRole;
  status: BackendUserStatus;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
};

export type LoginRequest = {
  identifier: string;
  password: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type VerifyOtpRequest = {
  email: string;
  otp: string;
};

export type VerifyResetPasswordOtpResponse = {
  resetToken: string;
};

export type ResetPasswordRequest = {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
};
