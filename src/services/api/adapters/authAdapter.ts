import type {
  Role,
  BackendUserRole,
  UserProfileResponse,
  UserProfile,
} from "../../../types/index.ts";

export function toFrontendRole(backendRole: string): Role {
  switch (backendRole.toUpperCase()) {
    case "MANAGER":
    case "ADMIN":
      return "manager";
    case "TECHNICIAN":
      return "technician";
    case "TENANT":
    case "STUDENT":
      return "tenant";
    default:
      return "tenant";
  }
}

export function toBackendRole(frontendRole: Role): BackendUserRole {
  switch (frontendRole) {
    case "manager":
      return "MANAGER";
    case "technician":
      return "TECHNICIAN";
    case "tenant":
    case "student":
      return "TENANT";
    default:
      return "TENANT";
  }
}

export function toFrontendUserProfile(res: UserProfileResponse): UserProfile {
  let name = res.username;
  if (res.staffProfile?.fullName) {
    name = res.staffProfile.fullName;
  } else if (res.tenantProfile?.fullName) {
    name = res.tenantProfile.fullName;
  }

  return {
    name,
    email: res.email,
    role: toFrontendRole(res.role),
  };
}
