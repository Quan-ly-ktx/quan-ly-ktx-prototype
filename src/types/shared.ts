export type IconName =
  | "activity"
  | "alert"
  | "bell"
  | "bed"
  | "bolt"
  | "building"
  | "calendar"
  | "chevron"
  | "clipboard"
  | "close"
  | "contract"
  | "dashboard"
  | "droplet"
  | "file"
  | "grid"
  | "invoice"
  | "menu"
  | "more"
  | "receipt"
  | "report"
  | "search"
  | "settings"
  | "students"
  | "tenants"
  | "tools"
  | "trend"
  | "userPlus"
  | "wallet"
  | "camera"
  | "check"
  | "copy"
  | "home"
  | "logout"
  | "phone"
  | "qr"
  | "refresh"
  | "user"
  | "clock"
  | "send"
  | "image"
  | "play";

export type SelectOption = {
  label: string;
  value: string;
};

export type ToastState = string;

export type QuickKind = "dispatch" | "receipt" | "report";

export type RequestKind = "transfer" | "renew" | "checkout";
