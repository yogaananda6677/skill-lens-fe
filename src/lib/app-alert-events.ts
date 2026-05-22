export type AppAlertType = "success" | "error" | "info" | "processing";

export type AppAlertPayload = {
  type?: AppAlertType;
  title: string;
  description?: string;
  autoCloseMs?: number | false;
};

export const APP_ALERT_EVENT = "skilllens:app-alert";

export function notifyAppAlert(payload: AppAlertPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AppAlertPayload>(APP_ALERT_EVENT, { detail: payload }));
}
