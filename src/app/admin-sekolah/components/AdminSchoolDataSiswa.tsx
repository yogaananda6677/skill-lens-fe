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

function normalizeKey(value: unknown) {
  return normalizeText(value).replace(/[._-]+/g, " " ).replace(/\s+/g, " " ).trim();
}

function isAllFilter(value: unknown) {
  const text = normalizeKey(value);
  return !text || text === "semua" || text === "all" || text === "semua jurusan" || text === "semua kelas";
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
          <td>${escapeHtml(siswa.password_awal || siswa.nisn || "-")}</td>
          <td>${escapeHtml(siswa.status || "Aktif")}</td>
        </tr>
      `;
    })
    .join("");

  const filterInfo = `
    <tr>
      <td colspan="8"><b>Filter Jurusan:</b> ${escapeHtml(
        options?.jurusan || "Semua Jurusan"
      )}</td>
    </tr>
    <tr>
      <td colspan="8"><b>Filter Kelas:</b> ${escapeHtml(
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
              <th colspan="8">Data Siswa SkillLens</th>
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

function StudentAvatar({ name }: { name: string }) {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "SW";

  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sm font-black text-sky-700 ring-1 ring-sky-200/70">
      {initials}
    </div>
  );
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
      (jurusan) =>
        String(jurusan.id) === String(siswaJurusanFilter) ||
        String(jurusan.id_jurusan ?? "") === String(siswaJurusanFilter) ||
        normalizeKey(jurusan.nama) === normalizeKey(siswaJurusanFilter) ||
        normalizeKey(jurusan.nama_jurusan) === normalizeKey(siswaJurusanFilter)
    );

    return found?.nama || found?.nama_jurusan || siswaJurusanFilter || "Jurusan terpilih";
  }, [jurusanFilterAktif, jurusanRows, siswaJurusanFilter]);

  const kelasOptions = useMemo(() => {
    if (!jurusanFilterAktif) return [];

    const available = new Set<KelasTingkat>();

    siswaRows
      .filter((siswa) => {
        if (!jurusanFilterAktif) return true;
        const byId = String(siswa.id_jurusan ?? "") === String(siswaJurusanFilter);
        const byName = normalizeKey(siswa.jurusan) === normalizeKey(selectedJurusanName);
        return byId || byName;
      })
      .forEach((siswa) => {
        const tingkat = getKelasTingkat(siswa.kelas);

        if (tingkat) {
          available.add(tingkat);
        }
      });

    return KELAS_TINGKAT_OPTIONS.filter((kelas) => available.has(kelas.value));
  }, [jurusanFilterAktif, selectedJurusanName, siswaJurusanFilter, siswaRows]);

  const filteredRows = useMemo(() => {
    return siswaRows.filter((siswa) => {
      const matchJurusan =
        !jurusanFilterAktif ||
        isAllFilter(siswaJurusanFilter) ||
        String(siswa.id_jurusan ?? "") === String(siswaJurusanFilter) ||
        normalizeKey(siswa.jurusan) === normalizeKey(selectedJurusanName);

      const matchKelas =
        kelasFilter === "semua" || getKelasTingkat(siswa.kelas) === kelasFilter;

      return matchJurusan && matchKelas;
    });
  }, [kelasFilter, jurusanFilterAktif, selectedJurusanName, siswaJurusanFilter, siswaRows]);

  const hasRows = filteredRows.length > 0;
  const safeLimit = siswaLimit > 0 ? siswaLimit : 10;
  const totalPages = Math.max(1, Math.ceil(siswaTotal / safeLimit));

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
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
      <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-7 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
              <Icon name="profile" className="h-3.5 w-3.5" />
              Data Siswa
            </p>

            <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Kelola Data Siswa
            </h3>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Lihat dan export data siswa berdasarkan nama, NISN, username, kelas, dan jurusan.
            </p>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-white via-cyan-50/80 to-sky-50/80 px-4 py-3 text-sm font-bold text-sky-700 shadow-sm">
            Total {siswaTotal} data
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 md:p-6">
        <div className="grid gap-3 xl:grid-cols-[1.3fr_0.8fr_0.8fr_auto]">
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              value={siswaSearch}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Cari nama, NISN, username..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <select
            value={siswaJurusanFilter}
            onChange={(event) => handleJurusanChange(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
          >
            <option value="semua">Semua jurusan</option>
            {jurusanRows.map((jurusan) => (
              <option key={jurusan.id ?? jurusan.id_jurusan ?? jurusan.nama} value={String(jurusan.nama || jurusan.nama_jurusan || jurusan.id || jurusan.id_jurusan)}>
                {jurusan.nama || jurusan.nama_jurusan}
              </option>
            ))}
          </select>

          <select
            value={kelasFilter}
            onChange={(event) => handleKelasChange(event.target.value)}
            disabled={!jurusanFilterAktif}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="download" className="h-4 w-4" />
            Export Excel
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/50">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-sky-100 via-white to-blue-100 text-xs font-black uppercase tracking-[0.14em] text-sky-800">
                <tr>
                  <th className="px-5 py-4">Siswa</th>
                  <th className="px-5 py-4">NISN</th>
                  <th className="px-5 py-4">Kelas</th>
                  <th className="px-5 py-4">Jurusan</th>
                  <th className="px-5 py-4">Username</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {hasRows ? (
                  filteredRows.map((siswa) => (
                    <tr key={siswa.id} className="transition hover:bg-sky-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <StudentAvatar name={siswa.nama} />
                          <div>
                            <p className="font-bold text-slate-900">
                              {siswa.nama}
                            </p>
                            <p className="mt-0.5 text-xs font-medium text-slate-500">
                              {siswa.status || "Aktif"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-600">
                        {siswa.nisn}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-600">
                        {siswa.kelas || "-"}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-600">
                        {siswa.jurusan || "-"}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-600">
                        {siswa.username || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                          {siswa.status || "Aktif"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                        <Icon name="profile" className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        Belum ada data siswa sesuai filter.
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Ubah pencarian, jurusan, atau filter kelas untuk melihat data.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-sky-100 pt-5 md:flex-row md:items-center md:justify-between">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={siswaPage <= 1}
              onClick={() => {
                const next = siswaPage - 1;
                setSiswaPage(next);
                loadSiswa(next);
              }}
              className="inline-flex w-[104px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sebelumnya
            </button>

            <span className="inline-flex w-[72px] justify-center rounded-xl bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">
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
              className="inline-flex w-[104px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
