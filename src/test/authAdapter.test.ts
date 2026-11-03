import test from "node:test";
import assert from "node:assert/strict";
import {
  toFrontendRole,
  toBackendRole,
  toFrontendUserProfile,
} from "../services/api/adapters/authAdapter.ts";
import type { UserProfileResponse } from "../types/auth.ts";

test("authAdapter converts role between backend and frontend correctly", () => {
  assert.equal(toFrontendRole("MANAGER"), "manager");
  assert.equal(toFrontendRole("TECHNICIAN"), "technician");
  assert.equal(toFrontendRole("TENANT"), "student");

  assert.equal(toBackendRole("manager"), "MANAGER");
  assert.equal(toBackendRole("technician"), "TECHNICIAN");
  assert.equal(toBackendRole("student"), "TENANT");
});

test("authAdapter converts UserProfileResponse to UserProfile correctly", () => {
  const staffProfile: UserProfileResponse = {
    id: "usr-1",
    username: "manager1",
    email: "manager@ktxhub.vn",
    phone: "0901234567",
    role: "MANAGER",
    status: "ACTIVE",
    staffProfile: {
      id: "staff-1",
      fullName: "Nguyễn Thu Lan",
      phone: "0901234567",
      active: true,
    },
  };

  const staffFrontend = toFrontendUserProfile(staffProfile);
  assert.equal(staffFrontend.name, "Nguyễn Thu Lan");
  assert.equal(staffFrontend.email, "manager@ktxhub.vn");
  assert.equal(staffFrontend.role, "manager");

  const tenantProfile: UserProfileResponse = {
    id: "usr-2",
    username: "tenant1",
    email: "student@ktxhub.vn",
    phone: "0907654321",
    role: "TENANT",
    status: "ACTIVE",
    tenantProfile: {
      id: "ten-1",
      tenantCode: "SV001",
      fullName: "Trần Sinh Viên",
      gender: "Nam",
      idCardNumber: "001200000001",
      phone: "0907654321",
      email: "student@ktxhub.vn",
      permanentAddress: "Hà Nội",
    },
  };

  const tenantFrontend = toFrontendUserProfile(tenantProfile);
  assert.equal(tenantFrontend.name, "Trần Sinh Viên");
  assert.equal(tenantFrontend.email, "student@ktxhub.vn");
  assert.equal(tenantFrontend.role, "student");

  const fallbackProfile: UserProfileResponse = {
    id: "usr-3",
    username: "tech_user",
    email: "tech@ktxhub.vn",
    phone: "0911222333",
    role: "TECHNICIAN",
    status: "ACTIVE",
  };

  const techFrontend = toFrontendUserProfile(fallbackProfile);
  assert.equal(techFrontend.name, "tech_user");
  assert.equal(techFrontend.email, "tech@ktxhub.vn");
  assert.equal(techFrontend.role, "technician");
});
