"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/axios";
import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
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

export function AdminSchoolMataPelajaran({
  isSchoolApproved,
  onShowModal,
  jurusanRows,
}: Props) {
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("semua");
  const [filterJurusan, setFilterJurusan] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);

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

      if (semesterA !== semesterB) {
        return semesterA - semesterB;
      }

      return a.nama_mapel.localeCompare(b.nama_mapel);
    });
  }, [mapelList, filterSemester, filterJurusan, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(allFilteredMapel.length / ITEMS_PER_PAGE)
  );

  const paginatedMapel = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allFilteredMapel.slice(start, start + ITEMS_PER_PAGE);
  }, [allFilteredMapel, currentPage]);

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
    formData.semester === "5";

  async function loadMataPelajaran(silent = false) {
    if (!silent) {
      setLoading(true);
    }

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
      if (!silent) {
        setLoading(false);
      }
    }
  }

  function resetForm() {
    setFormData({
      nama_mapel: "",
      semester: "",
      id_jurusan: "",
    });
    setEditingId(null);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function closeForm() {
    resetForm();
    setShowForm(false);
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    if (name === "semester") {
      setFormData((prev) => ({
        ...prev,
        semester: value,
        id_jurusan: value === "1" || value === "2" ? "" : prev.id_jurusan,
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
    setShowForm(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.nama_mapel.trim()) {
      onShowModal("Validasi", "Nama mata pelajaran wajib diisi.", "error");
      return;
    }

    if (!formData.semester) {
      onShowModal("Validasi", "Pilih semester terlebih dahulu.", "error");
      return;
    }

    const semester = Number(formData.semester);
    const isUmum = semester === 1 || semester === 2;
    const isJurusan = semester === 3 || semester === 4 || semester === 5;

    if (![1, 2, 3, 4, 5].includes(semester)) {
      onShowModal("Validasi", "Semester tidak valid.", "error");
      return;
    }

    if (isJurusan && !formData.id_jurusan) {
      onShowModal(
        "Validasi",
        "Untuk semester 3, 4, dan 5 wajib memilih jurusan.",
        "error"
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        nama_mapel: formData.nama_mapel.trim(),
        semester,
        tipe_mapel: isUmum ? "umum" : "jurusan",
        id_jurusan: isUmum ? null : Number(formData.id_jurusan),
      };

      if (editingId) {
        await apiFetch(`/admin-sekolah/mata-pelajaran/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/admin-sekolah/mata-pelajaran", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      closeForm();
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

    if (!confirm(`Hapus mata pelajaran "${nama}"?`)) {
      return;
    }

    try {
      await apiFetch(`/admin-sekolah/mata-pelajaran/${idMapel}`, {
        method: "DELETE",
      });

      await loadMataPelajaran(true);
    } catch (err) {
      onShowModal(
        "Gagal",
        err instanceof Error ? err.message : "Terjadi kesalahan",
        "error"
      );
    }
  }

  function getJurusanLabel(item: MataPelajaran): string {
    if (item.semester === 1 || item.semester === 2) {
      return "Tidak Menjuru";
    }

    if (item.tipe_mapel === "umum") {
      return "Umum";
    }

    if (item.id_jurusan === null) {
      return "Umum";
    }

    const found = jurusanRows.find((j) => j.id === item.id_jurusan);

    if (found) {
      return found.nama;
    }

    if (item.nama_jurusan) {
      return item.nama_jurusan;
    }

    if (item.jurusan?.nama) {
      return item.jurusan.nama;
    }

    return "Umum";
  }

  function getSemesterLabel(semester: number | null) {
    if (!semester) return "-";
    return `Semester ${semester}`;
  }

  if (!isSchoolApproved) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-amber-800">
          Fitur terkunci
        </h3>
        <p className="mt-2 text-amber-700">
          Data mata pelajaran hanya dapat dikelola setelah sekolah disetujui.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Daftar Mata Pelajaran
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Semester 1 dan 2 tidak menjuru, sedangkan semester 3 sampai 5
              berdasarkan jurusan.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="semua">Semua Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
            </select>

            <select
              value={filterJurusan}
              onChange={(e) => setFilterJurusan(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="semua">Semua Jurusan</option>
              <option value="umum">Umum / Tidak Menjuru</option>
              {jurusanRows.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama}
                </option>
              ))}
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              Memuat data mata pelajaran...
            </p>
          </div>
        ) : allFilteredMapel.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
            <p className="text-sm font-medium text-slate-500">
              Tidak ada mata pelajaran yang sesuai.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Nama Mata Pelajaran
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Semester
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Jurusan
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedMapel.map((item) => {
                    const isDefault = item.is_default === true;
                    const jurusanLabel = getJurusanLabel(item);
                    const isTidakMenjuru =
                      item.semester === 1 || item.semester === 2;

                    return (
                      <tr key={item.id_mapel} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                          {item.nama_mapel}
                          {isDefault && (
                            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              Default
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                          {getSemesterLabel(item.semester)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isTidakMenjuru || jurusanLabel === "Umum"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {jurusanLabel}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                          {!isDefault ? (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditForm(item)}
                                className="mr-2 rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
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
                                className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50 hover:text-red-800"
                                title="Hapus"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </>
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

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm font-medium text-slate-500">
                Menampilkan {paginatedMapel.length} dari{" "}
                {allFilteredMapel.length} data
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sebelumnya
                </button>

                <span className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="w-full lg:w-96">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pilih semester terlebih dahulu.
              </p>
            </div>

            {!showForm ? (
              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
                Baru
              </button>
            ) : (
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Pilih Semester *
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  required
                >
                  <option value="">-- Pilih Semester --</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Nama Mata Pelajaran *
                </label>
                <input
                  type="text"
                  name="nama_mapel"
                  value={formData.nama_mapel}
                  onChange={handleInputChange}
                  placeholder="Contoh: Fisika"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  required
                />
              </div>

              {formData.semester && (
                <div
                  className={`rounded-xl border p-3 ${
                    isSemesterUmum
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <InformationCircleIcon
                      className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                        isSemesterUmum ? "text-emerald-500" : "text-blue-500"
                      }`}
                    />

                    <div
                      className={`text-sm ${
                        isSemesterUmum ? "text-emerald-800" : "text-blue-800"
                      }`}
                    >
                      {isSemesterUmum ? (
                        <>
                          <p className="font-semibold">
                            Semester 1 dan 2 Tidak Menjuru
                          </p>
                          <p>
                            Mata pelajaran tidak perlu dikaitkan dengan jurusan.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold">
                            Semester 3, 4, dan 5 Menjuru
                          </p>
                          <p>
                            Mata pelajaran wajib dikaitkan dengan jurusan
                            tertentu.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isSemesterJurusan && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Pilih Jurusan *
                  </label>
                  <select
                    name="id_jurusan"
                    value={formData.id_jurusan}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
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

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>

        </div>
      </div>
    </div>
  );
}