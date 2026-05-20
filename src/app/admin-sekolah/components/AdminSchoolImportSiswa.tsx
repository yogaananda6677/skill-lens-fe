import type { RefObject } from "react";
import { Icon } from "../../../components/ui/icons";
import type { UploadProgressState } from "../../../lib/upload";
import { templateExcelUrl } from "../constants";
import type { JurusanRow } from "../types";
import {
  Field,
  PageCard,
  StatusMessage,
  UploadProgress,
} from "./AdminSchoolShared";

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
  setSelectedFile,
  setDragActive,
  setImportJurusanId,
  setImportError,
  onSubmitImport,
  onBack,
}: {
  fileRef: RefObject<HTMLInputElement | null>;
  jurusanRows: JurusanRow[];
  selectedFile: File | null;
  dragActive: boolean;
  importJurusanId: string;
  importMessage: string;
  importError: string;
  loadingImport: boolean;
  uploadProgress: UploadProgressState | null;
  setSelectedFile: (file: File | null) => void;
  setDragActive: (value: boolean) => void;
  setImportJurusanId: (value: string) => void;
  setImportError: (value: string) => void;
  onSubmitImport: (event: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}) {
  const canImport = Boolean(selectedFile) && Boolean(importJurusanId);

  function pickFile(file?: File | null) {
    if (!file) return;

    const isExcel =
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.type.includes("spreadsheet");

    if (!isExcel) {
      setImportError("File harus berformat .xlsx atau .xls.");
      setSelectedFile(null);
      return;
    }

    setImportError("");
    setSelectedFile(file);
  }

  return (
    <PageCard
      eyebrow="Import Siswa"
      title="Upload file Excel siswa"
      description="Pilih jurusan terlebih dahulu, lalu upload satu file Excel."
      icon="upload"
    >
      <form onSubmit={onSubmitImport}>
        <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-sky-100 bg-sky-50 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-sky-800">
              Template Excel Siswa
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Letakkan file template di public/templates/template-import-siswa.xlsx.
            </p>
          </div>

          <a
            href={templateExcelUrl}
            download
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-600 hover:text-white"
          >
            <Icon name="upload" className="h-4 w-4" />
            Download Template
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Jurusan
            </span>
            <select
              value={importJurusanId}
              onChange={(event) => setImportJurusanId(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            >
              <option value="">Pilih jurusan</option>
              {jurusanRows.map((jurusan) => (
                <option key={jurusan.id} value={jurusan.id}>
                  {jurusan.nama}
                </option>
              ))}
            </select>
          </label>

        
        </div>

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
          className={`mt-5 cursor-pointer rounded-[2rem] border-2 border-dashed p-8 text-center transition ${
            dragActive
              ? "border-sky-500 bg-sky-50"
              : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/50"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(event) => pickFile(event.target.files?.[0])}
          />

          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white text-sky-700 shadow-sm ring-1 ring-sky-100">
            <Icon name="upload" className="h-7 w-7" />
          </div>

          <h3 className="mt-5 text-lg font-bold text-slate-950">
            Drag & drop file Excel di sini
          </h3>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Atau klik kotak ini untuk memilih file. Maksimal satu file.
          </p>

          {selectedFile ? (
            <div className="mx-auto mt-5 flex max-w-xl items-center justify-between gap-4 rounded-2xl bg-white p-4 text-left ring-1 ring-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-800">
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
                  setSelectedFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100"
              >
                Hapus
              </button>
            </div>
          ) : null}
        </div>

        <UploadProgress progress={uploadProgress} />

        <div className="mt-5">
          <StatusMessage message={importMessage} error={importError} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loadingImport || !canImport}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="upload" className="h-4 w-4" />
            {loadingImport ? "Mengimport..." : "Import Siswa"}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Kembali
          </button>
        </div>
      </form>
    </PageCard>
  );
}