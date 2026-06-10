"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../../../components/ui/icons";
import { TableSkeleton } from "../../../components/ui/LoadingSkeleton";
import { apiFetch } from "../../../lib/axios";
import type { JurusanRow, SiswaRow } from "../types";

type AcademicCategory =
  | "numerik"
  | "bahasa"
  | "sains"
  | "sosial"
  | "teknologi"
  | "agama"
  | "kreativitas"
  | "softskill"
  | "praktik";

type NilaiItem = {
  id_nilai?: number;
  id_kurikulum_mapel: number;
  nama_mapel: string;
  nilai: number;
  semester: number;
  kategori: AcademicCategory;
  kategori_label?: string;
  id_jurusan?: number | string | null;
};

type NilaiMatrixStudent = SiswaRow & {
  nilai?: NilaiItem[];
};

type NilaiMatrixResponse = {
  data?: NilaiMatrixStudent[];
  total?: number;
  page?: number;
  limit?: number;
  semester?: number;
  mapel_columns?: string[];
};

type Props = {
  siswaRows: SiswaRow[];
  jurusanRows: JurusanRow[];
  loadSiswa: (page?: number) => void;
  jenisSekolah?: string;
};

const ITEMS_PER_PAGE = 10;
const SEMESTER_OPTIONS = ["1", "2", "3", "4", "5", "6"];

type KelasFilter = "semua" | "10" | "11" | "12";

const KELAS_OPTIONS: Array<{ value: KelasFilter; label: string }> = [
  { value: "semua", label: "Semua kelas" },
  { value: "10", label: "Kelas 10" },
  { value: "11", label: "Kelas 11" },
  { value: "12", label: "Kelas 12" },
];

function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

function getSiswaId(siswa: SiswaRow) {
  return String(siswa.id_siswa ?? siswa.id ?? "");
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeKey(value: unknown) {
  return normalizeText(value)
    .replace(/\s+/g, " ")
    .replace(/[._-]+/g, " ")
    .trim();
}

function isSmaSchool(jenisSekolah?: string) {
  return String(jenisSekolah || "SMA").toUpperCase() === "SMA";
}

function isSemesterUmumSma(jenisSekolah: string | undefined, semester: string) {
  return isSmaSchool(jenisSekolah) && ["1", "2"].includes(semester);
}

function shouldShowJurusan(jenisSekolah: string | undefined, selectedSemester: string) {
  if (!isSmaSchool(jenisSekolah)) return true;
  return !isSemesterUmumSma(jenisSekolah, selectedSemester);
}

function getDisplayKelas(jenisSekolah: string | undefined, semester: string, siswa: SiswaRow) {
  if (!isSmaSchool(jenisSekolah)) {
    return siswa.kelas || "-";
  }

  const value = Number(semester);

  if ([1, 2].includes(value)) return "X";
  if ([3, 4].includes(value)) return "XI";
  if ([5, 6].includes(value)) return "XII";

  return siswa.kelas || "-";
}

function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  const numberValue = Number(value);
  const rounded = Number(numberValue.toFixed(2));

  return String(rounded);
}

function getNilaiForMapel(items: NilaiItem[], mapelName: string) {
  const targetKey = normalizeKey(mapelName);
  return items.find((item) => normalizeKey(item.nama_mapel) === targetKey);
}

