import { useMemo, useState } from "react";
import type { JurusanRow, SiswaRow } from "../types";
import { Icon } from "../../../components/ui/icons";

type KelasTingkat = "10" | "11" | "12";
type KelasFilter = "semua" | KelasTingkat;

const KELAS_TINGKAT_OPTIONS: Array<{
  value: KelasTingkat;
  label: string;
}> = [
  { value: "10", label: "Kelas 10" },
  { value: "11", label: "Kelas 11" },
  { value: "12", label: "Kelas 12" },
];

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function getKelasTingkat(value: unknown): KelasTingkat | null {
  const text = String(value ?? "").trim().toLowerCase();

  if (!text) return null;

  if (
    text.includes("10") ||
    text.includes("kelas x") ||
    text === "x" ||
    text.startsWith("x ") ||
    text.startsWith("x-")
  ) {
    return "10";
  }

  if (
    text.includes("11") ||
    text.includes("kelas xi") ||
    text === "xi" ||
    text.startsWith("xi ") ||
    text.startsWith("xi-")
  ) {
    return "11";
  }

  if (
    text.includes("12") ||
    text.includes("kelas xii") ||
    text === "xii" ||
    text.startsWith("xii ") ||
    text.startsWith("xii-")
  ) {
    return "12";
  }

  return null;
}

function getKelasFilterLabel(kelasFilter: KelasFilter) {
  if (kelasFilter === "semua") return "Semua Kelas";

  return (
    KELAS_TINGKAT_OPTIONS.find((kelas) => kelas.value === kelasFilter)?.label ||
    kelasFilter
  );
}

