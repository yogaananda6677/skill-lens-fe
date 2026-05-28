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

export function AdminSchoolImportSiswa({
  fileRef,
  jurusanRows,
  selectedFile,
  dragActive,
  importJurusanId,
  importMessage,
  importError,
  loadingImport,
  uploadProgress,
  jenisSekolah = "SMA",
  setSelectedFile,
  setDragActive,
  setImportJurusanId,
  setImportError,
  onSubmitImport,
  onBack,
}: AdminSchoolImportSiswaProps) {
  const normalizedJenisSekolah = String(jenisSekolah || "SMA").toUpperCase();
  const isSma = normalizedJenisSekolah === "SMA";

  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const hasJurusan = jurusanRows.length > 0;
  const selectedJurusan = jurusanRows.find(
    (item) => String(item.id) === String(importJurusanId)
  );

  const canImport = Boolean(selectedFile);

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
    setImportError("");

    if (!hasJurusan) {
      setImportError(
        isSma
          ? "Tambahkan jurusan/peminatan terlebih dahulu, misalnya IPA dan IPS, sebelum download template."
          : "Tambahkan jurusan SMK terlebih dahulu, misalnya TKRO, RPL, atau TKJ, sebelum download template."
      );
      return;
    }

    if (!isSma && !importJurusanId) {
      setImportError(
        "Pilih jurusan SMK terlebih dahulu. Template SMK dibuat per jurusan, misalnya hanya TKRO semester 1 sampai 6."
      );
      return;
    }

    setDownloadingTemplate(true);

    try {
      const token =
        localStorage.getItem("skilllens_token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const url = new URL(`${baseUrl}/admin-sekolah/nilai/template`);

      url.searchParams.set("multiSemester", "true");
      url.searchParams.set("jenisSekolah", normalizedJenisSekolah);
      url.searchParams.set("semesterStart", "1");
      url.searchParams.set("semesterEnd", "6");

      if (isSma) {
        url.searchParams.set("mode", "sma_multi_jurusan");
      } else {
        url.searchParams.set("mode", "smk_per_jurusan");
        url.searchParams.set("jurusanId", importJurusanId);
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
          errorText ||
            "Gagal mengunduh template. Pastikan jurusan dan mata pelajaran sudah benar."
        );
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = isSma
        ? "template_nilai_sma_multi_semester.xlsx"
        : `template_nilai_smk_${selectedJurusan?.nama || "jurusan"}_semester_1_6.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);

      setImportError(
        err instanceof Error ? err.message : "Gagal mengunduh template nilai."
      );
    } finally {
      setDownloadingTemplate(false);
    }
  }

  const structureSheets = isSma
    ? [
        "SMT 1",
        "SMT 2",
        "SMT 3 IPA",
        "SMT 3 IPS",
        "SMT 4 IPA",
        "SMT 4 IPS",
        "SMT 5 IPA",
        "SMT 5 IPS",
        "SMT 6 IPA",
        "SMT 6 IPS",
      ]
    : importJurusanId
      ? [1, 2, 3, 4, 5, 6].map(
          (semester) => `SMT ${semester} ${selectedJurusan?.nama || "TKRO"}`
        )
      : ["Pilih jurusan dulu"];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-2xl bg-gradient-to-b from-blue-50/90 to-white p-6">
        <div className="-mx-6 -mt-6 mb-6 rounded-t-2xl bg-gradient-to-r from-[#0a1a3a] to-[#0f2a5f] px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/20 p-1.5 text-white">
              <Icon name="upload" className="h-4 w-4" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
              Import Nilai Siswa
            </p>
          </div>

          <h2 className="mt-2 text-xl font-bold text-white">
            Download dan Upload Template Nilai
          </h2>

          <p className="mt-1 text-sm leading-6 text-blue-100">
            {isSma
              ? "Gunakan satu file Excel berisi sheet semester dan jurusan."
              : "Untuk SMK, template dibuat per jurusan. Pilih jurusan dulu, lalu download template semester 1 sampai 6."}
          </p>
        </div>

        <form onSubmit={onSubmitImport}>
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                  <Icon name="download" className="h-4 w-4" />
                  Template Nilai
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {isSma
                    ? "Download Template Nilai Multi-Sheet"
                    : "Download Template Nilai SMK Per Jurusan"}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {isSma
                    ? "Template SMA otomatis mengikuti jurusan yang sudah dibuat. Semester 1-2 dibuat umum, semester 3-6 dibuat per jurusan."
                    : "Template SMK dibuat untuk satu jurusan saja. Contoh TKRO akan menghasilkan sheet SMT 1 TKRO sampai SMT 6 TKRO."}
                </p>

                {!isSma && (
                  <div className="mt-4 max-w-md">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Pilih Jurusan SMK
                    </label>
                    <select
                      value={importJurusanId}
                      onChange={(event) => {
                        setImportJurusanId(event.target.value);
                        setImportError("");
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="">Pilih jurusan</option>
                      {jurusanRows.map((jurusan) => (
                        <option key={jurusan.id} value={String(jurusan.id)}>
                          {jurusan.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-white bg-white/80 p-4 text-sm leading-6 text-slate-600 shadow-sm">
                  <p className="font-semibold text-blue-800">
                    Struktur sheet template {isSma ? "SMA" : "SMK"}:
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {structureSheets.map((sheet) => (
                      <span
                        key={sheet}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-center text-xs font-semibold text-blue-700 ring-1 ring-blue-100"
                      >
                        {sheet}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Sheet tetap dibuat walaupun mata pelajaran belum diisi. Kalau belum ada kolom mapel, tambahkan nama mapel mulai dari kolom setelah Jurusan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={downloadingTemplate || (!hasJurusan || (!isSma && !importJurusanId))}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="download" className="h-4 w-4" />
                {downloadingTemplate
                  ? "Mengunduh Template..."
                  : "Download Template Nilai"}
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                <Icon name="upload" className="h-4 w-4" />
                Upload Excel
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Import File Nilai Multi-Sheet
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Upload file Excel hasil template. Sistem akan membaca semua sheet yang tersedia.
              </p>
            </div>
          </div>

          <input type="hidden" name="jenis_sekolah" value={normalizedJenisSekolah} />
          <input type="hidden" name="multi_semester" value="true" />
          <input type="hidden" name="mode" value={isSma ? "sma_multi_jurusan" : "smk_per_jurusan"} />
          <input type="hidden" name="semester_start" value="1" />
          <input type="hidden" name="semester_end" value="6" />
          {!isSma && <input type="hidden" name="jurusanId" value={importJurusanId} />}

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
              Upload satu file template nilai multi-sheet. Format file .xlsx atau .xls.
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
              {loadingImport ? "Mengimport..." : "Import Nilai"}
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
