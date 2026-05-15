import { getStoredToken } from "./auth";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const isApiConfigured = Boolean(API_BASE_URL);

function buildHeaders(options?: RequestInit): HeadersInit {
  const headers = new Headers(options?.headers);
  const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getStoredToken();
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

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
