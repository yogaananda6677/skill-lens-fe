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

type KelasTingkat = "10" | "11" | "12";
type KelasFilter = "semua" | KelasTingkat;

const ACADEMIC_CATEGORIES: AcademicCategory[] = [
  "numerik",
  "bahasa",
  "sains",
  "sosial",
  "teknologi",
  "agama",
  "kreativitas",
  "softskill",
];

const CATEGORY_LABEL: Record<AcademicCategory, string> = {
  numerik: "Numerik",
  bahasa: "Bahasa",
  sains: "Sains",
  sosial: "Sosial",
  teknologi: "Teknologi",
  agama: "Agama",
  kreativitas: "Kreativitas",
  softskill: "Softskill",
};

const KELAS_TINGKAT_OPTIONS: Array<{
  value: KelasTingkat;
  label: string;
}> = [
  { value: "10", label: "Kelas 10" },
  { value: "11", label: "Kelas 11" },
  { value: "12", label: "Kelas 12" },
];

type NilaiItem = {
  id_nilai?: number;
  id_kurikulum_mapel: number;
  nama_mapel: string;
  nilai: number;
  semester: number;
  kategori: AcademicCategory;
  kategori_label?: string;
};

type CategorySummary = {
  kategori: AcademicCategory;
  label: string;
  rata_rata: number | null;
  jumlah_mapel: number;
  mapel: string[];
};

type SemesterSummary = {
  semester: number;
  kategori: Record<AcademicCategory, CategorySummary>;
};

type NilaiResponse = {
  data?: NilaiItem[];
  per_semester?: SemesterSummary[];
};

type SiswaListResponse = {
  data?: SiswaRow[];
  total?: number;
};

type NilaiBySiswa = Record<
  string,
  {
    data: NilaiItem[];
    per_semester: SemesterSummary[];
  }
>;

type Props = {
  siswaRows: SiswaRow[];
  jurusanRows: JurusanRow[];
  loadSiswa: (page?: number) => void;
};

const ITEMS_PER_PAGE = 10;
const FETCH_LIMIT = 100;
const SEMESTER_OPTIONS = ["1", "2", "3", "4", "5", "6"];

function getSiswaId(siswa: SiswaRow) {
  return String(siswa.id ?? "");
}

function isSemesterUmum(semester: string) {
  return semester === "1" || semester === "2";
}

function shouldShowJurusan(selectedSemester: string) {
  return selectedSemester === "semua" || !isSemesterUmum(selectedSemester);
}

function getKelasBySemester(semester: string | number): KelasTingkat | null {
  const value = Number(semester);

  if ([1, 2].includes(value)) return "10";
  if ([3, 4].includes(value)) return "11";
  if ([5, 6].includes(value)) return "12";

  return null;
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

function getKelasLabel(kelas: KelasFilter) {
  if (kelas === "semua") return "Semua Kelas";

  return (
    KELAS_TINGKAT_OPTIONS.find((item) => item.value === kelas)?.label || kelas
  );
}

function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";

  const rounded = Number(value.toFixed(2));
  return String(rounded);
}

function emptyCategorySummary(category: AcademicCategory): CategorySummary {
  return {
    kategori: category,
    label: CATEGORY_LABEL[category],
    rata_rata: null,
    jumlah_mapel: 0,
    mapel: [],
  };
}

function buildSummaryFromRawNilai(nilaiRows: NilaiItem[]): SemesterSummary[] {
  const semesterMap = new Map<
    number,
    Record<AcademicCategory, { sum: number; count: number; mapel: Set<string> }>
  >();

  nilaiRows.forEach((item) => {
    const semester = Number(item.semester || 0);
    const category = item.kategori;

    if (!semester || !ACADEMIC_CATEGORIES.includes(category)) return;

    if (!semesterMap.has(semester)) {
      semesterMap.set(
        semester,
        ACADEMIC_CATEGORIES.reduce((acc, currentCategory) => {
          acc[currentCategory] = {
            sum: 0,
            count: 0,
            mapel: new Set<string>(),
          };
          return acc;
        }, {} as Record<AcademicCategory, { sum: number; count: number; mapel: Set<string> }>)
      );
    }

    const bucket = semesterMap.get(semester)?.[category];
    if (!bucket) return;

    bucket.sum += Number(item.nilai || 0);
    bucket.count += 1;
    bucket.mapel.add(item.nama_mapel);
  });

  return Array.from(semesterMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([semester, categories]) => ({
      semester,
      kategori: ACADEMIC_CATEGORIES.reduce((acc, category) => {
        const bucket = categories[category];

        acc[category] = {
          kategori: category,
          label: CATEGORY_LABEL[category],
          rata_rata: bucket.count ? bucket.sum / bucket.count : null,
          jumlah_mapel: bucket.count,
          mapel: Array.from(bucket.mapel.values()).sort(),
        };

        return acc;
      }, {} as Record<AcademicCategory, CategorySummary>),
    }));
}

