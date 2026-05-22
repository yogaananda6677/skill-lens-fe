import { clearAuth, getStoredToken } from "./auth";
import { notifyAppAlert } from "./app-alert-events";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

type ApiFetchOptions = RequestInit & {
  timeoutMs?: number;
  skipAuth?: boolean;
  alert?: boolean;
  loadingMessage?: string;
  successMessage?: string | false;
  errorMessage?: string | false;
};

function buildHeaders(options?: ApiFetchOptions): HeadersInit {
  const headers = new Headers(options?.headers);
  const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = options?.skipAuth ? null : getStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) return `API error ${response.status}`;

  try {
    const data = JSON.parse(text) as { message?: string | string[]; error?: string };
    if (Array.isArray(data.message)) return data.message.join(", ");
    return data.message || data.error || text;
  } catch {
    return text;
  }
}

function parseJsonSafely(text: string) {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function shouldAutoNotify(method: string, options: ApiFetchOptions) {
  if (options.alert === false) return false;
  return method !== "GET" && method !== "HEAD";
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const {
    timeoutMs = 20000,
    skipAuth: _skipAuth,
    alert: _alert,
    loadingMessage,
    successMessage,
    errorMessage,
    ...fetchOptions
  } = options;

  const method = String(fetchOptions.method ?? "GET").toUpperCase();
  const autoNotify = shouldAutoNotify(method, options);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  if (loadingMessage && options.alert !== false) {
    notifyAppAlert({ type: "processing", title: loadingMessage, autoCloseMs: false });
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      signal: fetchOptions.signal ?? controller.signal,
      headers: buildHeaders(options),
    });

    if (response.status === 401 || response.status === 403) {
      if (typeof window !== "undefined") clearAuth();
    }

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    if (response.status === 204) {
      if (successMessage && options.alert !== false) {
        notifyAppAlert({ type: "success", title: successMessage, autoCloseMs: 2200 });
      }
      return undefined as T;
    }

    const text = await response.text();
    const data = parseJsonSafely(text) as T & { message?: string };

    const resolvedSuccessMessage =
      successMessage === false
        ? ""
        : successMessage || (autoNotify && typeof (data as any)?.message === "string" ? (data as any).message : "");

    if (resolvedSuccessMessage && options.alert !== false) {
      notifyAppAlert({ type: "success", title: resolvedSuccessMessage, autoCloseMs: 2200 });
    }

    return data as T;
  } catch (error) {
    const message = error instanceof DOMException && error.name === "AbortError"
      ? "Request terlalu lama. Periksa koneksi atau status backend."
      : error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menghubungi server.";

    if (errorMessage !== false && (autoNotify || loadingMessage) && options.alert !== false) {
      notifyAppAlert({
        type: "error",
        title: typeof errorMessage === "string" ? errorMessage : "Proses gagal",
        description: message,
        autoCloseMs: false,
      });
    }

    throw new Error(message);
  } finally {
    window.clearTimeout(timeout);
  }
}
