import type { RefObject } from "react";
import { Icon } from "../../../components/ui/icons";
import type { UploadProgressState } from "../../../lib/upload";
import { templateExcelUrl } from "../constants";
import type { JurusanRow } from "../types";
import { StatusMessage, UploadProgress } from "./AdminSchoolShared";

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
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-xl bg-white p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
            <Icon name="upload" className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Import Siswa</p>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Upload file Excel siswa</h2>
        <p className="mt-1 text-sm text-slate-500">Pilih jurusan terlebih dahulu, lalu upload satu file Excel.</p>

        <form onSubmit={onSubmitImport}>
          <div className="mt-5 mb-5 flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-800">Template Excel Siswa</p>
              <p className="mt-1 text-sm text-slate-500">
                Letakkan file template di public/templates/template-import-siswa.xlsx.
              </p>
            </div>
            <a
              href={templateExcelUrl}
              download
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
            >
              <Icon name="download" className="h-4 w-4" />
              Download Template
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Jurusan</span>
              <select
                value={importJurusanId}
                onChange={(event) => setImportJurusanId(event.target.value)}
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
            className={`mt-5 cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
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
            <h3 className="mt-3 text-base font-bold text-slate-800">Drag & drop file Excel di sini</h3>
            <p className="mt-1 text-sm text-slate-500">Atau klik kotak ini untuk memilih file. Maksimal satu file.</p>

            {selectedFile && (
              <div className="mx-auto mt-4 flex max-w-md items-center justify-between gap-3 rounded-lg bg-white p-3 text-left shadow-sm border border-slate-200">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedFile(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
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
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
            >
              <Icon name="upload" className="h-4 w-4" />
              {loadingImport ? "Mengimport..." : "Import Siswa"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Kembali
            </button>
          </div>
        </form>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70 rounded-b-xl" />
    </div>
  );
}