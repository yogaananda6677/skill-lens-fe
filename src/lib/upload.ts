import { API_BASE_URL } from "./axios";
import { getStoredToken, clearAuth } from "./auth";

export type UploadProgressState = {
  percent: number;
  uploadedBytes: number;
  totalBytes: number;
  elapsedSeconds: number;
  estimatedSecondsLeft: number | null;
  phase: "uploading" | "processing" | "done";
};

export function uploadWithProgress<T>({
  path,
  formData,
  onProgress,
  timeoutMs = 120000,
}: {
  path: string;
  formData: FormData;
  onProgress?: (state: UploadProgressState) => void;
  timeoutMs?: number;
}) {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startedAt = Date.now();
    let processingTimer: ReturnType<typeof window.setInterval> | null = null;
    let currentPercent = 1;

    function emit(partial: Partial<UploadProgressState>) {
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      onProgress?.({
        percent: currentPercent,
        uploadedBytes: 0,
        totalBytes: 0,
        elapsedSeconds,
        estimatedSecondsLeft: null,
        phase: "uploading",
        ...partial,
      });
    }

    xhr.open("POST", `${API_BASE_URL}${path}`);
    xhr.timeout = timeoutMs;

    const token = getStoredToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const elapsedSeconds = Math.max(1, (Date.now() - startedAt) / 1000);
      const speed = event.loaded / elapsedSeconds;
      const remaining = speed > 0 ? Math.ceil((event.total - event.loaded) / speed) : null;
      currentPercent = Math.min(90, Math.round((event.loaded / event.total) * 90));
      emit({
        percent: currentPercent,
        uploadedBytes: event.loaded,
        totalBytes: event.total,
        estimatedSecondsLeft: remaining,
        phase: "uploading",
      });
    };

    xhr.onloadstart = () => emit({ percent: 1, phase: "uploading" });

    xhr.upload.onload = () => {
      currentPercent = Math.max(currentPercent, 92);
      emit({ percent: currentPercent, phase: "processing", estimatedSecondsLeft: null });
      processingTimer = window.setInterval(() => {
        currentPercent = Math.min(98, currentPercent + 1);
        emit({ percent: currentPercent, phase: "processing" });
      }, 700);
    };

    xhr.onload = () => {
      if (processingTimer) window.clearInterval(processingTimer);
      currentPercent = 100;
      emit({ percent: 100, phase: "done", estimatedSecondsLeft: 0 });

      if (xhr.status === 401 || xhr.status === 403) clearAuth();

      if (xhr.status < 200 || xhr.status >= 300) {
        try {
          const data = JSON.parse(xhr.responseText || "{}");
          const message = Array.isArray(data.message) ? data.message.join(", ") : data.message || data.error || `Upload gagal (${xhr.status})`;
          reject(new Error(message));
        } catch {
          reject(new Error(xhr.responseText || `Upload gagal (${xhr.status})`));
        }
        return;
      }

      try {
        resolve((xhr.responseText ? JSON.parse(xhr.responseText) : undefined) as T);
      } catch {
        resolve(xhr.responseText as T);
      }
    };

    xhr.onerror = () => {
      if (processingTimer) window.clearInterval(processingTimer);
      reject(new Error("Upload gagal. Periksa koneksi dan pastikan backend aktif."));
    };
    xhr.ontimeout = () => {
      if (processingTimer) window.clearInterval(processingTimer);
      reject(new Error("Upload terlalu lama. Coba file lebih kecil atau cek koneksi."));
    };

    xhr.send(formData);
  });
}
