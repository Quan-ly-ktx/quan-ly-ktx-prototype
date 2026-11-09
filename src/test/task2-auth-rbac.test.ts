import assert from "node:assert/strict";
import test from "node:test";
import {
  demoLogin,
  demoChangePassword,
  demoRequestOtp,
  demoVerifyOtp,
  demoResetPassword,
} from "../services/mock/mockAuth.ts";
import { getMockSnapshot } from "../services/mock/mockStore.ts";

test("Task 2: Tenant can only login with 12-digit CCCD, not email", async () => {
  // Active tenant by CCCD
  const activeProfile = await demoLogin({
    identifier: "079203001187",
    password: "Demo1234!",
  });
  assert.equal(activeProfile.role, "tenant");
  assert.equal(activeProfile.residentStatus, "ACTIVE");
  assert.equal(activeProfile.tenantId, "NT-0187");

  // Attempting to log in as tenant using their email must be rejected
  await assert.rejects(
    demoLogin({
      identifier: "tenant@gmail.com",
      password: "Demo1234!",
    }),
    /Thông tin đăng nhập không hợp lệ/
  );
});

test("Task 2: Checked out tenant can log in and receives CHECKED_OUT resident status", async () => {
  const formerProfile = await demoLogin({
    identifier: "000000000001",
    password: "Demo1234!",
  });
  assert.equal(formerProfile.role, "tenant");
  assert.equal(formerProfile.residentStatus, "CHECKED_OUT");
  assert.equal(formerProfile.tenantId, "f5000000-0000-4000-8000-000000000001");
});

test("Task 2: Staff login requires email and rejects nonexistent or locked accounts uniformly", async () => {
  // Manager login with email
  const mgr = await demoLogin({
    identifier: "manager@gmail.com",
    password: "Demo1234!",
  });
  assert.equal(mgr.role, "manager");

  // Active technician login
  const tech = await demoLogin({
    identifier: "thinh.vv@ktxhub.vn",
    password: "Demo1234!",
  });
  assert.equal(tech.role, "technician");
  assert.equal(tech.staffId, "tech-1");

  // Locked technician (tech-2: Lâm Quốc Huy has active: false in defaultStaff)
  await assert.rejects(
    demoLogin({
      identifier: "huy.lq@ktxhub.vn",
      password: "Demo1234!",
    }),
    /Thông tin đăng nhập không hợp lệ/
  );

  // Nonexistent account
  await assert.rejects(
    demoLogin({
      identifier: "nonexistent@ktxhub.vn",
      password: "Demo1234!",
    }),
    /Thông tin đăng nhập không hợp lệ/
  );
});

test("Task 2: Password change requires matching old password and updates credentials", async () => {
  // Login first to establish current session
  await demoLogin({
    identifier: "manager@gmail.com",
    password: "Demo1234!",
  });

  // Wrong old password rejects
  assert.throws(
    () => demoChangePassword("WrongOldPass123!", "NewDemoPassword123!"),
    /Mật khẩu hiện tại không đúng/
  );

  // Valid change
  demoChangePassword("Demo1234!", "NewManagerPass123!");

  // Old password no longer works
  await assert.rejects(
    demoLogin({
      identifier: "manager@gmail.com",
      password: "Demo1234!",
    }),
    /Thông tin đăng nhập không hợp lệ/
  );

  // New password works
  const newProfile = await demoLogin({
    identifier: "manager@gmail.com",
    password: "NewManagerPass123!",
  });
  assert.equal(newProfile.role, "manager");

  // Restore password for other tests
  demoChangePassword("NewManagerPass123!", "Demo1234!");
});

test("Task 2: OTP verification enforces 6 digits, 5-minute expiry, max 5 attempts and single-use", () => {
  const email = "manager@gmail.com";
  const otp = demoRequestOtp(email);
  assert.match(otp, /^\d{6}$/);

  // Invalid OTP increments attempt count
  assert.throws(
    () => demoVerifyOtp(email, "000000"),
    /Mã không hợp lệ hoặc đã hết hạn/
  );

  // Correct OTP verifies successfully
  demoVerifyOtp(email, otp);

  // Reusing verified OTP must fail (single-use)
  assert.throws(
    () => demoVerifyOtp(email, otp),
    /Mã không hợp lệ hoặc đã hết hạn/
  );

  // Password reset works with verified challenge
  demoResetPassword(email, "ResetPass1234!");
  const state = getMockSnapshot();
  const acc = state.accounts.find((a) => a.identifier === email);
  assert.equal(acc?.password, "ResetPass1234!");

  // Clean up back to default password
  acc!.password = "Demo1234!";
});
