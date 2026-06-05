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

import {
  APP_ALERT_EVENT,
  type AppAlertPayload,
  type AppAlertType,
} from "../../lib/app-alert-events";

type AppAlertState = Required<Pick<AppAlertPayload, "type" | "title">> & {
  id: number;
  description?: string;
  autoCloseMs?: number | false;
};

type AppAlertContextValue = {
  showAlert: (payload: AppAlertPayload) => void;
  showSuccess: (
    title: string,
    description?: string,
    autoCloseMs?: number | false
  ) => void;
  showError: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
  showProcessing: (title: string, description?: string) => void;
  dismissAlert: () => void;
};

const AppAlertContext = createContext<AppAlertContextValue | null>(null);

function defaultAutoClose(type: AppAlertType): number | false {
  if (type === "success") return 1800;
  if (type === "info") return 2400;
  if (type === "processing") return false;
  return false;
}

function normalizeText(value?: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function shouldHideAlert(type: AppAlertType, title?: string, description?: string) {
  const normalizedTitle = normalizeText(title);
  const fullText = normalizeText(`${title || ""} ${description || ""}`);

  const hiddenSuccessTitles = [
    "profil siswa berhasil disimpan.",
    "profil berhasil disimpan.",
    "profil berhasil disimpan",
  ];

  if (type === "success" && hiddenSuccessTitles.includes(normalizedTitle)) {
    return true;
  }

  // Khusus pengajuan sekolah:
  // Alert global disembunyikan karena halaman pengajuan sekolah sudah punya
  // modal proses dan sukses sendiri di tengah layar.
  if (type !== "error") {
    const schoolSubmitKeywords = [
      "pengajuan sekolah berhasil dikirim",
      "pengajuan berhasil dikirim",
      "pengajuan terkirim",
      "menyimpan data sekolah",
      "sedang mengirim data pengajuan",
      "harap tunggu sedang mengirim data",
      "fitur guru dan import siswa",
      "akan aktif setelah sekolah disetujui",
      "data sekolah akan diverifikasi",
      "sedang mengirim data",
    ];

    if (schoolSubmitKeywords.some((keyword) => fullText.includes(keyword))) {
      return true;
    }
  }

  return false;
}

function alertTone(type: AppAlertType) {
  if (type === "success") {
    return {
      shell: "border-sky-100",
      accent: "bg-sky-600",
      iconBox: "bg-sky-50 text-sky-700 ring-sky-100",
      icon: "check",
      title: "text-slate-950",
      progress: "bg-sky-600",
      action: "text-sky-700 hover:bg-sky-50",
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

  const dismissAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const showAlert = useCallback((payload: AppAlertPayload) => {
    const type = payload.type ?? "info";
    const title = payload.title ?? "";

    if (!title) return;

    if (shouldHideAlert(type, title, payload.description)) {
      return;
    }

    setAlert({
      id: Date.now(),
      type,
      title,
      description: payload.description,
      autoCloseMs: payload.autoCloseMs ?? defaultAutoClose(type),
    });
  }, []);

  useEffect(() => {
    function handleAlert(event: Event) {
      const customEvent = event as CustomEvent<AppAlertPayload>;
      showAlert(customEvent.detail);
    }

    window.addEventListener(APP_ALERT_EVENT, handleAlert);

    return () => {
      window.removeEventListener(APP_ALERT_EVENT, handleAlert);
    };
  }, [showAlert]);

  useEffect(() => {
    if (!alert || alert.autoCloseMs === false) return;

    const timer = window.setTimeout(() => {
      setAlert(null);
    }, alert.autoCloseMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [alert]);

  const value = useMemo<AppAlertContextValue>(
    () => ({
      showAlert,
      showSuccess: (title, description, autoCloseMs = 1800) =>
        showAlert({
          type: "success",
          title,
          description,
          autoCloseMs,
        }),
      showError: (title, description) =>
        showAlert({
          type: "error",
          title,
          description,
          autoCloseMs: false,
        }),
      showInfo: (title, description) =>
        showAlert({
          type: "info",
          title,
          description,
          autoCloseMs: 2400,
        }),
      showProcessing: (title, description) =>
        showAlert({
          type: "processing",
          title,
          description,
          autoCloseMs: false,
        }),
      dismissAlert,
    }),
    [dismissAlert, showAlert]
  );

  const isProcessing = alert?.type === "processing";
  const tone = alert && !isProcessing ? alertTone(alert.type) : null;

  const progressStyle =
    alert?.autoCloseMs !== false && alert?.autoCloseMs
      ? ({
          "--skilllens-alert-duration": `${alert.autoCloseMs}ms`,
        } as CSSProperties)
      : undefined;

  return (
    <AppAlertContext.Provider value={value}>
      {children}

      {isProcessing && alert && (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-slate-900/35 px-4">
          <section
            role="status"
            aria-live="polite"
            className="w-full max-w-sm rounded-[2rem] border border-sky-100 bg-white p-7 text-center shadow-2xl shadow-slate-950/20"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-sky-200 border-t-sky-700" />
            </div>

            <h2 className="mt-5 text-lg font-extrabold text-slate-950">
              {alert.title}
            </h2>

            {alert.description && (
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                {alert.description}
              </p>
            )}

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-sky-100">
              <div className="h-full w-2/3 animate-[skilllensProcessingProgress_1.35s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />
            </div>
          </section>
        </div>
      )}

      {alert && tone && !isProcessing && (
        <div className="pointer-events-none fixed left-1/2 top-4 z-[160] w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 sm:top-5">
          <section
            role={alert.type === "error" ? "alert" : "status"}
            aria-live={alert.type === "error" ? "assertive" : "polite"}
            className={`skilllens-alert-toast pointer-events-auto relative overflow-hidden rounded-2xl border bg-white p-4 shadow-xl shadow-slate-950/10 ${tone.shell}`}
            style={progressStyle}
          >
            <div className={`absolute left-0 top-0 h-full w-1 ${tone.accent}`} />

            <div className="flex items-start gap-3 pl-1">
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${tone.iconBox}`}
              >
                <Icon name={tone.icon as any} className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <h2 className={`text-sm font-extrabold leading-5 ${tone.title}`}>
                  {alert.title}
                </h2>

                {alert.description && (
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    {alert.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={dismissAlert}
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 transition hover:text-slate-950 ${tone.action}`}
                aria-label="Tutup notifikasi"
              >
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>

            {alert.autoCloseMs !== false && (
              <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${tone.progress} skilllens-alert-progress`}
                />
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

        @keyframes skilllensProcessingProgress {
          0% {
            transform: translateX(-110%);
          }
          50% {
            transform: translateX(25%);
          }
          100% {
            transform: translateX(135%);
          }
        }

        .skilllens-alert-toast {
          animation: skilllensAlertToastIn 180ms cubic-bezier(0.2, 0.8, 0.2, 1)
            both;
        }

        .skilllens-alert-progress {
          width: 100%;
          animation: skilllensAlertProgress
            var(--skilllens-alert-duration, 1800ms) linear forwards;
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