export function AdminSchoolDataNilai({ siswaRows, jurusanRows }: Props) {
  const [allSiswaRows, setAllSiswaRows] = useState<SiswaRow[]>(siswaRows || []);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [loadingNilai, setLoadingNilai] = useState(false);

  const [selectedSemester, setSelectedSemester] = useState<string>("semua");
  const [selectedKelas, setSelectedKelas] = useState<KelasFilter>("semua");
  const [selectedJurusan, setSelectedJurusan] = useState<string>("semua");
  const [searchTerm, setSearchTerm] = useState("");

  const [nilaiBySiswa, setNilaiBySiswa] = useState<NilaiBySiswa>({});
  const [currentPage, setCurrentPage] = useState(1);

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

            const rawNilai = result.data || [];
            const semesterSummary =
              result.per_semester && result.per_semester.length > 0
                ? result.per_semester
                : buildSummaryFromRawNilai(rawNilai);

            return [
              siswaId,
              {
                data: rawNilai,
                per_semester: semesterSummary,
              },
            ] as const;
          } catch (err) {
            console.error(`Gagal memuat nilai siswa ${siswaId}:`, err);

            return [
              siswaId,
              {
                data: [],
                per_semester: [],
              },
            ] as const;
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
  }, []);

  useEffect(() => {
    if (siswaRows.length > allSiswaRows.length) {
      setAllSiswaRows(siswaRows);
      loadNilaiForStudents(siswaRows);
    }
  }, [siswaRows]);

  useEffect(() => {
    if (isSemesterUmum(selectedSemester)) {
      setSelectedJurusan("semua");
    }

    const kelasBySemester = getKelasBySemester(selectedSemester);

    if (kelasBySemester) {
      setSelectedKelas(kelasBySemester);
    }
  }, [selectedSemester]);

  const kelasFilterOptions = useMemo(() => {
    if (selectedSemester !== "semua") {
      const kelasBySemester = getKelasBySemester(selectedSemester);

      return KELAS_TINGKAT_OPTIONS.filter(
        (kelas) => kelas.value === kelasBySemester
      );
    }

    return KELAS_TINGKAT_OPTIONS;
  }, [selectedSemester]);

  const filteredSiswa = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const jurusanFilterAktif = shouldShowJurusan(selectedSemester);

    return allSiswaRows.filter((siswa) => {
      const tingkatKelas = getKelasTingkat(siswa.kelas);

      const matchKelas =
        selectedKelas === "semua" || tingkatKelas === selectedKelas;

      const matchJurusan =
        !jurusanFilterAktif ||
        selectedJurusan === "semua" ||
        String(siswa.id_jurusan ?? "") === selectedJurusan;

      const matchKeyword =
        !keyword ||
        String(siswa.nama || "").toLowerCase().includes(keyword) ||
        String(siswa.nisn || "").toLowerCase().includes(keyword) ||
        String(siswa.kelas || "").toLowerCase().includes(keyword) ||
        String(siswa.jurusan || "").toLowerCase().includes(keyword);

      return matchKelas && matchJurusan && matchKeyword;
    });
  }, [allSiswaRows, selectedKelas, selectedJurusan, selectedSemester, searchTerm]);

  const semesterColumns = useMemo(() => {
    if (selectedSemester !== "semua") {
      return [Number(selectedSemester)];
    }

    const available = new Set<number>();

    filteredSiswa.forEach((siswa) => {
      const siswaId = getSiswaId(siswa);
      const summaries = nilaiBySiswa[siswaId]?.per_semester || [];

      summaries.forEach((item) => {
        if (item.semester) available.add(Number(item.semester));
      });
    });

    return Array.from(available.values()).sort((a, b) => a - b);
  }, [filteredSiswa, nilaiBySiswa, selectedSemester]);

  const tableColumns = useMemo(() => {
    return semesterColumns.flatMap((semester) =>
      ACADEMIC_CATEGORIES.map((category) => ({
        key: `${semester}|${category}`,
        semester,
        category,
        label:
          selectedSemester === "semua"
            ? `Smt ${semester} - ${CATEGORY_LABEL[category]}`
            : CATEGORY_LABEL[category],
      }))
    );
  }, [semesterColumns, selectedSemester]);

  const totalPages = Math.max(1, Math.ceil(filteredSiswa.length / ITEMS_PER_PAGE));

  const paginatedSiswa = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSiswa.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSiswa, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSemester, selectedKelas, selectedJurusan, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function handleSemesterChange(value: string) {
    setSelectedSemester(value);

    const kelasBySemester = getKelasBySemester(value);

    if (kelasBySemester) {
      setSelectedKelas(kelasBySemester);
      return;
    }

    setSelectedKelas("semua");
  }

  function handleKelasChange(value: string) {
    setSelectedKelas(value as KelasFilter);
  }

  function getCategoryValue(siswa: SiswaRow, semester: number, category: AcademicCategory) {
    const siswaId = getSiswaId(siswa);
    const summaries = nilaiBySiswa[siswaId]?.per_semester || [];
    const semesterSummary = summaries.find((item) => Number(item.semester) === semester);
    const categorySummary = semesterSummary?.kategori?.[category];

    if (!categorySummary) {
      return emptyCategorySummary(category);
    }

    return categorySummary;
  }

  function getJurusanLabel(siswa: SiswaRow) {
    if (isSemesterUmum(selectedSemester)) return "-";
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
  const jurusanFilterAktif = shouldShowJurusan(selectedSemester);
  const kelasDikunciSemester = selectedSemester !== "semua";

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
            Rekap Nilai Akademik Siswa
          </h2>

          <p className="mt-1 text-sm text-blue-100">
            Nilai ditampilkan per kategori akademik. Semester 1-2 untuk kelas 10, semester 3-4 untuk kelas 11, dan semester 5-6 untuk kelas 12.
          </p>
        </div>

        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari nama, NISN, kelas, jurusan..."
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            <select
              value={selectedSemester}
              onChange={(event) => handleSemesterChange(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            >
              <option value="semua">Semua Semester</option>
              {SEMESTER_OPTIONS.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>

            <select
              value={selectedKelas}
              onChange={(event) => handleKelasChange(event.target.value)}
              disabled={kelasDikunciSemester}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="semua">
                {kelasDikunciSemester
                  ? `${getKelasLabel(selectedKelas)} sesuai semester`
                  : "Semua Kelas"}
              </option>
              {!kelasDikunciSemester &&
                kelasFilterOptions.map((kelas) => (
                  <option key={kelas.value} value={kelas.value}>
                    {kelas.label}
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
                  : "Semester 1 dan 2 tidak memakai jurusan"}
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

        {selectedSemester !== "semua" && (
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
            Semester {selectedSemester} otomatis menampilkan {getKelasLabel(selectedKelas)}.
          </div>
        )}

        {isSemesterUmum(selectedSemester) && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
            Semester {selectedSemester} adalah semester umum kelas 10, jadi kolom dan filter jurusan tidak digunakan.
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

                      {tableColumns.map((column) => (
                        <th
                          key={column.key}
                          className="min-w-[140px] px-5 py-3 text-center"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white/60">
                    {paginatedSiswa.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4 + tableColumns.length}
                          className="px-5 py-12 text-center text-slate-500"
                        >
                          Tidak ada data siswa sesuai filter.
                        </td>
                      </tr>
                    ) : tableColumns.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-12 text-center text-slate-500"
                        >
                          Belum ada rekap nilai kategori untuk filter ini.
                        </td>
                      </tr>
                    ) : (
                      paginatedSiswa.map((siswa) => (
                        <tr key={siswa.id} className="transition hover:bg-slate-50/90">
                          <td className="sticky left-0 z-10 min-w-[220px] bg-white px-5 py-4 font-semibold text-slate-800">
                            {siswa.nama}
                          </td>
                          <td className="px-5 py-4 text-slate-600">{siswa.nisn}</td>
                          <td className="px-5 py-4 text-slate-600">{siswa.kelas || "-"}</td>
                          <td className="px-5 py-4 text-slate-600">{getJurusanLabel(siswa)}</td>

                          {tableColumns.map((column) => {
                            const categorySummary = getCategoryValue(
                              siswa,
                              column.semester,
                              column.category
                            );

                            return (
                              <td key={column.key} className="px-5 py-4 text-center">
                                {categorySummary.rata_rata === null ? (
                                  <span className="text-slate-300">-</span>
                                ) : (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="inline-flex min-w-12 justify-center rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
                                      {formatScore(categorySummary.rata_rata)}
                                    </span>

                                    <span
                                      className="max-w-[130px] truncate text-[11px] text-slate-400"
                                      title={categorySummary.mapel.join(", ")}
                                    >
                                      {categorySummary.jumlah_mapel} mapel
                                    </span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
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
