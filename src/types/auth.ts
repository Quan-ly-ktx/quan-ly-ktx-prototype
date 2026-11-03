export type Role = "manager" | "student" | "technician";

export const ROLES: Role[] = ["manager", "student", "technician"];

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
