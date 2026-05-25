"use client";

import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../../../lib/axios";
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  InformationCircleIcon 
} from "@heroicons/react/24/outline";

type MataPelajaran = {
  id_mapel: number;
  nama_mapel: string;
  tipe_mapel: "umum" | "jurusan";
  id_jurusan: number | null;
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
  onShowModal: (title: string, description: string, type?: "success" | "error") => void;
  jurusanRows: Jurusan[];
};

export function AdminSchoolMataPelajaran({ isSchoolApproved, onShowModal, jurusanRows }: Props) {
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJurusan, setFilterJurusan] = useState<string>("semua");
  const [formData, setFormData] = useState({
    nama_mapel: "",
    id_jurusan: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isSchoolApproved) loadMataPelajaran();
  }, [isSchoolApproved]);

  async function loadMataPelajaran() {
    setLoading(true);
    try {
      const result = await apiFetch<{ data?: any[] }>("/admin-sekolah/mata-pelajaran", { method: "GET" });
      const mapped: MataPelajaran[] = (result.data || []).map((item: any) => ({
        id_mapel: item.id_mapel,
        nama_mapel: item.nama_mapel,
        tipe_mapel: item.tipe_mapel === "jurusan" ? "jurusan" : "umum",
        id_jurusan: item.id_jurusan ?? null,
        is_default: item.is_default === true || item.is_default === 1,
        jurusan: item.jurusan,
        nama_jurusan: item.jurusan?.nama || item.nama_jurusan,
      }));
      setMapelList(mapped);
    } catch (err) {
      onShowModal("Gagal memuat data", err instanceof Error ? err.message : "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  }

  const filteredMapel = useMemo(() => {
    let filtered = [...mapelList];
    
    if (filterJurusan !== "semua") {
      if (filterJurusan === "umum") {
        filtered = filtered.filter(item => item.tipe_mapel === "umum");
      } else {
        const jurusanId = Number(filterJurusan);
        filtered = filtered.filter(item => 
          item.tipe_mapel === "jurusan" && item.id_jurusan === jurusanId
        );
      }
    }
    
    if (searchTerm.trim()) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.nama_mapel.toLowerCase().includes(keyword)
      );
    }
    
    return filtered;
  }, [mapelList, filterJurusan, searchTerm]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function openCreateForm() {
    setEditingId(null);
    setFormData({ nama_mapel: "", id_jurusan: "" });
    setShowForm(true);
  }

  function openEditForm(item: MataPelajaran) {
    if (item.is_default) {
      onShowModal("Tidak dapat mengedit", "Mata pelajaran default tidak bisa diedit.", "error");
      return;
    }
    setEditingId(item.id_mapel);
    setFormData({
      nama_mapel: item.nama_mapel,
      id_jurusan: item.id_jurusan ? String(item.id_jurusan) : "",
    });
    setShowForm(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.nama_mapel.trim()) {
      onShowModal("Validasi", "Nama mata pelajaran wajib diisi", "error");
      return;
    }
    if (!formData.id_jurusan) {
      onShowModal("Validasi", "Pilih jurusan terlebih dahulu", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nama_mapel: formData.nama_mapel.trim(),
        tipe_mapel: "jurusan",
        id_jurusan: Number(formData.id_jurusan),
      };

      if (editingId) {
        await apiFetch(`/admin-sekolah/mata-pelajaran/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        onShowModal("Berhasil", "Mata pelajaran diperbarui");
      } else {
        await apiFetch("/admin-sekolah/mata-pelajaran", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        onShowModal("Berhasil", "Mata pelajaran ditambahkan");
      }
      setShowForm(false);
      await loadMataPelajaran();
    } catch (err) {
      onShowModal("Gagal", err instanceof Error ? err.message : "Terjadi kesalahan", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id_mapel: number, nama: string, isDefault: boolean) {
    if (isDefault) {
      onShowModal("Tidak dapat menghapus", "Mata pelajaran default tidak bisa dihapus.", "error");
      return;
    }
    if (!confirm(`Hapus mata pelajaran "${nama}"?`)) return;
    try {
      await apiFetch(`/admin-sekolah/mata-pelajaran/${id_mapel}`, { method: "DELETE" });
      onShowModal("Berhasil", "Mata pelajaran dihapus");
      await loadMataPelajaran();
    } catch (err) {
      onShowModal("Gagal", err instanceof Error ? err.message : "Terjadi kesalahan", "error");
    }
  }

  // Fungsi untuk menampilkan label jurusan dengan benar
  function getJurusanLabel(item: MataPelajaran): string {
    if (item.tipe_mapel === "umum") return "Umum";
    if (item.id_jurusan === null) return "Umum";
    // Cari nama jurusan dari data jurusanRows (paling akurat)
    const found = jurusanRows.find(j => j.id === item.id_jurusan);
    if (found) return found.nama;
    // Fallback dari API
    if (item.nama_jurusan) return item.nama_jurusan;
    if (item.jurusan?.nama) return item.jurusan.nama;
    return "Umum";
  }

  if (!isSchoolApproved) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-amber-800">Fitur terkunci</h3>
        <p className="mt-2 text-amber-700">Data mata pelajaran hanya dapat dikelola setelah sekolah disetujui.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* KIRI: Daftar Mata Pelajaran */}
      <div className="flex-1 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Daftar Mata Pelajaran</h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterJurusan}
              onChange={(e) => setFilterJurusan(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="semua">Semua Jurusan</option>
              <option value="umum">Umum</option>
              {jurusanRows.map((j) => (
                <option key={j.id} value={j.id}>{j.nama}</option>
              ))}
            </select>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredMapel.length === 0 ? (
          <div className="py-8 text-center text-slate-500">Tidak ada mata pelajaran yang sesuai.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Nama Mata Pelajaran</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Jurusan</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMapel.map((item) => {
                  const isDefault = item.is_default === true;
                  const jurusanLabel = getJurusanLabel(item);
                  return (
                    <tr key={item.id_mapel} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                        {item.nama_mapel}
                        {isDefault && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Default</span>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          jurusanLabel === "Umum" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {jurusanLabel}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                        {!isDefault && (
                          <>
                            <button
                              onClick={() => openEditForm(item)}
                              className="mr-2 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <PencilIcon className="inline h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id_mapel, item.nama_mapel, item.is_default)}
                              className="text-red-600 hover:text-red-800"
                              title="Hapus"
                            >
                              <TrashIcon className="inline h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* KANAN: Form Tambah/Edit */}
      <div className="w-full lg:w-96">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              {editingId ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
            </h2>
            {!showForm && !editingId && (
              <button
                onClick={openCreateForm}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
                Baru
              </button>
            )}
            {(showForm || editingId) && (
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {!showForm && !editingId ? (
            <div className="py-8 text-center text-slate-500">
              <p>Klik tombol "Baru" untuk menambah mata pelajaran khusus jurusan.</p>
            </div>
          ) : (
            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  name="nama_mapel"
                  value={formData.nama_mapel}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
                <div className="flex items-start gap-2">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Khusus Jurusan</p>
                    <p className="text-blue-700">Mata pelajaran umum (Bahasa Indonesia, Inggris, dll) sudah tersedia dari sistem dan tidak perlu ditambahkan.</p>
                  </div>
                </div>
              </div>
              <input type="hidden" name="tipe_mapel" value="jurusan" />

              <div>
                <label className="block text-sm font-medium text-slate-700">Pilih Jurusan *</label>
                <select
                  name="id_jurusan"
                  value={formData.id_jurusan}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                >
                  <option value="">-- Pilih Jurusan --</option>
                  {jurusanRows.map((j) => (
                    <option key={j.id} value={j.id}>{j.nama}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}