"use client";

import { useState } from "react";
import { Icon } from "../../../components/ui/icons";
import type { UploadProgressState } from "../../../lib/upload";
import type { JurusanRow } from "../types";
import { StatusMessage, UploadProgress } from "./AdminSchoolShared";

type AdminSchoolImportSiswaProps = {
  fileRef: React.RefObject<HTMLInputElement | null>;
  jurusanRows: JurusanRow[];
  selectedFile: File | null;
  dragActive: boolean;
  importJurusanId: string;
  importSemester: string;
  importMessage: string;
  importError: string;
  loadingImport: boolean;
  uploadProgress: UploadProgressState | null;
  jenisSekolah?: string;
  setSelectedFile: (file: File | null) => void;
  setDragActive: (value: boolean) => void;
  setImportJurusanId: (value: string) => void;
  setImportSemester: (value: string) => void;
  setImportError: (value: string) => void;
  onSubmitImport: (event: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
};

const SEMESTER_OPTIONS = ["1", "2", "3", "4", "5", "6"];

function isSemesterUmum(semester: string) {
  return semester === "1" || semester === "2";
}

function isSemesterJurusan(semester: string) {
  return ["3", "4", "5", "6"].includes(semester);
}

export function AdminSchoolImportSiswa({
  fileRef,
  jurusanRows,
  selectedFile,
  dragActive,
  importJurusanId,
  importSemester,
  importMessage,
  importError,
  loadingImport,
  uploadProgress,
  jenisSekolah = "SMA",
  setSelectedFile,
  setDragActive,
  setImportJurusanId,
  setImportSemester,
  setImportError,
  onSubmitImport,
  onBack,
}: AdminSchoolImportSiswaProps) {
  const normalizedJenisSekolah = String(jenisSekolah || "SMA").toUpperCase();
  const isSma = normalizedJenisSekolah === "SMA";

  const [downloadJurusanId, setDownloadJurusanId] = useState("");
  const [downloadSemester, setDownloadSemester] = useState("");
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const downloadNeedsJurusan =
    !isSma || (isSma && isSemesterJurusan(downloadSemester));

  const importNeedsJurusan =
    !isSma || (isSma && isSemesterJurusan(importSemester));

  const canDownloadTemplate = isSma
    ? Boolean(downloadSemester) &&
      (!downloadNeedsJurusan || Boolean(downloadJurusanId))
    : Boolean(downloadJurusanId);

  const canImport =
    Boolean(selectedFile) &&
    (isSma ? Boolean(importSemester) : true) &&
    (!importNeedsJurusan || Boolean(importJurusanId));

  function pickFile(file?: File | null) {
    if (!file) return;

    const fileName = file.name.toLowerCase();

    const isExcel =
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      file.type.includes("spreadsheet") ||
      file.type.includes("excel");

    if (!isExcel) {
      setImportError("File harus berformat .xlsx atau .xls.");
      setSelectedFile(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      return;
    }

    setImportError("");
    setSelectedFile(file);
  }

  function clearSelectedFile() {
    setSelectedFile(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  async function handleDownloadTemplate() {
    if (isSma && !downloadSemester) {
      setImportError("Pilih semester terlebih dahulu untuk download template SMA.");
      return;
    }

    if (downloadNeedsJurusan && !downloadJurusanId) {
      setImportError("Pilih jurusan terlebih dahulu untuk download template.");
      return;
    }

    setDownloadingTemplate(true);
    setImportError("");

    try {
      const token =
        localStorage.getItem("skilllens_token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const url = new URL(`${baseUrl}/admin-sekolah/nilai/template`);

      if (isSma) {
        url.searchParams.set("semester", downloadSemester);
      }

      if (downloadNeedsJurusan) {
        url.searchParams.set("jurusanId", downloadJurusanId);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || "Gagal mengunduh template. Periksa semester dan jurusan."
        );
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;

      link.download = isSma
        ? isSemesterUmum(downloadSemester)
          ? `template_nilai_sma_semester_${downloadSemester}_umum.xlsx`
          : `template_nilai_sma_semester_${downloadSemester}_jurusan_${downloadJurusanId}.xlsx`
        : `template_nilai_smk_jurusan_${downloadJurusanId}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);

      setImportError(
        err instanceof Error ? err.message : "Gagal mengunduh template."
      );
    } finally {
      setDownloadingTemplate(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-2xl bg-white p-6">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
            <Icon name="upload" className="h-4 w-4" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Import Siswa
          </p>
        </div>

        <h2 className="text-xl font-bold text-slate-800">
          Upload file Excel siswa
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {isSma
            ? "Semester 1 dan 2 menggunakan mapel umum tanpa jurusan. Semester 3 sampai 6 wajib memilih jurusan."
            : "Untuk SMK, template dan import nilai mengikuti jurusan tanpa semester."}
        </p>

        <form onSubmit={onSubmitImport}>
          <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  Download Template Excel
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {isSma
                    ? "Pilih semester dulu. Jurusan hanya muncul untuk semester 3 sampai 6."
                    : "Template SMK dibuat berdasarkan jurusan yang dipilih."}
                </p>
              </div>

              <div
                className={`grid gap-3 ${
                  isSma
                    ? downloadNeedsJurusan
                      ? "md:grid-cols-[1fr_1fr_auto]"
                      : "md:grid-cols-[1fr_auto]"
                    : "md:grid-cols-[1fr_auto]"
                }`}
              >
                {isSma && (
                  <select
                    value={downloadSemester}
                    onChange={(event) => {
                      const value = event.target.value;
                      setDownloadSemester(value);
                      setImportError("");

                      if (isSemesterUmum(value)) {
                        setDownloadJurusanId("");
                      }
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="">Pilih semester template</option>
                    {SEMESTER_OPTIONS.map((semester) => (
                      <option key={semester} value={semester}>
                        Semester {semester}
                      </option>
                    ))}
                  </select>
                )}

                {downloadNeedsJurusan && (
                  <select
                    value={downloadJurusanId}
                    onChange={(event) => {
                      setDownloadJurusanId(event.target.value);
                      setImportError("");
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="">Pilih jurusan template</option>
                    {jurusanRows.map((jurusan) => (
                      <option key={jurusan.id} value={jurusan.id}>
                        {jurusan.nama}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={!canDownloadTemplate || downloadingTemplate}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon name="download" className="h-4 w-4" />
                  {downloadingTemplate ? "Mengunduh..." : "Download Template"}
                </button>
              </div>

              {isSma && downloadSemester && (
                <div
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    isSemesterUmum(downloadSemester)
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  {isSemesterUmum(downloadSemester)
                    ? "Semester 1 dan 2 memakai mapel umum, jadi jurusan tidak diperlukan."
                    : "Semester 3 sampai 6 memakai mapel jurusan, jadi jurusan wajib dipilih."}
                </div>
              )}

              {!isSma && (
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                  SMK tidak menggunakan pilihan semester pada template maupun import.
                </div>
              )}
            </div>
          </div>

          <div
            className={`mt-5 grid gap-4 ${
              isSma && importNeedsJurusan ? "md:grid-cols-2" : "md:grid-cols-1"
            }`}
          >
            {isSma && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Semester untuk import
                </span>

                <select
                  value={importSemester}
                  onChange={(event) => {
                    const value = event.target.value;
                    setImportSemester(value);
                    setImportError("");

                    if (isSemesterUmum(value)) {
                      setImportJurusanId("");
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">Pilih semester</option>
                  {SEMESTER_OPTIONS.map((semester) => (
                    <option key={semester} value={semester}>
                      Semester {semester}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {importNeedsJurusan && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Jurusan untuk import
                </span>

                <select
                  value={importJurusanId}
                  onChange={(event) => {
                    setImportJurusanId(event.target.value);
                    setImportError("");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">Pilih jurusan</option>
                  {jurusanRows.map((jurusan) => (
                    <option key={jurusan.id} value={jurusan.id}>
                      {jurusan.nama}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {isSma && importSemester && (
            <div
              className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
                isSemesterUmum(importSemester)
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
              }`}
            >
              {isSemesterUmum(importSemester)
                ? "Import semester 1 dan 2 tidak membutuhkan jurusan karena mapelnya umum."
                : "Import semester 3 sampai 6 membutuhkan jurusan karena mapelnya menjuru."}
            </div>
          )}

          {importNeedsJurusan && (
            <input type="hidden" name="id_jurusan" value={importJurusanId} />
          )}

          <input
            type="hidden"
            name="jenis_sekolah"
            value={normalizedJenisSekolah}
          />

          {isSma && (
            <input type="hidden" name="semester" value={importSemester} />
          )}

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              pickFile(event.dataTransfer.files?.[0]);
            }}
            onClick={() => fileRef.current?.click()}
            className={`mt-5 cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(event) => pickFile(event.target.files?.[0])}
            />

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Icon name="upload" className="h-5 w-5" />
            </div>

            <h3 className="mt-3 text-base font-bold text-slate-800">
              Drag & drop file Excel di sini
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Atau klik kotak ini untuk memilih file. Maksimal satu file.
            </p>

            {selectedFile && (
              <div className="mx-auto mt-4 flex max-w-md items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {selectedFile.name}
                  </p>

                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    clearSelectedFile();
                  }}
                  className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

          <UploadProgress progress={uploadProgress} />

          <div className="mt-5">
            <StatusMessage message={importMessage} error={importError} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loadingImport || !canImport}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="upload" className="h-4 w-4" />
              {loadingImport ? "Mengimport..." : "Import Siswa"}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Kembali
            </button>
          </div>
        </form>
      </div>

      <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-b-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70" />
    </div>
  );
}