"use client";

import { useState, type FormEvent, type RefObject } from "react";
import { Icon } from "../../../components/ui/icons";
import type { UploadProgressState } from "../../../lib/upload";
import type { JurusanRow } from "../types";
import { StatusMessage, UploadProgress } from "./AdminSchoolShared";

type AdminSchoolImportSiswaProps = {
  fileRef: RefObject<HTMLInputElement | null>;
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
  onSubmitImport: (event: FormEvent<HTMLFormElement>) => void;
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
    (item) => String(item.id) === String(importJurusanId),
  );

  const canImport = Boolean(selectedFile) && (isSma || Boolean(importJurusanId));

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
          : "Tambahkan jurusan SMK terlebih dahulu, misalnya TKRO, RPL, atau TKJ, sebelum download template.",
      );
      return;
    }

    if (!isSma && !importJurusanId) {
      setImportError(
        "Pilih jurusan SMK terlebih dahulu. Template SMK dibuat per jurusan, misalnya hanya TKRO semester 1 sampai 6.",
      );
      return;
    }

    setDownloadingTemplate(true);

    try {
      const token =
        localStorage.getItem("skilllens_token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
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
            "Gagal mengunduh template. Pastikan jurusan dan mata pelajaran sudah benar.",
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
        err instanceof Error ? err.message : "Gagal mengunduh template nilai.",
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
          (semester) => `SMT ${semester} ${selectedJurusan?.nama || "TKRO"}`,
        )
      : ["Pilih jurusan dulu"];

  return (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
      <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-7 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
              <Icon name="upload" className="h-3.5 w-3.5" />
              Import Nilai Siswa
            </p>

            <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Download dan Upload Template Nilai
            </h3>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              {isSma
                ? "Gunakan satu file Excel berisi sheet semester dan jurusan."
                : "Untuk SMK, template dibuat per jurusan. Pilih jurusan dulu, lalu download template semester 1 sampai 6."}
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-sky-100 bg-gradient-to-r from-white via-cyan-50/80 to-sky-50/80 px-4 py-3 text-sm font-bold text-sky-700 shadow-sm">
            <Icon name="school" className="h-4 w-4" />
            Mode {normalizedJenisSekolah}
          </div>
        </div>
      </div>

      <form onSubmit={onSubmitImport} className="space-y-5 p-5 md:p-6">
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/70 p-5 shadow-sm shadow-sky-100/50">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
                <Icon name="download" className="h-4 w-4" />
                Template Nilai
              </div>

              <h3 className="text-lg font-black tracking-tight text-slate-950">
                {isSma
                  ? "Download Template Nilai Multi-Sheet"
                  : "Download Template Nilai SMK Per Jurusan"}
              </h3>

              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                {isSma
                  ? "Template SMA otomatis mengikuti jurusan yang sudah dibuat. Semester 1–2 dibuat umum, semester 3–6 dibuat per jurusan."
                  : "Template SMK dibuat untuk satu jurusan saja. Contoh TKRO akan menghasilkan sheet SMT 1 TKRO sampai SMT 6 TKRO."}
              </p>

              {!isSma && (
                <div className="mt-4 max-w-md">
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Pilih Jurusan SMK
                  </label>
                  <select
                    value={importJurusanId}
                    onChange={(event) => {
                      setImportJurusanId(event.target.value);
                      setImportError("");
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
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

              <div className="mt-4 rounded-2xl border border-sky-100 bg-white/85 p-4 text-sm leading-6 text-slate-600 shadow-sm">
                <p className="font-black text-sky-700">
                  Struktur sheet template {isSma ? "SMA" : "SMK"}:
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {structureSheets.map((sheet) => (
                    <span
                      key={sheet}
                      className="rounded-xl border border-sky-100 bg-sky-50/80 px-3 py-2 text-center text-xs font-bold text-sky-700"
                    >
                      {sheet}
                    </span>
                  ))}
                </div>

                <p className="mt-3 text-xs font-medium leading-5 text-slate-500">
                  Sheet tetap dibuat walaupun mata pelajaran belum diisi. Kalau belum ada kolom mapel, tambahkan nama mapel mulai dari kolom setelah Jurusan.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={
                downloadingTemplate || (!hasJurusan || (!isSma && !importJurusanId))
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-sky-600 to-cyan-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="download" className="h-4 w-4" />
              {downloadingTemplate
                ? "Mengunduh Template..."
                : "Download Template Nilai"}
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/50">
          <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
              <Icon name="upload" className="h-4 w-4" />
              Upload Excel
            </div>

            <h3 className="mt-3 text-lg font-black tracking-tight text-slate-950">
              Import File Nilai Multi-Sheet
            </h3>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              Upload file Excel hasil template. Sistem akan membaca semua sheet yang tersedia.
            </p>
          </div>

          <div className="p-5">
            <input type="hidden" name="jenis_sekolah" value={normalizedJenisSekolah} />
            <input type="hidden" name="multi_semester" value="true" />
            <input
              type="hidden"
              name="mode"
              value={isSma ? "sma_multi_jurusan" : "smk_per_jurusan"}
            />
            <input type="hidden" name="semester_start" value="1" />
            <input type="hidden" name="semester_end" value="6" />
            {!isSma && (
              <input type="hidden" name="jurusanId" value={importJurusanId} />
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
              className={`cursor-pointer rounded-3xl border-2 border-dashed p-7 text-center transition ${
                dragActive
                  ? "border-sky-500 bg-sky-50 shadow-inner"
                  : "border-sky-100 bg-gradient-to-br from-white via-sky-50/50 to-blue-50/60 hover:border-sky-300 hover:shadow-md"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(event) => pickFile(event.target.files?.[0])}
              />

              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                <Icon name="upload" className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-base font-black tracking-tight text-slate-900">
                Drag & drop file Excel di sini
              </h3>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Upload satu file template nilai multi-sheet. Format file .xlsx atau .xls.
              </p>

              {selectedFile && (
                <div className="mx-auto mt-4 flex max-w-md items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white p-3 text-left shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {selectedFile.name}
                    </p>

                    <p className="text-xs font-medium text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      clearSelectedFile();
                    }}
                    className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
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
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-sky-600 to-cyan-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="upload" className="h-4 w-4" />
                {loadingImport ? "Mengimport..." : "Import Nilai"}
              </button>

              <button
                type="button"
                onClick={onBack}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
