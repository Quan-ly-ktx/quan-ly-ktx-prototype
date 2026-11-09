import type {
  Role,
  BackendUserRole,
  UserProfileResponse,
  UserProfile,
} from "../../../types/index.ts";

export function toFrontendRole(backendRole: string): Role {
  switch (backendRole.toUpperCase()) {
    case "MANAGER":
      return "manager";
    case "TECHNICIAN":
      return "technician";
    case "TENANT":
      return "tenant";
    default:
      throw new Error("Vai trò tài khoản không được hỗ trợ.");
  }
}

export function toBackendRole(frontendRole: Role): BackendUserRole {
  switch (frontendRole) {
    case "manager":
      return "MANAGER";
    case "technician":
      return "TECHNICIAN";
    case "tenant":
      return "TENANT";
    default:
      return "TENANT";
  }
}

export function toFrontendUserProfile(res: UserProfileResponse): UserProfile {
  let name = res.username;
  if (!res.id || (res.role === "TENANT" && !res.tenantProfile?.id)) {
    throw new Error("Không thể xác định hồ sơ tài khoản.");
  }
  if (res.staffProfile?.fullName) {
    name = res.staffProfile.fullName;
  } else if (res.tenantProfile?.fullName) {
    name = res.tenantProfile.fullName;
  }

  return {
    name,
    email: res.email,
    role: toFrontendRole(res.role),
    userId: res.id,
    staffId: res.staffProfile?.id,
    tenantId: res.tenantProfile?.id,
    residentStatus: res.tenantProfile?.residentStatus,
  };
}