function SummaryCard({
  title,
  value,
  desc,
  icon,
}: {
  title: string;
  value: string | number;
  desc: string;
  icon: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-cyan-50/40 to-sky-50/70 p-5 shadow-sm shadow-sky-100/60 transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-sky-700">
            {title}
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
            {desc}
          </p>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
          <Icon name={icon as any} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function AdminSchoolDataNilai({
  siswaRows: _siswaRows,
  jurusanRows,
  jenisSekolah,
  loadSiswa: _loadSiswa,
}: Props) {
  const [matrixRows, setMatrixRows] = useState<NilaiMatrixStudent[]>([]);
  const [mapelColumns, setMapelColumns] = useState<string[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [hasLoadedMatrixOnce, setHasLoadedMatrixOnce] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const restoreScrollYRef = useRef<number | null>(null);

  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  const [selectedJurusan, setSelectedJurusan] = useState<string>("semua");
  const [selectedKelas, setSelectedKelas] = useState<KelasFilter>("semua");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 450);
  const [currentPage, setCurrentPage] = useState(1);

  const sekolahSma = isSmaSchool(jenisSekolah);
  const jurusanFilterAktif = shouldShowJurusan(jenisSekolah, selectedSemester);

  const selectedJurusanName = useMemo(() => {
    if (selectedJurusan === "semua") return "";

    const found = jurusanRows.find(
      (jurusan) =>
        String(jurusan.id) === String(selectedJurusan) ||
        String(jurusan.id_jurusan ?? "") === String(selectedJurusan) ||
        normalizeKey(jurusan.nama) === normalizeKey(selectedJurusan) ||
        normalizeKey(jurusan.nama_jurusan) === normalizeKey(selectedJurusan)
    );

    return String(found?.nama ?? found?.nama_jurusan ?? selectedJurusan);
  }, [jurusanRows, selectedJurusan]);

  async function loadNilaiMatrix(page = currentPage) {
    if (jurusanFilterAktif && selectedJurusan === "semua" && jurusanRows.length > 0) {
      setMatrixRows([]);
      setMapelColumns([]);
      setTotalStudents(0);
      setHasLoadedMatrixOnce(true);
      return;
    }

    setLoadingMatrix(true);
    setErrorMessage("");

    const params = new URLSearchParams({
      page: String(page),
      limit: String(ITEMS_PER_PAGE),
      semester: selectedSemester,
      keyword: debouncedSearch.trim(),
      kelas: selectedKelas === "semua" ? "" : selectedKelas,
    });

    if (jurusanFilterAktif && selectedJurusan !== "semua") {
      const numericJurusan = Number(selectedJurusan);

      if (Number.isFinite(numericJurusan) && numericJurusan > 0) {
        params.set("id_jurusan", String(numericJurusan));
      } else {
        params.set("jurusan", selectedJurusanName || selectedJurusan);
      }
    }

    try {
      const result = await apiFetch<NilaiMatrixResponse>(
        `/admin-sekolah/nilai-matrix?${params.toString()}`,
        {
          method: "GET",
          alert: false,
        }
      );

      setMatrixRows(result.data || []);
      setMapelColumns(result.mapel_columns || []);
      setTotalStudents(result.total || 0);
    } catch (err) {
      setMatrixRows([]);
      setMapelColumns([]);
      setTotalStudents(0);
      setErrorMessage(
        err instanceof Error ? err.message : "Data nilai belum bisa dimuat."
      );
    } finally {
      setHasLoadedMatrixOnce(true);
      setLoadingMatrix(false);
    }
  }

  useEffect(() => {
    if (!jurusanFilterAktif) {
      setSelectedJurusan("semua");
      return;
    }

    if (selectedJurusan === "semua" && jurusanRows.length > 0) {
      const firstJurusan = jurusanRows[0];
      const firstJurusanId = firstJurusan?.id ?? firstJurusan?.id_jurusan;

      if (firstJurusanId) {
        setSelectedJurusan(String(firstJurusanId));
      }
    }
  }, [jurusanFilterAktif, jurusanRows, selectedJurusan]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSemester, selectedJurusan, selectedKelas, debouncedSearch]);

  useEffect(() => {
    void loadNilaiMatrix(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedSemester, selectedJurusan, selectedKelas, debouncedSearch, jurusanFilterAktif]);

  const totalPages = Math.max(1, Math.ceil(totalStudents / ITEMS_PER_PAGE));
  const isWaitingSearch = searchTerm !== debouncedSearch;
  const isLoading = loadingMatrix || isWaitingSearch;
  const showInitialSkeleton = isLoading && !hasLoadedMatrixOnce;
  const showTableOverlay = isLoading && hasLoadedMatrixOnce;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);


  useEffect(() => {
    if (loadingMatrix) return;
    if (restoreScrollYRef.current === null) return;

    const y = restoreScrollYRef.current;
    restoreScrollYRef.current = null;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: "auto" });
    });
  }, [loadingMatrix]);

  function changePage(nextPage: number) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    if (safePage === currentPage || isLoading) return;

    restoreScrollYRef.current = window.scrollY;
    setCurrentPage(safePage);
  }

  function getJurusanLabel(siswa: SiswaRow) {
    if (isSemesterUmumSma(jenisSekolah, selectedSemester)) return "-";
    return siswa.jurusan || "-";
  }

  function getStartNumber() {
    if (totalStudents === 0) return 0;
    return (currentPage - 1) * ITEMS_PER_PAGE + 1;
  }

  function getEndNumber() {
    return Math.min(currentPage * ITEMS_PER_PAGE, totalStudents);
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
      <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-7 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
              <Icon name="chart" className="h-3.5 w-3.5" />
              Data Nilai
            </p>

            <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Nilai Murni Siswa Per Mata Pelajaran
            </h3>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Data nilai dimuat per halaman dari server, jadi dashboard tidak perlu
              mengambil semua siswa dan semua nilai sekaligus.
            </p>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-white via-cyan-50/80 to-sky-50/80 px-4 py-3 text-sm font-bold text-sky-700 shadow-sm">
            Semester {selectedSemester}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 md:p-6">
        <div className="grid gap-5 md:grid-cols-3">
          <SummaryCard
            title="Total Siswa"
            value={isLoading ? "..." : totalStudents}
            desc="Data sesuai filter aktif"
            icon="users"
          />
          <SummaryCard
            title="Mata Pelajaran"
            value={isLoading ? "..." : mapelColumns.length}
            desc={`Semester ${selectedSemester}`}
            icon="chart"
          />
          <SummaryCard
            title="Mode Sekolah"
            value={sekolahSma ? "SMA" : "SMK"}
            desc={jurusanFilterAktif ? "Filter jurusan aktif" : "Semester umum tanpa jurusan"}
            icon="school"
          />
        </div>

        <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
          <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                Filter Nilai
              </p>
              <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                Pilih semester, jurusan, dan kelas
              </h3>
              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Pencarian diberi jeda singkat agar server tidak ditembak request
                setiap satu huruf diketik.
              </p>
            </div>

            <div className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20">
              {isLoading ? "Memuat..." : `${totalStudents} siswa`}
            </div>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-3 xl:grid-cols-[1.2fr_0.75fr_0.9fr_0.75fr_auto]">
            <div className="relative md:col-span-3 xl:col-span-1">
              <Icon
                name="search"
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Cari nama, NISN, kelas, jurusan..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <select
              value={selectedSemester}
              onChange={(event) => setSelectedSemester(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            >
              {SEMESTER_OPTIONS.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>

            <select
              value={selectedJurusan}
              onChange={(event) => setSelectedJurusan(event.target.value)}
              disabled={!jurusanFilterAktif}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="semua">
                {jurusanFilterAktif
                  ? "Pilih jurusan"
                  : "Semester 1 dan 2 SMA tidak memakai jurusan"}
              </option>
              {jurusanFilterAktif &&
                jurusanRows.map((jurusan) => (
                  <option
                    key={jurusan.id ?? jurusan.id_jurusan ?? jurusan.nama}
                    value={String(jurusan.id ?? jurusan.id_jurusan ?? jurusan.nama)}
                  >
                    {jurusan.nama || jurusan.nama_jurusan}
                  </option>
                ))}
            </select>

            <select
              value={selectedKelas}
              onChange={(event) => setSelectedKelas(event.target.value as KelasFilter)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            >
              {KELAS_OPTIONS.map((kelas) => (
                <option key={kelas.value} value={kelas.value}>
                  {kelas.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => loadNilaiMatrix(currentPage)}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-100 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="refresh" className="h-4 w-4" />
              {isLoading ? "Memuat" : "Refresh"}
            </button>
          </div>
        </section>

        <div className="space-y-3">
          {!sekolahSma && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-700">
              Mode SMK aktif. Jurusan berlaku mulai semester 1, dan kelas ditampilkan
              sesuai data Excel/database.
            </div>
          )}

          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold leading-6 text-rose-700">
              {errorMessage}
            </div>
          )}
        </div>

        {showInitialSkeleton ? (
          <TableSkeleton rows={6} columns={7} />
        ) : (
          <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
            {showTableOverlay && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/58 backdrop-blur-[1.5px]">
                <div className="inline-flex items-center gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-extrabold text-sky-700 shadow-xl shadow-sky-950/10">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-200 border-t-sky-700" />
                  Memuat halaman {currentPage}...
                </div>
              </div>
            )}

            <div className={`overflow-x-auto ${showTableOverlay ? "pointer-events-none select-none opacity-70" : ""}`}>
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gradient-to-r from-sky-100 via-white to-blue-100 text-xs font-black uppercase tracking-[0.14em] text-sky-800">
                  <tr>
                    <th className="sticky left-0 z-20 min-w-[220px] bg-sky-50 px-5 py-4">
                      Nama Siswa
                    </th>
                    <th className="min-w-[140px] px-5 py-4">NISN</th>
                    <th className="min-w-[110px] px-5 py-4">Kelas</th>
                    <th className="min-w-[140px] px-5 py-4">Jurusan</th>

                    {mapelColumns.map((mapel) => (
                      <th key={mapel} className="min-w-[150px] px-5 py-4 text-center">
                        {mapel}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {matrixRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4 + mapelColumns.length}
                        className="px-5 py-14 text-center"
                      >
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                          <Icon name="chart" className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">
                          Tidak ada data nilai sesuai filter.
                        </p>
                      </td>
                    </tr>
                  ) : mapelColumns.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-14 text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                          <Icon name="chart" className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">
                          Belum ada mapel/nilai pada semester ini.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    matrixRows.map((siswa) => {
                      const siswaId = getSiswaId(siswa);
                      const nilaiSemester = (siswa.nilai || []).filter(
                        (item) => Number(item.semester) === Number(selectedSemester)
                      );

                      return (
                        <tr key={siswaId} className="transition hover:bg-sky-50/50">
                          <td className="sticky left-0 z-10 min-w-[220px] bg-white px-5 py-4 font-semibold text-slate-900 group-hover:bg-sky-50/50">
                            {siswa.nama}
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-600">
                            {siswa.nisn}
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-600">
                            {getDisplayKelas(jenisSekolah, selectedSemester, siswa)}
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-600">
                            {getJurusanLabel(siswa)}
                          </td>

                          {mapelColumns.map((mapel) => {
                            const nilai = getNilaiForMapel(nilaiSemester, mapel);

                            return (
                              <td key={mapel} className="px-5 py-4 text-center">
                                {nilai ? (
                                  <span className="inline-flex min-w-12 justify-center rounded-full bg-sky-50 px-3 py-1 text-sm font-bold text-sky-700 ring-1 ring-sky-100">
                                    {formatScore(nilai.nilai)}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center gap-3 border-t border-sky-100 px-5 py-4 md:flex-row md:justify-between">
              <p className="text-sm font-medium text-slate-500">
                {totalStudents === 0
                  ? "Total 0 data"
                  : `Menampilkan ${getStartNumber()} - ${getEndNumber()} dari ${totalStudents} siswa`}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => changePage(currentPage - 1)}
                  className="inline-flex w-[104px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>

                <span className="inline-flex w-[72px] justify-center rounded-xl bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages || isLoading}
                  onClick={() => changePage(currentPage + 1)}
                  className="inline-flex w-[104px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
