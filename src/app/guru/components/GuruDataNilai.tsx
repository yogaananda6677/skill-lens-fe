"use client";

import { useEffect, useMemo, useState } from "react";

import { Icon } from "../../../components/ui/icons";
import { apiFetch } from "../../../lib/axios";
import {
  getGuidanceCases,
  getGuruWorkspace,
  importExcelGrades,
  type GuidanceCase,
} from "../../../features/guru/api";

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
  id_kurikulum_mapel?: number;
  nama_mapel: string;
  nilai: number;
  semester: number;
  kategori: AcademicCategory | string;
  kategori_label?: string;
};

type NilaiResponse = {
  data?: NilaiItem[];
};

type NilaiBySiswa = Record<string, NilaiItem[]>;

const ITEMS_PER_PAGE = 10;
const SEMESTER_OPTIONS = ["1", "2", "3", "4", "5", "6"];

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeKey(value: unknown) {
  return normalizeText(value).replace(/\s+/g, " ");
}

function formatScore(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  const rounded = Number(Number(value).toFixed(2));
  return String(rounded);
}

function getSiswaId(siswa: GuidanceCase) {
  return String(siswa.studentId ?? "");
}

function getJurusanLabel(siswa: GuidanceCase) {
  return String((siswa as any).jurusan ?? "-").trim() || "-";
}

function getNilaiForMapel(rows: NilaiItem[], mapel: string) {
  const target = normalizeKey(mapel);
  return rows.find((item) => normalizeKey(item.nama_mapel) === target);
}

