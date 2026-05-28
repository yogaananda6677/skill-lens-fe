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

export function AdminSchoolDataNilai({
  siswaRows,
  jurusanRows,
  jenisSekolah,
}: Props) {
  const [allSiswaRows, setAllSiswaRows] = useState<SiswaRow[]>(siswaRows || []);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [loadingNilai, setLoadingNilai] = useState(false);

  // Default harus Semester 1, bukan semua semester.
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

      // Penting:
      // Jangan filter berdasarkan siswa.kelas, karena siswa.kelas bisa berisi kelas terakhir.
      // Untuk SMA hasil import multi-semester sering tersimpan XII, tetapi nilai semester 1 tetap ada.
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-2xl bg-gradient-to-b from-blue-50/90 to-white p-6">
        <div className="-mx-6 -mt-6 mb-6 rounded-t-2xl bg-gradient-to-r from-[#0a1a3a] to-[#0f2a5f] px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/20 p-1.5 text-white">
              <Icon name="chart" className="h-4 w-4" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
              Data Nilai
            </p>
          </div>

          <h2 className="mt-2 text-xl font-bold text-white">
            Nilai Murni Siswa Per Mata Pelajaran
          </h2>

          <p className="mt-1 text-sm text-blue-100">
            Default menampilkan Semester 1. Data yang tampil adalah nilai mentah per mapel, bukan rata-rata kategori.
          </p>
        </div>

        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari nama, NISN, kelas, jurusan..."
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            <select
              value={selectedSemester}
              onChange={(event) => setSelectedSemester(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
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
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              Total {filteredSiswa.length} siswa
            </div>

            <button
              type="button"
              onClick={loadAllSiswaForNilai}
              disabled={isLoading}
              className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
          Semester {selectedSemester} menampilkan nilai murni per mata pelajaran. Filter kelas tidak dipakai agar data SMA semester 1 tetap muncul walaupun siswa tersimpan sebagai kelas terakhir.
        </div>

        {isSemesterUmumSma(jenisSekolah, selectedSemester) && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
            Semester {selectedSemester} adalah semester umum SMA, jadi jurusan tidak digunakan.
          </div>
        )}

        {!sekolahSma && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700">
            Mode SMK aktif. Jurusan berlaku mulai semester 1, dan kelas ditampilkan sesuai data Excel/database.
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/70 py-14">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              Memuat data siswa dan nilai...
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-blue-200 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800">
                    <tr>
                      <th className="sticky left-0 z-20 min-w-[220px] bg-blue-100 px-5 py-3">
                        Nama Siswa
                      </th>
                      <th className="min-w-[140px] px-5 py-3">NISN</th>
                      <th className="min-w-[110px] px-5 py-3">Kelas</th>
                      <th className="min-w-[140px] px-5 py-3">Jurusan</th>

                      {mapelColumns.map((mapel) => (
                        <th key={mapel} className="min-w-[150px] px-5 py-3 text-center">
                          {mapel}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white/60">
                    {paginatedSiswa.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4 + mapelColumns.length}
                          className="px-5 py-12 text-center text-slate-500"
                        >
                          Tidak ada data nilai sesuai filter.
                        </td>
                      </tr>
                    ) : mapelColumns.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-12 text-center text-slate-500"
                        >
                          Belum ada mapel/nilai pada semester ini.
                        </td>
                      </tr>
                    ) : (
                      paginatedSiswa.map((siswa) => {
                        const siswaId = getSiswaId(siswa);
                        const nilaiSemester = (nilaiBySiswa[siswaId] || []).filter(
                          (item) => Number(item.semester) === Number(selectedSemester)
                        );

                        return (
                          <tr key={siswaId} className="transition hover:bg-slate-50/90">
                            <td className="sticky left-0 z-10 min-w-[220px] bg-white px-5 py-4 font-semibold text-slate-800">
                              {siswa.nama}
                            </td>
                            <td className="px-5 py-4 text-slate-600">{siswa.nisn}</td>
                            <td className="px-5 py-4 text-slate-600">
                              {getDisplayKelas(jenisSekolah, selectedSemester, siswa)}
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {getJurusanLabel(siswa)}
                            </td>

                            {mapelColumns.map((mapel) => {
                              const nilai = getNilaiForMapel(nilaiSemester, mapel);

                              return (
                                <td key={mapel} className="px-5 py-4 text-center">
                                  {nilai ? (
                                    <span className="inline-flex min-w-12 justify-center rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
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
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Sebelumnya
                </button>

                <span className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-b-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70" />
    </div>
  );
}