function downloadExcel(
  rows: SiswaRow[],
  options?: { jurusan?: string; kelas?: string }
) {
  const tableRows = rows
    .map((siswa, index) => {
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(siswa.nama)}</td>
          <td>${escapeHtml(siswa.nisn)}</td>
          <td>${escapeHtml(siswa.kelas || "-")}</td>
          <td>${escapeHtml(siswa.jurusan || "-")}</td>
          <td>${escapeHtml(siswa.username || "-")}</td>
          <td>${escapeHtml(siswa.status || "Aktif")}</td>
        </tr>
      `;
    })
    .join("");

  const filterInfo = `
    <tr>
      <td colspan="7"><b>Filter Jurusan:</b> ${escapeHtml(
        options?.jurusan || "Semua Jurusan"
      )}</td>
    </tr>
    <tr>
      <td colspan="7"><b>Filter Kelas:</b> ${escapeHtml(
        options?.kelas || "Semua Kelas"
      )}</td>
    </tr>
    <tr></tr>
  `;

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th colspan="7">Data Siswa SkillLens</th>
            </tr>
            ${filterInfo}
            <tr>
              <th>No</th>
              <th>Nama Siswa</th>
              <th>NISN</th>
              <th>Kelas</th>
              <th>Jurusan</th>
              <th>Username</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  const jurusanName = normalizeText(options?.jurusan || "semua-jurusan").replaceAll(
    " ",
    "-"
  );
  const kelasName = normalizeText(options?.kelas || "semua-kelas").replaceAll(
    " ",
    "-"
  );

  link.href = url;
  link.download = `data-siswa-${jurusanName}-${kelasName}-${date}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function AdminSchoolDataSiswa({
  siswaRows,
  siswaTotal,
  siswaPage,
  siswaLimit,
  siswaSearch,
  siswaJurusanFilter,
  jurusanRows,
  setSiswaSearch,
  setSiswaJurusanFilter,
  setSiswaPage,
  loadSiswa,
}: {
  siswaRows: SiswaRow[];
  siswaTotal: number;
  siswaPage: number;
  siswaLimit: number;
  siswaSearch: string;
  siswaJurusanFilter: string;
  jurusanRows: JurusanRow[];
  setSiswaSearch: (value: string) => void;
  setSiswaJurusanFilter: (value: string) => void;
  setSiswaPage: (value: number) => void;
  loadSiswa: (page?: number) => void;
}) {
  const [kelasFilter, setKelasFilter] = useState<KelasFilter>("semua");

  const jurusanFilterAktif = siswaJurusanFilter !== "semua";

  const selectedJurusanName = useMemo(() => {
    if (!jurusanFilterAktif) return "Semua Jurusan";

    const found = jurusanRows.find(
      (jurusan) => String(jurusan.id) === String(siswaJurusanFilter)
    );

    return found?.nama || "Jurusan terpilih";
  }, [jurusanFilterAktif, jurusanRows, siswaJurusanFilter]);

  const kelasOptions = useMemo(() => {
    if (!jurusanFilterAktif) return [];

    const available = new Set<KelasTingkat>();

    siswaRows.forEach((siswa) => {
      const tingkat = getKelasTingkat(siswa.kelas);

      if (tingkat) {
        available.add(tingkat);
      }
    });

    return KELAS_TINGKAT_OPTIONS.filter((kelas) => available.has(kelas.value));
  }, [jurusanFilterAktif, siswaRows]);

  const filteredRows = useMemo(() => {
    if (!jurusanFilterAktif || kelasFilter === "semua") return siswaRows;

    return siswaRows.filter(
      (siswa) => getKelasTingkat(siswa.kelas) === kelasFilter
    );
  }, [kelasFilter, jurusanFilterAktif, siswaRows]);

  const hasRows = filteredRows.length > 0;
  const totalPages = Math.max(1, Math.ceil(siswaTotal / siswaLimit));

  function handleJurusanChange(value: string) {
    setSiswaJurusanFilter(value);
    setKelasFilter("semua");
    setSiswaPage(1);
  }

  function handleSearchChange(value: string) {
    setSiswaSearch(value);
    setSiswaPage(1);
  }

  function handleKelasChange(value: string) {
    setKelasFilter(value as KelasFilter);
  }

  function handleExport() {
    downloadExcel(filteredRows, {
      jurusan: selectedJurusanName,
      kelas: getKelasFilterLabel(kelasFilter),
    });
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-2xl bg-gradient-to-b from-blue-50/90 to-white p-6">
        <div className="-mx-6 -mt-6 mb-6 rounded-t-2xl bg-gradient-to-r from-[#0a1a3a] to-[#0f2a5f] px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/20 p-1.5 text-white">
              <Icon name="profile" className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
              Data Siswa
            </p>
          </div>
          <h2 className="mt-2 text-xl font-bold text-white">Kelola data siswa</h2>
          <p className="mt-1 text-sm text-blue-100">
            Lihat dan export data siswa berdasarkan nama, NISN, kelas, username,
            dan jurusan tanpa menampilkan password awal.
          </p>
        </div>

        <div className="mb-5 grid gap-3 xl:grid-cols-[1.3fr_0.8fr_0.8fr_auto]">
          <input
            value={siswaSearch}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Cari nama, NISN, username..."
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />

          <select
            value={siswaJurusanFilter}
            onChange={(event) => handleJurusanChange(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="semua">Semua jurusan</option>
            {jurusanRows.map((jurusan) => (
              <option key={jurusan.id} value={String(jurusan.id)}>
                {jurusan.nama}
              </option>
            ))}
          </select>

          <select
            value={kelasFilter}
            onChange={(event) => handleKelasChange(event.target.value)}
            disabled={!jurusanFilterAktif}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="semua">
              {jurusanFilterAktif ? "Semua kelas" : "Pilih jurusan dulu"}
            </option>
            {kelasOptions.map((kelas) => (
              <option key={kelas.value} value={kelas.value}>
                {kelas.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!hasRows}
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="download" className="h-4 w-4" />
            Export Excel
          </button>
        </div>

        {!jurusanFilterAktif && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700">
            Filter kelas akan aktif setelah jurusan dipilih. Password awal tidak
            ditampilkan di tabel maupun file export.
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/50">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-blue-200 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800">
                <tr>
                  <th className="px-5 py-3">Siswa</th>
                  <th className="px-5 py-3">NISN</th>
                  <th className="px-5 py-3">Kelas</th>
                  <th className="px-5 py-3">Jurusan</th>
                  <th className="px-5 py-3">Username</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/50">
                {hasRows ? (
                  filteredRows.map((siswa) => (
                    <tr key={siswa.id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">{siswa.nama}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {siswa.status || "Aktif"}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{siswa.nisn}</td>
                      <td className="px-5 py-3 text-slate-600">
                        {siswa.kelas || "-"}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {siswa.jurusan || "-"}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {siswa.username || "-"}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          {siswa.status || "Aktif"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                      Belum ada data siswa sesuai filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-medium text-slate-500">
            <p>Total {siswaTotal} data</p>
            {jurusanFilterAktif && (
              <p className="mt-1 text-xs text-slate-400">
                Ditampilkan di halaman ini: {filteredRows.length} data
                {kelasFilter !== "semua"
                  ? ` untuk ${getKelasFilterLabel(kelasFilter)}`
                  : ""}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={siswaPage <= 1}
              onClick={() => {
                const next = siswaPage - 1;
                setSiswaPage(next);
                loadSiswa(next);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              {siswaPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={siswaPage >= totalPages}
              onClick={() => {
                const next = siswaPage + 1;
                setSiswaPage(next);
                loadSiswa(next);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-b-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70" />
    </div>
  );
}
