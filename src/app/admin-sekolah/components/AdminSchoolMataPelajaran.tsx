"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/axios";
import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type MataPelajaran = {
  id_mapel: number;
  nama_mapel: string;
  tipe_mapel: "umum" | "jurusan";
  id_jurusan: number | null;
  semester: number | null;
  is_default: boolean;
  jurusan?: { id: number; nama: string } | null;
  nama_jurusan?: string;
};

type Jurusan = {
  id: number;
  nama: string;
};

type Props = {
  isSchoolApproved: boolean;
  onShowModal: (
    title: string,
    description: string,
    type?: "success" | "error"
  ) => void;
  jurusanRows: Jurusan[];
};

const ITEMS_PER_PAGE = 10;

const SEMESTER_OPTIONS = [
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
  { value: "3", label: "Semester 3" },
  { value: "4", label: "Semester 4" },
  { value: "5", label: "Semester 5" },
  { value: "6", label: "Semester 6" },
];

const DEFAULT_MAPEL_UMUM = `Bahasa Indonesia
Bahasa Daerah
Bahasa Inggris
Pendidikan Pancasila dan Kewarganegaraan
Pendidikan Agama
PJOK
Seni Budaya`;

function splitMapelInput(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, arr) => {
      return (
        arr.findIndex((x) => x.toLowerCase() === item.toLowerCase()) === index
      );
    });
}

function BookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

