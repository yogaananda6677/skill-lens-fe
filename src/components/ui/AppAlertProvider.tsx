"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "./icons";

import { APP_ALERT_EVENT, type AppAlertPayload, type AppAlertType } from "../../lib/app-alert-events";

type AppAlertState = Required<Pick<AppAlertPayload, "type" | "title">> & {
  id: number;
  description?: string;
  autoCloseMs?: number | false;
};

type AppAlertContextValue = {
  showAlert: (payload: AppAlertPayload) => void;
  showSuccess: (title: string, description?: string, autoCloseMs?: number | false) => void;
  showError: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
  showProcessing: (title: string, description?: string) => void;
  dismissAlert: () => void;
};

const AppAlertContext = createContext<AppAlertContextValue | null>(null);

function defaultAutoClose(type: AppAlertType): number | false {
  if (type === "success") return 2200;
  if (type === "info") return 2600;
  return false;
}

function alertTone(type: AppAlertType) {
  if (type === "success") {
    return {
      box: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      icon: "check",
      title: "text-slate-950",
      progress: "bg-emerald-500",
      button: "bg-emerald-600 hover:bg-emerald-700",
    };
  }

  if (type === "error") {
    return {
      box: "bg-rose-50 text-rose-700 ring-rose-100",
      icon: "alert",
      title: "text-slate-950",
      progress: "bg-rose-500",
      button: "bg-rose-600 hover:bg-rose-700",
    };
  }

  if (type === "processing") {
    return {
      box: "bg-sky-50 text-sky-700 ring-sky-100",
      icon: "progress",
      title: "text-slate-950",
      progress: "bg-sky-500",
      button: "bg-sky-700 hover:bg-sky-800",
    };
  }

  return {
    box: "bg-sky-50 text-sky-700 ring-sky-100",
    icon: "sparkles",
    title: "text-slate-950",
    progress: "bg-sky-500",
    button: "bg-sky-700 hover:bg-sky-800",
  };
}

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AppAlertState | null>(null);

  const showAlert = useCallback((payload: AppAlertPayload) => {
    const type = payload.type ?? "info";
    setAlert({
      id: Date.now(),
      type,
      title: payload.title,
      description: payload.description,
      autoCloseMs: payload.autoCloseMs ?? defaultAutoClose(type),
    });
  }, []);

  const dismissAlert = useCallback(() => setAlert(null), []);

  useEffect(() => {
    function handleAlert(event: Event) {
      const customEvent = event as CustomEvent<AppAlertPayload>;
      if (!customEvent.detail?.title) return;
      showAlert(customEvent.detail);
    }

    window.addEventListener(APP_ALERT_EVENT, handleAlert);
    return () => window.removeEventListener(APP_ALERT_EVENT, handleAlert);
  }, [showAlert]);

  useEffect(() => {
    if (!alert || alert.autoCloseMs === false) return;
    const timer = window.setTimeout(() => setAlert(null), alert.autoCloseMs);
    return () => window.clearTimeout(timer);
  }, [alert]);

  const value = useMemo<AppAlertContextValue>(
    () => ({
      showAlert,
      showSuccess: (title, description, autoCloseMs = 2200) => showAlert({ type: "success", title, description, autoCloseMs }),
      showError: (title, description) => showAlert({ type: "error", title, description, autoCloseMs: false }),
      showInfo: (title, description) => showAlert({ type: "info", title, description, autoCloseMs: 2600 }),
      showProcessing: (title, description) => showAlert({ type: "processing", title, description, autoCloseMs: false }),
      dismissAlert,
    }),
    [dismissAlert, showAlert],
  );

  const tone = alert ? alertTone(alert.type) : null;
  const showBackdrop = alert?.type === "error" || alert?.type === "processing";

  return (
    <AppAlertContext.Provider value={value}>
      {children}

      {alert && tone && (
        <div className="fixed inset-0 z-[140] grid place-items-center px-4 py-6 pointer-events-none">
          {showBackdrop && <div className="absolute inset-0 bg-slate-950/[0.18] backdrop-blur-[2px]" />}

          <section
            role={alert.type === "error" ? "alert" : "status"}
            aria-live={alert.type === "error" ? "assertive" : "polite"}
            className="relative w-full max-w-md overflow-hidden rounded-[1.7rem] border border-white/70 bg-white p-5 shadow-2xl shadow-slate-950/18 pointer-events-auto skilllens-alert-pop"
          >
            <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-sky-100 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-cyan-100/70 blur-3xl" />

            <div className="relative flex items-start gap-4">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ring-1 ${tone.box}`}>
                {alert.type === "processing" ? (
                  <span className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : (
                  <Icon name={tone.icon} className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <h2 className={`text-base font-extrabold leading-6 ${tone.title}`}>{alert.title}</h2>
                {alert.description && <p className="mt-1.5 text-sm font-medium leading-6 text-slate-500">{alert.description}</p>}
              </div>

              {alert.type !== "processing" && (
                <button
                  type="button"
                  onClick={dismissAlert}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-950"
                  aria-label="Tutup notifikasi"
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              )}
            </div>

            {alert.autoCloseMs !== false && (
              <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${tone.progress} skilllens-alert-progress`} />
              </div>
            )}

            {alert.type === "error" && (
              <button
                type="button"
                onClick={dismissAlert}
                className={`relative mt-5 w-full rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition ${tone.button}`}
              >
                Tutup
              </button>
            )}
          </section>
        </div>
      )}
    </AppAlertContext.Provider>
  );
}

export function useAppAlert() {
  const context = useContext(AppAlertContext);
  if (!context) {
    throw new Error("useAppAlert must be used inside AppAlertProvider");
  }
  return context;
}
