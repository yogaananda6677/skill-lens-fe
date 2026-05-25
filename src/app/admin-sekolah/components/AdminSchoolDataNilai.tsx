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

type Props = {
  siswaRows: SiswaRow[];
  jurusanRows: JurusanRow[];
  loadSiswa: (page?: number) => void;
};

const ITEMS_PER_PAGE = 10;
const FETCH_LIMIT = 100;

export function AdminSchoolDataNilai({ siswaRows, jurusanRows }: Props) {
  const [allSiswaRows, setAllSiswaRows] = useState<SiswaRow[]>(siswaRows || []);
  const [loadingSiswa, setLoadingSiswa] = useState(false);

  const [selectedJurusan, setSelectedJurusan] = useState<string>("semua");
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaRow | null>(null);
  const [nilaiList, setNilaiList] = useState<NilaiItem[]>([]);
  const [semesterSummary, setSemesterSummary] = useState<SemesterSummary[]>([]);
  const [loadingNilai, setLoadingNilai] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
        for (let page = 2; page <= totalPages; page++) {
          const result = await apiFetch<SiswaListResponse>(
            `/admin-sekolah/siswa?page=${page}&limit=${FETCH_LIMIT}`,
            { method: "GET" }
          );
          collected = [...collected, ...(result.data || [])];
        }
      }
      setAllSiswaRows(collected);
    } catch (err) {
      console.error("Gagal memuat semua siswa:", err);
      setAllSiswaRows(siswaRows || []);
    } finally {
      setLoadingSiswa(false);
    }
  }

  useEffect(() => {
    loadAllSiswaForNilai();
  }, []);

  useEffect(() => {
    if (siswaRows.length > allSiswaRows.length) setAllSiswaRows(siswaRows);
  }, [siswaRows]);

  const filteredSiswa = useMemo(() => {
    return allSiswaRows.filter((siswa) => {
      if (selectedJurusan === "semua") return true;
      return String(siswa.id_jurusan ?? "") === selectedJurusan;
    });
  }, [allSiswaRows, selectedJurusan]);

  const totalPages = Math.max(1, Math.ceil(filteredSiswa.length / ITEMS_PER_PAGE));
  const paginatedSiswa = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSiswa.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSiswa, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedJurusan]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  async function handleShowNilai(siswa: SiswaRow) {
    setSelectedSiswa(siswa);
    setLoadingNilai(true);
    setShowModal(true);
    setNilaiList([]);
    setSemesterSummary([]);
    try {
      const result = await apiFetch<NilaiResponse>(
        `/admin-sekolah/siswa/${siswa.id}/nilai`,
        { method: "GET" }
      );
      setNilaiList(result.data || []);
      setSemesterSummary(result.per_semester || []);
    } catch (err) {
      console.error("Gagal memuat nilai:", err);
    } finally {
      setLoadingNilai(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setSelectedSiswa(null);
    setNilaiList([]);
    setSemesterSummary([]);
  }

  function getStartNumber() {
    if (filteredSiswa.length === 0) return 0;
    return (currentPage - 1) * ITEMS_PER_PAGE + 1;
  }

  function getEndNumber() {
    return Math.min(currentPage * ITEMS_PER_PAGE, filteredSiswa.length);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-2xl bg-white p-6">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
            <Icon name="chart" className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Data Nilai
          </p>
        </div>

        <h2 className="text-xl font-bold text-slate-800">Kelola nilai siswa</h2>
        <p className="mt-1 text-sm text-slate-500">
          Lihat nilai akademik siswa berdasarkan semester dan kategori.
        </p>

        <div className="mt-5 mb-5 flex flex-wrap items-center justify-between gap-3">
          <select
            value={selectedJurusan}
            onChange={(e) => setSelectedJurusan(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="semua">Semua Jurusan</option>
            {jurusanRows.map((jurusan) => (
              <option key={jurusan.id} value={String(jurusan.id)}>
                {jurusan.nama}
              </option>
            ))}
          </select>
          <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            Total {filteredSiswa.length} data
          </div>
        </div>

        {loadingSiswa ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 py-14">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-3 text-sm font-medium text-slate-500">Memuat data siswa...</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-blue-200 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800">
                    <tr>
                      <th className="px-5 py-3">Nama Siswa</th>
                      <th className="px-5 py-3">NISN</th>
                      <th className="px-5 py-3">Kelas</th>
                      <th className="px-5 py-3">Jurusan</th>
                      <th className="px-5 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedSiswa.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                          Tidak ada siswa untuk jurusan ini.
                        </td>
                      </tr>
                    ) : (
                      paginatedSiswa.map((siswa) => (
                        <tr key={siswa.id} className="transition hover:bg-slate-50/80">
                          <td className="px-5 py-4 font-semibold text-slate-800">{siswa.nama}</td>
                          <td className="px-5 py-4 text-slate-600">{siswa.nisn}</td>
                          <td className="px-5 py-4 text-slate-600">{siswa.kelas || "-"}</td>
                          <td className="px-5 py-4 text-slate-600">{siswa.jurusan || "-"}</td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => handleShowNilai(siswa)}
                              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                            >
                              Lihat Nilai
                            </button>
                          </td>
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
                  : `Menampilkan ${getStartNumber()} - ${getEndNumber()} dari ${filteredSiswa.length} data`}
              </p>
              <div className="flex items-center gap-2">
                <button
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

      {/* Modal nilai - diperbaiki dengan gaya biru gradasi */}
      {showModal && selectedSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header biru tua gradasi */}
            <div className="flex items-start justify-between bg-gradient-to-r from-[#0a1a3a] to-[#0f2a5f] px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Nilai {selectedSiswa.nama}
                </h3>
                <p className="mt-1 text-sm text-blue-100">
                  NISN {selectedSiswa.nisn} • {selectedSiswa.kelas || "-"} • {selectedSiswa.jurusan || "-"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-white/70 transition hover:bg-white/20 hover:text-white"
              >
                <Icon name="x" className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              {loadingNilai ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-blue-200 border-t-transparent border-r-blue-500 border-b-blue-600 border-l-blue-400"></div>
                  <p className="mt-4 text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Memuat nilai...
                  </p>
                </div>
              ) : semesterSummary.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-500">
                  Belum ada nilai kategori untuk siswa ini.
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-bold text-slate-800">Ringkasan Nilai Akademik per Semester</h4>
                    <p className="mt-1 text-sm text-slate-500">
                      Rata-rata nilai dihitung berdasarkan kategori akademik dari mata pelajaran yang ada di semester tersebut.
                    </p>
                  </div>
                  {semesterSummary.map((semesterItem) => (
                    <div key={semesterItem.semester} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="mb-4">
                        <h5 className="text-base font-bold text-blue-800">Semester {semesterItem.semester}</h5>
                        <p className="text-sm text-slate-500">Rata-rata nilai per kategori</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {ACADEMIC_CATEGORIES.map((category) => {
                          const item = semesterItem.kategori[category];
                          return (
                            <div
                              key={category}
                              className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm transition hover:shadow-md"
                            >
                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                {CATEGORY_LABEL[category]}
                              </p>
                              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                                {item?.rata_rata ?? "-"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">{item?.jumlah_mapel || 0} mapel</p>
                              {item?.mapel?.length > 0 && (
                                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                                  {item.mapel.join(", ")}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-4">
              <button
                onClick={closeModal}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-b-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70" />
    </div>
  );
}