export function AdminSchoolMataPelajaran({
  isSchoolApproved,
  onShowModal,
  jurusanRows,
}: Props) {
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("semua");
  const [filterJurusan, setFilterJurusan] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);

  const [showDefaultMapelModal, setShowDefaultMapelModal] = useState(false);
  const [defaultMapelText, setDefaultMapelText] = useState(DEFAULT_MAPEL_UMUM);

  const [formData, setFormData] = useState({
    nama_mapel: "",
    semester: "",
    id_jurusan: "",
  });

  useEffect(() => {
    if (isSchoolApproved) {
      loadMataPelajaran();
    }
  }, [isSchoolApproved]);

  const allFilteredMapel = useMemo(() => {
    let filtered = [...mapelList];

    if (filterSemester !== "semua") {
      filtered = filtered.filter(
        (item) => item.semester === Number(filterSemester)
      );
    }

    if (filterJurusan !== "semua") {
      if (filterJurusan === "umum") {
        filtered = filtered.filter(
          (item) => item.tipe_mapel === "umum" || item.id_jurusan === null
        );
      } else {
        const jurusanId = Number(filterJurusan);

        filtered = filtered.filter(
          (item) =>
            item.tipe_mapel === "jurusan" && item.id_jurusan === jurusanId
        );
      }
    }

    if (searchTerm.trim()) {
      const keyword = searchTerm.trim().toLowerCase();

      filtered = filtered.filter((item) =>
        item.nama_mapel.toLowerCase().includes(keyword)
      );
    }

    return filtered.sort((a, b) => {
      const semesterA = a.semester ?? 99;
      const semesterB = b.semester ?? 99;

      if (semesterA !== semesterB) return semesterA - semesterB;

      const jurusanA = getJurusanLabel(a);
      const jurusanB = getJurusanLabel(b);

      if (jurusanA !== jurusanB) return jurusanA.localeCompare(jurusanB);

      return a.nama_mapel.localeCompare(b.nama_mapel);
    });
  }, [mapelList, filterSemester, filterJurusan, searchTerm, jurusanRows]);

  const totalPages = Math.max(
    1,
    Math.ceil(allFilteredMapel.length / ITEMS_PER_PAGE)
  );

  const paginatedMapel = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allFilteredMapel.slice(start, start + ITEMS_PER_PAGE);
  }, [allFilteredMapel, currentPage]);

  const parsedMapelNames = useMemo(() => {
    return splitMapelInput(formData.nama_mapel);
  }, [formData.nama_mapel]);

  const parsedDefaultMapelNames = useMemo(() => {
    return splitMapelInput(defaultMapelText);
  }, [defaultMapelText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterSemester, filterJurusan, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const isSemesterUmum =
    formData.semester === "1" || formData.semester === "2";

  const isSemesterJurusan =
    formData.semester === "3" ||
    formData.semester === "4" ||
    formData.semester === "5" ||
    formData.semester === "6";

  async function loadMataPelajaran(silent = false) {
    if (!silent) setLoading(true);

    try {
      const result = await apiFetch<{ data?: any[] }>(
        "/admin-sekolah/mata-pelajaran",
        {
          method: "GET",
        }
      );

      const mapped: MataPelajaran[] = (result.data || []).map((item: any) => ({
        id_mapel: item.id_mapel,
        nama_mapel: item.nama_mapel,
        tipe_mapel: item.tipe_mapel === "jurusan" ? "jurusan" : "umum",
        id_jurusan: item.id_jurusan ?? null,
        semester: item.semester ? Number(item.semester) : null,
        is_default: item.is_default === true || item.is_default === 1,
        jurusan: item.jurusan ?? null,
        nama_jurusan: item.jurusan?.nama || item.nama_jurusan,
      }));

      setMapelList(mapped);
    } catch (err) {
      onShowModal(
        "Gagal memuat data",
        err instanceof Error ? err.message : "Terjadi kesalahan",
        "error"
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }

  function resetMapelOnly() {
    setFormData((prev) => ({
      ...prev,
      nama_mapel: "",
    }));
  }

  function resetFormFull() {
    setFormData({
      nama_mapel: "",
      semester: "",
      id_jurusan: "",
    });
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData((prev) => ({
      ...prev,
      nama_mapel: "",
    }));
  }

  function handleInputChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;

    if (name === "semester") {
      const semesterIsUmum = value === "1" || value === "2";

      setFormData((prev) => ({
        ...prev,
        semester: value,
        id_jurusan: semesterIsUmum ? "" : prev.id_jurusan,
      }));

      return;
    }

    if (name === "id_jurusan") {
      setFormData((prev) => ({
        ...prev,
        id_jurusan: value,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function openEditForm(item: MataPelajaran) {
    if (item.is_default) {
      onShowModal(
        "Tidak dapat mengedit",
        "Mata pelajaran default tidak bisa diedit.",
        "error"
      );
      return;
    }

    setEditingId(item.id_mapel);

    setFormData({
      nama_mapel: item.nama_mapel,
      semester: item.semester ? String(item.semester) : "",
      id_jurusan: item.id_jurusan ? String(item.id_jurusan) : "",
    });
  }

  function validateForm() {
    if (!formData.semester) {
      onShowModal("Validasi", "Pilih semester terlebih dahulu.", "error");
      return false;
    }

    const semester = Number(formData.semester);

    if (![1, 2, 3, 4, 5, 6].includes(semester)) {
      onShowModal("Validasi", "Semester tidak valid.", "error");
      return false;
    }

    const isJurusan = [3, 4, 5, 6].includes(semester);

    if (isJurusan && !formData.id_jurusan) {
      onShowModal(
        "Validasi",
        "Untuk semester 3 sampai 6 wajib memilih jurusan.",
        "error"
      );
      return false;
    }

    if (editingId) {
      if (!formData.nama_mapel.trim()) {
        onShowModal("Validasi", "Nama mata pelajaran wajib diisi.", "error");
        return false;
      }
    } else if (parsedMapelNames.length === 0) {
      onShowModal(
        "Validasi",
        "Isi minimal satu mata pelajaran. Gunakan satu baris untuk satu mapel.",
        "error"
      );
      return false;
    }

    return true;
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    const semester = Number(formData.semester);
    const isUmum = semester === 1 || semester === 2;

    setSubmitting(true);

    try {
      if (editingId) {
        const payload = {
          nama_mapel: formData.nama_mapel.trim(),
          semester,
          tipe_mapel: isUmum ? "umum" : "jurusan",
          id_jurusan: isUmum ? null : Number(formData.id_jurusan),
        };

        await apiFetch(`/admin-sekolah/mata-pelajaran/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        onShowModal(
          "Berhasil",
          "Mata pelajaran berhasil diperbarui.",
          "success"
        );

        setEditingId(null);
        resetMapelOnly();
      } else {
        const payloads = parsedMapelNames.map((namaMapel) => ({
          nama_mapel: namaMapel,
          semester,
          tipe_mapel: isUmum ? "umum" : "jurusan",
          id_jurusan: isUmum ? null : Number(formData.id_jurusan),
        }));

        for (const payload of payloads) {
          await apiFetch("/admin-sekolah/mata-pelajaran", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }

        onShowModal(
          "Berhasil",
          `${payloads.length} mata pelajaran berhasil ditambahkan.`,
          "success"
        );

        resetMapelOnly();
      }

      await loadMataPelajaran(true);
    } catch (err) {
      onShowModal(
        "Gagal",
        err instanceof Error ? err.message : "Terjadi kesalahan",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function openDefaultMapelModal() {
    setDefaultMapelText((prev) => prev || DEFAULT_MAPEL_UMUM);
    setShowDefaultMapelModal(true);
  }

  async function generateMapelUmumDefault() {
    const mapelNames = splitMapelInput(defaultMapelText);

    if (mapelNames.length === 0) {
      onShowModal(
        "Validasi",
        "Isi minimal satu mata pelajaran umum terlebih dahulu.",
        "error"
      );
      return;
    }

    setSubmitting(true);

    try {
      const result = await apiFetch<{
        message?: string;
        created?: number;
        skipped?: number;
      }>("/admin-sekolah/mata-pelajaran/default-umum", {
        method: "POST",
        body: JSON.stringify({
          mapel_umum: mapelNames,
          semesters: [1, 2, 3, 4, 5, 6],
        }),
      });

      onShowModal(
        "Berhasil",
        result.message || "Mata pelajaran umum berhasil ditambahkan.",
        "success"
      );

      setShowDefaultMapelModal(false);
      await loadMataPelajaran(true);
    } catch (err) {
      onShowModal(
        "Gagal",
        err instanceof Error
          ? err.message
          : "Gagal menambahkan mata pelajaran umum.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(
    idMapel: number,
    nama: string,
    isDefault: boolean
  ) {
    if (isDefault) {
      onShowModal(
        "Tidak dapat menghapus",
        "Mata pelajaran default tidak bisa dihapus.",
        "error"
      );
      return;
    }

    if (!confirm(`Hapus mata pelajaran "${nama}"?`)) return;

    try {
      await apiFetch(`/admin-sekolah/mata-pelajaran/${idMapel}`, {
        method: "DELETE",
      });

      await loadMataPelajaran(true);

      onShowModal("Berhasil", "Mata pelajaran berhasil dihapus.", "success");
    } catch (err) {
      onShowModal(
        "Gagal",
        err instanceof Error ? err.message : "Terjadi kesalahan",
        "error"
      );
    }
  }

  function getJurusanLabel(item: MataPelajaran): string {
    if (item.semester === 1 || item.semester === 2) return "Tidak Menjuru";
    if (item.tipe_mapel === "umum") return "Umum";
    if (item.id_jurusan === null) return "Umum";

    const found = jurusanRows.find((j) => j.id === item.id_jurusan);

    if (found) return found.nama;
    if (item.nama_jurusan) return item.nama_jurusan;
    if (item.jurusan?.nama) return item.jurusan.nama;

    return "Umum";
  }

  function getSemesterLabel(semester: number | null) {
    if (!semester) return "-";
    return `Semester ${semester}`;
  }

  function getCurrentScopeText() {
    if (!formData.semester) {
      return "Pilih semester agar form input aktif.";
    }

    if (isSemesterUmum) {
      return `Mapel akan ditambahkan ke Semester ${formData.semester} sebagai mapel tidak menjuru.`;
    }

    const selectedJurusan = jurusanRows.find(
      (item) => String(item.id) === formData.id_jurusan
    );

    if (!selectedJurusan) {
      return `Semester ${formData.semester} membutuhkan jurusan. Pilih jurusan terlebih dahulu.`;
    }

    return `Mapel akan ditambahkan ke Semester ${formData.semester} jurusan ${selectedJurusan.nama}.`;
  }

  if (!isSchoolApproved) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white p-6 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-200">
          <InformationCircleIcon className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-black text-amber-800">Fitur terkunci</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-amber-700">
          Data mata pelajaran hanya dapat dikelola setelah sekolah disetujui.
        </p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
      <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-7 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
            <BookIcon />
            Mata Pelajaran
          </p>

          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
            Daftar Mata Pelajaran
          </h2>

          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
            Input banyak mapel sekaligus berdasarkan semester. Semester 1 dan 2
            tidak menjuru, sedangkan semester 3 sampai 6 berdasarkan jurusan.
          </p>
        </div>
      </div>

      <div className="space-y-6 p-5 md:p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                >
                  <option value="semua">Semua Semester</option>

                  {SEMESTER_OPTIONS.map((semester) => (
                    <option key={semester.value} value={semester.value}>
                      {semester.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filterJurusan}
                  onChange={(e) => setFilterJurusan(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                >
                  <option value="semua">Semua Jurusan</option>
                  <option value="umum">Umum / Tidak Menjuru</option>

                  {jurusanRows.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nama}
                    </option>
                  ))}
                </select>

                <div className="relative sm:col-span-2 lg:w-56">
                  <input
                    type="text"
                    placeholder="Cari mapel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />

                  <MagnifyingGlassIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="inline-flex w-fit items-center rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20">
                Total {allFilteredMapel.length} Data
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/50 to-blue-50/50 py-14 shadow-sm">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-100 border-t-sky-600" />
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Memuat data mata pelajaran...
                </p>
              </div>
            ) : allFilteredMapel.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-sky-200 bg-gradient-to-br from-white via-sky-50/50 to-blue-50/50 py-14 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  Tidak ada mata pelajaran yang sesuai.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/50">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-gradient-to-r from-sky-100 via-white to-blue-100 text-xs font-black uppercase tracking-[0.14em] text-sky-800">
                        <tr>
                          <th className="px-5 py-4">Nama Mata Pelajaran</th>
                          <th className="px-5 py-4">Semester</th>
                          <th className="px-5 py-4">Jurusan</th>
                          <th className="px-5 py-4 text-center">Aksi</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 bg-white">
                        {paginatedMapel.map((item) => {
                          const isDefault = item.is_default === true;
                          const jurusanLabel = getJurusanLabel(item);
                          const isTidakMenjuru =
                            item.semester === 1 || item.semester === 2;

                          return (
                            <tr
                              key={item.id_mapel}
                              className="transition hover:bg-sky-50/50"
                            >
                              <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-900">
                                {item.nama_mapel}

                                {isDefault && (
                                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                                    Default
                                  </span>
                                )}
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700">
                                {getSemesterLabel(item.semester)}
                              </td>

                              <td className="whitespace-nowrap px-5 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                                    isTidakMenjuru || jurusanLabel === "Umum"
                                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                      : "bg-sky-50 text-sky-700 ring-sky-200"
                                  }`}
                                >
                                  {jurusanLabel}
                                </span>
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-center">
                                {!isDefault ? (
                                  <div className="inline-flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => openEditForm(item)}
                                      className="grid h-9 w-9 place-items-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-100 hover:shadow-sm"
                                      title="Edit"
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDelete(
                                          item.id_mapel,
                                          item.nama_mapel,
                                          item.is_default
                                        )
                                      }
                                      className="grid h-9 w-9 place-items-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-sm"
                                      title="Hapus"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Menampilkan {paginatedMapel.length} dari{" "}
                    {allFilteredMapel.length} data
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Sebelumnya
                    </button>

                    <span className="rounded-xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, totalPages)
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-full">
            <div className="sticky top-5 rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/50 to-blue-50/50 p-5 shadow-sm shadow-sky-100/50">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-600">
                    Form Mapel
                  </p>
                  <h2 className="mt-1 text-lg font-black text-slate-900">
                    {editingId
                      ? "Edit Mata Pelajaran"
                      : "Input Cepat Mata Pelajaran"}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {editingId
                      ? "Ubah data mapel yang dipilih."
                      : "Pilih semester sekali, lalu masukkan banyak mapel sekaligus."}
                  </p>
                </div>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                    title="Batal edit"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              {!editingId && (
                <div className="mb-5 rounded-2xl border border-sky-100 bg-white/80 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700 ring-1 ring-sky-200">
                      <InformationCircleIcon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-black text-slate-800">
                        Ingin mengisi mapel umum?
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Buka panduan untuk menambahkan mapel umum semester 1
                        sampai 6 sekaligus. Kamu bisa mengubah daftar mapelnya
                        sebelum disimpan.
                      </p>

                      <button
                        type="button"
                        onClick={openDefaultMapelModal}
                        disabled={submitting}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Atur Mapel Umum
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={submitForm} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700">
                    Pilih Semester *
                  </label>

                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    required
                  >
                    <option value="">-- Pilih Semester --</option>

                    {SEMESTER_OPTIONS.map((semester) => (
                      <option key={semester.value} value={semester.value}>
                        {semester.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.semester && (
                  <div
                    className={`rounded-xl border p-3 ${
                      isSemesterUmum
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-sky-200 bg-sky-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <InformationCircleIcon
                        className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                          isSemesterUmum ? "text-emerald-500" : "text-sky-500"
                        }`}
                      />

                      <div
                        className={`text-sm ${
                          isSemesterUmum ? "text-emerald-800" : "text-sky-800"
                        }`}
                      >
                        <p className="font-bold">
                          {isSemesterUmum
                            ? "Semester 1 dan 2 Tidak Menjuru"
                            : "Semester 3 sampai 6 Menjuru"}
                        </p>

                        <p>{getCurrentScopeText()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {isSemesterJurusan && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700">
                      Pilih Jurusan *
                    </label>

                    <select
                      name="id_jurusan"
                      value={formData.id_jurusan}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                      required
                    >
                      <option value="">-- Pilih Jurusan --</option>

                      {jurusanRows.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700">
                    {editingId
                      ? "Nama Mata Pelajaran *"
                      : "Daftar Mata Pelajaran *"}
                  </label>

                  {editingId ? (
                    <input
                      type="text"
                      name="nama_mapel"
                      value={formData.nama_mapel}
                      onChange={handleInputChange}
                      placeholder="Contoh: Fisika"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                      required
                    />
                  ) : (
                    <>
                      <textarea
                        name="nama_mapel"
                        value={formData.nama_mapel}
                        onChange={handleInputChange}
                        placeholder={`Contoh:
Matematika
Fisika
Kimia`}
                        rows={8}
                        className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                        required
                      />

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Tulis satu mata pelajaran per baris. Bisa juga
                        dipisahkan dengan koma.
                      </p>
                    </>
                  )}
                </div>

                {!editingId && parsedMapelNames.length > 0 && (
                  <div className="rounded-xl border border-sky-100 bg-white/80 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-sky-600">
                      Preview Input
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {parsedMapelNames.slice(0, 8).map((name) => (
                        <span
                          key={name}
                          className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-sky-100"
                        >
                          {name}
                        </span>
                      ))}

                      {parsedMapelNames.length > 8 && (
                        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">
                          +{parsedMapelNames.length - 8} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  {editingId ? (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={submitting}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Batal Edit
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={resetFormFull}
                      disabled={submitting}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Reset
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {submitting
                      ? "Menyimpan..."
                      : editingId
                        ? "Update Mapel"
                        : `Tambah ${parsedMapelNames.length || ""} Mapel`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {showDefaultMapelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 py-6">
            <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-2xl shadow-slate-950/20">
              <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-5 text-slate-900">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.045)_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Atur Mata Pelajaran Umum
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Mapel umum akan ditambahkan otomatis ke semester 1 sampai 6.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDefaultMapelModal(false)}
                    className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800"
                    aria-label="Tutup modal"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="border-b border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/70 p-6 lg:border-b-0 lg:border-r">
                  <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100/50">
                    <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200">
                      <InformationCircleIcon className="h-6 w-6" />
                    </div>

                    <h4 className="text-base font-black text-slate-900">
                      Cara kerja fitur ini
                    </h4>

                    <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                      <div>
                        <p className="font-bold text-slate-800">
                          1. Isi daftar mapel umum
                        </p>
                        <p>
                          Tulis satu mata pelajaran per baris. Kamu bisa
                          mengubah, menambah, atau menghapus daftar mapel sesuai
                          kebutuhan sekolah.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-slate-800">
                          2. Sistem menambahkan ke semester 1–6
                        </p>
                        <p>
                          Mapel umum akan dibuat untuk semua semester tanpa
                          jurusan, sehingga tidak perlu input berulang.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-slate-800">
                          3. Data lama tidak dibuat dobel
                        </p>
                        <p>
                          Jika mapel dengan nama dan semester yang sama sudah
                          ada, sistem akan melewatinya.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                      Setelah mapel umum dibuat, kamu cukup menambahkan mapel
                      khusus jurusan seperti Fisika, Kimia, Ekonomi, Geografi,
                      dan lainnya.
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <label className="block text-sm font-bold text-slate-700">
                    Daftar Mata Pelajaran Umum
                  </label>

                  <textarea
                    value={defaultMapelText}
                    onChange={(e) => setDefaultMapelText(e.target.value)}
                    rows={13}
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    placeholder={`Contoh:
Bahasa Indonesia
Bahasa Inggris
Pendidikan Agama`}
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Tulis satu mata pelajaran per baris. Mapel ini akan dibuat
                    sebagai mapel umum untuk semester 1 sampai 6.
                  </p>

                  <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-sky-600">
                      Preview
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {parsedDefaultMapelNames.slice(0, 10).map((name) => (
                        <span
                          key={name}
                          className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-sky-100"
                        >
                          {name}
                        </span>
                      ))}

                      {parsedDefaultMapelNames.length > 10 && (
                        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">
                          +{parsedDefaultMapelNames.length - 10} lainnya
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDefaultMapelModal(false)}
                      disabled={submitting}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      onClick={generateMapelUmumDefault}
                      disabled={submitting}
                      className="rounded-xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Menambahkan..." : "Tambah Mapel Umum"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
