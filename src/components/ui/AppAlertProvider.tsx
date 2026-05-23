"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
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
  if (type === "success") return 1800;
  if (type === "info") return 2400;
  return false;
}

function alertTone(type: AppAlertType) {
  if (type === "success") {
    return {
      shell: "border-emerald-100",
      accent: "bg-emerald-500",
      iconBox: "bg-emerald-50 text-emerald-600 ring-emerald-100",
      icon: "check",
      title: "text-slate-950",
      progress: "bg-emerald-500",
      action: "text-emerald-700 hover:bg-emerald-50",
    };
  }

  if (type === "error") {
    return {
      shell: "border-rose-100",
      accent: "bg-rose-500",
      iconBox: "bg-rose-50 text-rose-600 ring-rose-100",
      icon: "alert",
      title: "text-slate-950",
      progress: "bg-rose-500",
      action: "text-rose-700 hover:bg-rose-50",
    };
  }

  if (type === "processing") {
    return {
      shell: "border-sky-100",
      accent: "bg-sky-500",
      iconBox: "bg-sky-50 text-sky-600 ring-sky-100",
      icon: "progress",
      title: "text-slate-950",
      progress: "bg-sky-500",
      action: "text-sky-700 hover:bg-sky-50",
    };
  }

  return {
    shell: "border-sky-100",
    accent: "bg-sky-500",
    iconBox: "bg-sky-50 text-sky-600 ring-sky-100",
    icon: "sparkles",
    title: "text-slate-950",
    progress: "bg-sky-500",
    action: "text-sky-700 hover:bg-sky-50",
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
      showSuccess: (title, description, autoCloseMs = 1800) => showAlert({ type: "success", title, description, autoCloseMs }),
      showError: (title, description) => showAlert({ type: "error", title, description, autoCloseMs: false }),
      showInfo: (title, description) => showAlert({ type: "info", title, description, autoCloseMs: 2400 }),
      showProcessing: (title, description) => showAlert({ type: "processing", title, description, autoCloseMs: false }),
      dismissAlert,
    }),
    [dismissAlert, showAlert],
  );

  const tone = alert ? alertTone(alert.type) : null;
  const progressStyle =
    alert?.autoCloseMs !== false && alert?.autoCloseMs
      ? ({ "--skilllens-alert-duration": `${alert.autoCloseMs}ms` } as CSSProperties)
      : undefined;

  return (
    <AppAlertContext.Provider value={value}>
      {children}

      {alert && tone && (
        <div className="fixed left-1/2 top-4 z-[160] w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 pointer-events-none sm:top-5">
          <section
            role={alert.type === "error" ? "alert" : "status"}
            aria-live={alert.type === "error" ? "assertive" : "polite"}
            className={`skilllens-alert-toast pointer-events-auto relative overflow-hidden rounded-2xl border bg-white/95 p-4 shadow-xl shadow-slate-950/10 backdrop-blur-md ${tone.shell}`}
            style={progressStyle}
          >
            <div className={`absolute left-0 top-0 h-full w-1 ${tone.accent}`} />

            <div className="flex items-start gap-3 pl-1">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${tone.iconBox}`}>
                {alert.type === "processing" ? (
                  <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : (
                  <Icon name={tone.icon} className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <h2 className={`text-sm font-extrabold leading-5 ${tone.title}`}>{alert.title}</h2>
                {alert.description && <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{alert.description}</p>}
              </div>

              {alert.type !== "processing" && (
                <button
                  type="button"
                  onClick={dismissAlert}
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 transition hover:text-slate-950 ${tone.action}`}
                  aria-label="Tutup notifikasi"
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              )}
            </div>

            {alert.autoCloseMs !== false && (
              <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${tone.progress} skilllens-alert-progress`} />
              </div>
            )}
          </section>
        </div>
      )}

      <style jsx global>{`
        @keyframes skilllensAlertToastIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes skilllensAlertProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .skilllens-alert-toast {
          animation: skilllensAlertToastIn 180ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .skilllens-alert-progress {
          width: 100%;
          animation: skilllensAlertProgress var(--skilllens-alert-duration, 1800ms) linear forwards;
        }
      `}</style>
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
