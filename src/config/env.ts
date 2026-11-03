export const env = {
  USE_MOCK:
    typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.VITE_USE_MOCK !== "false"
      : true,
  API_BASE_URL:
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
    "http://localhost:8080/api/v1",
};