export function GuruDataNilai() {
  const [students, setStudents] = useState<GuidanceCase[]>([]);
  const [nilaiBySiswa, setNilaiBySiswa] = useState<NilaiBySiswa>({});
  const [workspace, setWorkspace] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("1");
  const [selectedJurusan, setSelectedJurusan] = useState("semua");
  const [selectedKelas, setSelectedKelas] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [tahunAjaran, setTahunAjaran] = useState("2025/2026");
  const [jurusanId, setJurusanId] = useState<string>("");
  const [dryRun, setDryRun] = useState(true);
  const [importing, setImporting] = useState(false);

  async function loadAllData() {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const [studentRows, workspaceResult] = await Promise.all([
        getGuidanceCases(),
        getGuruWorkspace().catch(() => null),
      ]);

      setStudents(studentRows);
      setWorkspace(workspaceResult);

      const pairs = await Promise.all(
        studentRows.map(async (student) => {
          try {
            const result = await apiFetch<NilaiResponse>(`/guru/siswa/${student.studentId}/nilai`, {
              method: "GET",
              alert: false,
            });
            return [String(student.studentId), result.data ?? []] as const;
          } catch {
            return [String(student.studentId), []] as const;
          }
        }),
      );

      setNilaiBySiswa(Object.fromEntries(pairs));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data nilai siswa.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSemester, selectedJurusan, selectedKelas]);

  const jurusanOptions = useMemo(() => {
    const map = new Map<string, string>();

    students.forEach((student) => {
      const label = getJurusanLabel(student);
      if (label !== "-") map.set(normalizeKey(label), label);
    });

    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [students]);

  const kelasOptions = useMemo(() => {
    const map = new Map<string, string>();

    students
      .filter((student) => {
        if (selectedJurusan === "semua") return true;
        return normalizeKey(getJurusanLabel(student)) === normalizeKey(selectedJurusan);
      })
      .forEach((student) => {
        const kelas = String(student.className ?? "").trim();
        if (kelas) map.set(normalizeKey(kelas), kelas);
      });

    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [selectedJurusan, students]);

  const filteredSiswa = useMemo(() => {
    const keyword = normalizeText(searchTerm);

    return students.filter((student) => {
      const matchSearch =
        !keyword ||
        normalizeText(student.studentName).includes(keyword) ||
        normalizeText((student as any).nisn).includes(keyword) ||
        normalizeText(student.className).includes(keyword) ||
        normalizeText(getJurusanLabel(student)).includes(keyword);

      const matchJurusan =
        selectedJurusan === "semua" ||
        normalizeKey(getJurusanLabel(student)) === normalizeKey(selectedJurusan);

      const matchKelas =
        selectedKelas === "semua" ||
        normalizeKey(student.className) === normalizeKey(selectedKelas);

      return matchSearch && matchJurusan && matchKelas;
    });
  }, [searchTerm, selectedJurusan, selectedKelas, students]);

  const mapelColumns = useMemo(() => {
    const semesterNumber = Number(selectedSemester);
    const unique = new Map<string, string>();

    filteredSiswa.forEach((student) => {
      const siswaId = getSiswaId(student);
      (nilaiBySiswa[siswaId] || [])
        .filter((item) => Number(item.semester) === semesterNumber)
        .forEach((item) => {
          const key = normalizeKey(item.nama_mapel);
          if (key && !unique.has(key)) unique.set(key, item.nama_mapel);
        });
    });

    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
  }, [filteredSiswa, nilaiBySiswa, selectedSemester]);

  const totalPages = Math.max(1, Math.ceil(filteredSiswa.length / ITEMS_PER_PAGE));
  const paginatedSiswa = filteredSiswa.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const startNumber = filteredSiswa.length ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const endNumber = Math.min(currentPage * ITEMS_PER_PAGE, filteredSiswa.length);

  async function handleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!file) {
      setError("Pilih file Excel nilai terlebih dahulu.");
      return;
    }

    const sekolahId = workspace?.sekolah?.id;
    if (!sekolahId) {
      setError("Sekolah guru belum aktif, tidak bisa import nilai.");
      return;
    }

    const jurusanRows = workspace?.jurusan || [];
    const selectedJurusanRow = jurusanRows.find((item: any) => String(item.id) === String(jurusanId));

    setImporting(true);
    try {
      const result = await importExcelGrades({
        file,
        dryRun,
        tahunAjaran,
        jenisSekolah: workspace?.sekolah?.jenis || "SMA",
        jurusan: selectedJurusanRow?.nama || "Umum",
        sekolahId,
        jurusanId: jurusanId || undefined,
      });

      setMessage(result.message || (dryRun ? "Preview import nilai berhasil." : "Import nilai berhasil diproses."));
      setFile(null);
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import nilai gagal diproses.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <section id="nilai" className="scroll-mt-28 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-blue-700">Data Nilai</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Kelola nilai siswa</h2>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
            Format tampilan dibuat seperti admin sekolah: pilih semester, filter jurusan/kelas, lalu lihat nilai murni per mata pelajaran.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAllData}
          disabled={isLoading}
          className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
        >
          Refresh Data
        </button>
      </div>

      {(message || error) && (
        <div className={`mt-5 rounded-2xl px-4 py-3 text-sm font-bold ${error ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"}`}>
          {error || message}
        </div>
      )}

      <form onSubmit={handleImport} className="mt-6 grid gap-3 rounded-3xl border border-blue-100 bg-blue-50/60 p-4 lg:grid-cols-[1.2fr_0.7fr_0.8fr_auto_auto] lg:items-end">
        <label className="block">
          <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.15em] text-blue-700">File Excel</span>
          <input type="file" accept=".xlsx,.xls" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.15em] text-blue-700">Tahun Ajaran</span>
          <input value={tahunAjaran} onChange={(event) => setTahunAjaran(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.15em] text-blue-700">Jurusan</span>
          <select value={jurusanId} onChange={(event) => setJurusanId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300">
            <option value="">Umum / otomatis</option>
            {(workspace?.jurusan || []).map((jurusan: any) => <option key={jurusan.id} value={jurusan.id}>{jurusan.nama}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-slate-600 ring-1 ring-slate-200">
          <input type="checkbox" checked={dryRun} onChange={(event) => setDryRun(event.target.checked)} />
          Preview
        </label>
        <button type="submit" disabled={importing} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:opacity-50">
          {importing ? "Memproses..." : dryRun ? "Preview" : "Import"}
        </button>
      </form>

      <div className="mt-6 rounded-[1.75rem] border border-slate-100 bg-slate-50/70 p-5">
        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-3 md:grid-cols-4">
            <input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Cari nama, NISN, kelas, jurusan..." className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50" />
            <select value={selectedSemester} onChange={(event) => setSelectedSemester(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50">
              {SEMESTER_OPTIONS.map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}
            </select>
            <select value={selectedJurusan} onChange={(event) => { setSelectedJurusan(event.target.value); setSelectedKelas("semua"); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50">
              <option value="semua">Semua jurusan</option>
              {jurusanOptions.map((jurusan) => <option key={jurusan} value={jurusan}>{jurusan}</option>)}
            </select>
            <select value={selectedKelas} onChange={(event) => setSelectedKelas(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50">
              <option value="semua">Semua kelas</option>
              {kelasOptions.map((kelas) => <option key={kelas} value={kelas}>{kelas}</option>)}
            </select>
          </div>

          <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            Total {filteredSiswa.length} siswa
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
          Semester {selectedSemester} menampilkan nilai murni per mata pelajaran. Guru BK dapat memakai filter jurusan dan kelas untuk mempercepat pengecekan.
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/70 py-14">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-3 text-sm font-medium text-slate-500">Memuat data siswa dan nilai...</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-blue-200 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800">
                    <tr>
                      <th className="sticky left-0 z-20 min-w-[220px] bg-blue-100 px-5 py-3">Nama Siswa</th>
                      <th className="min-w-[140px] px-5 py-3">NISN</th>
                      <th className="min-w-[110px] px-5 py-3">Kelas</th>
                      <th className="min-w-[140px] px-5 py-3">Jurusan</th>
                      {mapelColumns.map((mapel) => <th key={mapel} className="min-w-[150px] px-5 py-3 text-center">{mapel}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white/60">
                    {paginatedSiswa.length === 0 ? (
                      <tr><td colSpan={4 + mapelColumns.length} className="px-5 py-12 text-center text-slate-500">Tidak ada data nilai sesuai filter.</td></tr>
                    ) : mapelColumns.length === 0 ? (
                      <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-500">Belum ada mapel/nilai pada semester ini.</td></tr>
                    ) : (
                      paginatedSiswa.map((student) => {
                        const siswaId = getSiswaId(student);
                        const nilaiSemester = (nilaiBySiswa[siswaId] || []).filter((item) => Number(item.semester) === Number(selectedSemester));
                        return (
                          <tr key={siswaId} className="transition hover:bg-slate-50/90">
                            <td className="sticky left-0 z-10 min-w-[220px] bg-white px-5 py-4 font-semibold text-slate-800">{student.studentName}</td>
                            <td className="px-5 py-4 text-slate-600">{(student as any).nisn || "-"}</td>
                            <td className="px-5 py-4 text-slate-600">{student.className || "-"}</td>
                            <td className="px-5 py-4 text-slate-600">{getJurusanLabel(student)}</td>
                            {mapelColumns.map((mapel) => {
                              const nilai = getNilaiForMapel(nilaiSemester, mapel);
                              return (
                                <td key={mapel} className="px-5 py-4 text-center">
                                  {nilai ? <span className="inline-flex min-w-12 justify-center rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700 ring-1 ring-blue-100">{formatScore(nilai.nilai)}</span> : <span className="text-slate-300">-</span>}
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
                {filteredSiswa.length === 0 ? "Total 0 data" : `Menampilkan ${startNumber} - ${endNumber} dari ${filteredSiswa.length} siswa`}
              </p>
              <div className="flex items-center gap-2">
                <button type="button" disabled={currentPage <= 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">Sebelumnya</button>
                <span className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">{currentPage} / {totalPages}</span>
                <button type="button" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">Berikutnya</button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
