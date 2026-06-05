"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../../components/ui/icons";
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
  | "softskill";

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

type NilaiResponse = {
  data?: NilaiItem[];
};

type SiswaListResponse = {
  data?: SiswaRow[];
  total?: number;
};

type NilaiBySiswa = Record<string, NilaiItem[]>;

type Props = {
  siswaRows: SiswaRow[];
  jurusanRows: JurusanRow[];
  loadSiswa: (page?: number) => void;
  jenisSekolah?: string;
};

const ITEMS_PER_PAGE = 10;
const FETCH_LIMIT = 100;
const SEMESTER_OPTIONS = ["1", "2", "3", "4", "5", "6"];

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
  siswaRows,
  jurusanRows,
  jenisSekolah,
}: Props) {
  const [allSiswaRows, setAllSiswaRows] = useState<SiswaRow[]>(siswaRows || []);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [loadingNilai, setLoadingNilai] = useState(false);

  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  const [selectedJurusan, setSelectedJurusan] = useState<string>("semua");
  const [searchTerm, setSearchTerm] = useState("");

  const [nilaiBySiswa, setNilaiBySiswa] = useState<NilaiBySiswa>({});
  const [currentPage, setCurrentPage] = useState(1);

  const sekolahSma = isSmaSchool(jenisSekolah);
  const jurusanFilterAktif = shouldShowJurusan(jenisSekolah, selectedSemester);

  async function loadAllSiswaForNilai() {
    setLoadingSiswa(true);

    try {
      const firstResult = await apiFetch<SiswaListResponse>(
        `/admin-sekolah/siswa?page=1&limit=${FETCH_LIMIT}`,
        { method: "GET" }
      );

      let collected = firstResult.data || [];
      const total = firstResult.total || collected.length;
      const totalPages = Math.ceil(total / FETCH_LIMIT);

      if (totalPages > 1) {
        for (let page = 2; page <= totalPages; page += 1) {
          const result = await apiFetch<SiswaListResponse>(
            `/admin-sekolah/siswa?page=${page}&limit=${FETCH_LIMIT}`,
            { method: "GET" }
          );

          collected = [...collected, ...(result.data || [])];
        }
      }

      setAllSiswaRows(collected);
      await loadNilaiForStudents(collected);
    } catch (err) {
      console.error("Gagal memuat semua siswa:", err);
      setAllSiswaRows(siswaRows || []);
      await loadNilaiForStudents(siswaRows || []);
    } finally {
      setLoadingSiswa(false);
    }
  }

  async function loadNilaiForStudents(rows: SiswaRow[]) {
    const validRows = rows.filter((siswa) => Boolean(getSiswaId(siswa)));

    if (!validRows.length) {
      setNilaiBySiswa({});
      return;
    }

    setLoadingNilai(true);

    try {
      const entries = await Promise.all(
        validRows.map(async (siswa) => {
          const siswaId = getSiswaId(siswa);

          try {
            const result = await apiFetch<NilaiResponse>(
              `/admin-sekolah/siswa/${siswaId}/nilai`,
              { method: "GET" }
            );

            return [siswaId, result.data || []] as const;
          } catch (err) {
            console.error(`Gagal memuat nilai siswa ${siswaId}:`, err);

            return [siswaId, []] as const;
          }
        })
      );

      setNilaiBySiswa(Object.fromEntries(entries));
    } finally {
      setLoadingNilai(false);
    }
  }

  useEffect(() => {
    loadAllSiswaForNilai();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (siswaRows.length > allSiswaRows.length) {
      setAllSiswaRows(siswaRows);
      loadNilaiForStudents(siswaRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siswaRows]);

  useEffect(() => {
    if (!jurusanFilterAktif) {
      setSelectedJurusan("semua");
    }
  }, [jurusanFilterAktif]);

  const filteredSiswa = useMemo(() => {
    const keyword = normalizeText(searchTerm);
    const semesterNumber = Number(selectedSemester);

    return allSiswaRows.filter((siswa) => {
      const siswaId = getSiswaId(siswa);
      const nilaiSemester = (nilaiBySiswa[siswaId] || []).filter(
        (item) => Number(item.semester) === semesterNumber
      );

      if (!nilaiSemester.length) return false;

      const matchJurusan =
        !jurusanFilterAktif ||
        selectedJurusan === "semua" ||
        String(siswa.id_jurusan ?? "") === selectedJurusan;

      const matchKeyword =
        !keyword ||
        normalizeText(siswa.nama).includes(keyword) ||
        normalizeText(siswa.nisn).includes(keyword) ||
        normalizeText(siswa.kelas).includes(keyword) ||
        normalizeText(siswa.jurusan).includes(keyword);

      return matchJurusan && matchKeyword;
    });
  }, [
    allSiswaRows,
    jurusanFilterAktif,
    nilaiBySiswa,
    searchTerm,
    selectedJurusan,
    selectedSemester,
  ]);

  const mapelColumns = useMemo(() => {
    const semesterNumber = Number(selectedSemester);
    const unique = new Map<string, string>();

    filteredSiswa.forEach((siswa) => {
      const siswaId = getSiswaId(siswa);

      (nilaiBySiswa[siswaId] || [])
        .filter((item) => Number(item.semester) === semesterNumber)
        .forEach((item) => {
          const key = normalizeKey(item.nama_mapel);
          if (key && !unique.has(key)) {
            unique.set(key, item.nama_mapel);
          }
        });
    });

    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
  }, [filteredSiswa, nilaiBySiswa, selectedSemester]);

  const totalPages = Math.max(1, Math.ceil(filteredSiswa.length / ITEMS_PER_PAGE));

  const paginatedSiswa = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSiswa.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSiswa, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSemester, selectedJurusan, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function getJurusanLabel(siswa: SiswaRow) {
    if (isSemesterUmumSma(jenisSekolah, selectedSemester)) return "-";
    return siswa.jurusan || "-";
  }

  function getStartNumber() {
    if (filteredSiswa.length === 0) return 0;
    return (currentPage - 1) * ITEMS_PER_PAGE + 1;
  }

  function getEndNumber() {
    return Math.min(currentPage * ITEMS_PER_PAGE, filteredSiswa.length);
  }

  const isLoading = loadingSiswa || loadingNilai;

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
              Default menampilkan Semester 1. Data yang tampil adalah nilai mentah
              per mapel, bukan rata-rata kategori.
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
            value={isLoading ? "..." : filteredSiswa.length}
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
                Pilih semester dan jurusan
              </h3>
              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Gunakan filter untuk menampilkan nilai siswa sesuai semester, jurusan,
                atau kata kunci pencarian.
              </p>
            </div>

            <div className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20">
              {filteredSiswa.length} siswa
            </div>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-3 xl:grid-cols-[1.2fr_0.8fr_0.9fr_auto]">
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
                  ? "Semua Jurusan"
                  : "Semester 1 dan 2 SMA tidak memakai jurusan"}
              </option>
              {jurusanFilterAktif &&
                jurusanRows.map((jurusan) => (
                  <option key={jurusan.id} value={String(jurusan.id)}>
                    {jurusan.nama}
                  </option>
                ))}
            </select>

            <button
              type="button"
              onClick={loadAllSiswaForNilai}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-100 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="refresh" className="h-4 w-4" />
              Refresh
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
        </div>

        {isLoading ? (
          <div className="grid min-h-[260px] place-items-center rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/70 shadow-sm shadow-sky-100/60">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-sky-600" />
              <p className="mt-3 text-sm font-semibold text-slate-500">
                Memuat data siswa dan nilai...
              </p>
            </div>
          </div>
        ) : (
          <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
            <div className="overflow-x-auto">
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
                  {paginatedSiswa.length === 0 ? (
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
                    paginatedSiswa.map((siswa) => {
                      const siswaId = getSiswaId(siswa);
                      const nilaiSemester = (nilaiBySiswa[siswaId] || []).filter(
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
                {filteredSiswa.length === 0
                  ? "Total 0 data"
                  : `Menampilkan ${getStartNumber()} - ${getEndNumber()} dari ${filteredSiswa.length} siswa`}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="inline-flex w-[104px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>

                <span className="inline-flex w-[72px] justify-center rounded-xl bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
