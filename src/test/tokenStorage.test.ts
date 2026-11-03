import test from "node:test";
import assert from "node:assert/strict";
import { tokenStorage } from "../services/api/tokenStorage.ts";

test("tokenStorage saves, retrieves, and clears tokens correctly", () => {
  tokenStorage.setTokens({
    accessToken: "test_access",
    refreshToken: "test_refresh",
    tokenType: "Bearer",
    expiresIn: 3600,
  });

  assert.equal(tokenStorage.getAccessToken(), "test_access");
  assert.equal(tokenStorage.getRefreshToken(), "test_refresh");

  tokenStorage.clearTokens();
  assert.equal(tokenStorage.getAccessToken(), null);
  assert.equal(tokenStorage.getRefreshToken(), null);
});

test("tokenStorage handles missing or null window.localStorage gracefully", () => {
  // Test fallback in node / memory environment
  tokenStorage.setTokens({
    accessToken: "mem_access",
    refreshToken: "mem_refresh",
  });
  assert.equal(tokenStorage.getAccessToken(), "mem_access");
  assert.equal(tokenStorage.getRefreshToken(), "mem_refresh");
  tokenStorage.clearTokens();
  assert.equal(tokenStorage.getAccessToken(), null);
  assert.equal(tokenStorage.getRefreshToken(), null);
});
