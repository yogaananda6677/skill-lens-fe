"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { superadminNav as navItems } from "@/config/navigation";
import { Icon } from "@/components/ui/icons";

type School = {
  id: string;
  nama: string;
  jenjang: string;
  kontak: string;
  status: "Aktif" | "Tidak Aktif";
};

type SchoolForm = {
  id?: string;
  nama: string;
  jenjang: string;
  kontak: string;
  status: "Aktif" | "Tidak Aktif";
};

// Data dummy
let dummySchools: School[] = [
  { id: "1", nama: "SMA Negeri 1 Bandung", jenjang: "SMA", kontak: "022-4234567", status: "Aktif" },
  { id: "2", nama: "SMK Negeri 2 Surabaya", jenjang: "SMK", kontak: "031-5678901", status: "Aktif" },
  { id: "3", nama: "MA Al-Ikhsan", jenjang: "MA", kontak: "021-1234567", status: "Tidak Aktif" },
];

const emptyForm: SchoolForm = {
  nama: "",
  jenjang: "",
  kontak: "",
  status: "Aktif",
};

export default function DataSekolahPage() {
  const [schools, setSchools] = useState<School[]>(dummySchools);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<SchoolForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isEdit = !!form.id;

  const openCreateModal = () => {
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowModal(true);
  };

  const openEditModal = (school: School) => {
    setForm({
      id: school.id,
      nama: school.nama,
      jenjang: school.jenjang,
      kontak: school.kontak,
      status: school.status,
    });
    setError("");
    setMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (name: keyof SchoolForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.jenjang) {
      setError("Nama sekolah dan jenjang wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setTimeout(() => {
      if (isEdit && form.id) {
        // Update data
        dummySchools = dummySchools.map((s) =>
          s.id === form.id
            ? { ...s, nama: form.nama, jenjang: form.jenjang, kontak: form.kontak, status: form.status }
            : s
        );
        setMessage("Data sekolah berhasil diperbarui.");
      } else {
        // Tambah baru
        const newSchool: School = {
          id: Date.now().toString(),
          nama: form.nama,
          jenjang: form.jenjang,
          kontak: form.kontak,
          status: form.status,
        };
        dummySchools = [...dummySchools, newSchool];
        setMessage("Sekolah baru berhasil ditambahkan.");
      }
      setSchools([...dummySchools]);
      closeModal();
      setSaving(false);
    }, 500);
  };

  const handleDelete = (school: School) => {
    if (!confirm(`Hapus sekolah ${school.nama}?`)) return;
    dummySchools = dummySchools.filter((s) => s.id !== school.id);
    setSchools([...dummySchools]);
    setMessage("Sekolah berhasil dihapus.");
  };

  return (
    <DashboardShell
      requiredRole="superadmin"
      activeKey="sekolah"
      navItems={navItems}
      title="Data Sekolah"
      subtitle="Daftar sekolah"
      userName="Admin Pusat"
      userLabel="Super Administrator"
      schoolName="Platform SkillLens"
    >
      <div className="space-y-6">
        {/* Statistik ringkas */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 p-5 shadow-md border border-blue-100/60">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
              <Icon name="school" className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Sekolah</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-800">{schools.length}</p>
          <p className="text-xs text-slate-500">Daftar sekolah</p>
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-60" />
        </div>

        {/* Tombol Tambah Sekolah */}
        <div className="flex justify-end">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:shadow-lg"
          >
            <Icon name="spark" className="h-4 w-4" />
            Tambah Sekolah
          </button>
        </div>

        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}
        {error && !showModal && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Tabel Data Sekolah */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
          <div className="overflow-x-auto rounded-xl bg-white">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800 border-b border-blue-200">
                <tr>
                  <th className="px-5 py-3">No</th>
                  <th className="px-5 py-3">Sekolah</th>
                  <th className="px-5 py-3">Jenjang</th>
                  <th className="px-5 py-3">Kontak</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                      Belum ada sekolah.
                    </td>
                  </tr>
                ) : (
                  schools.map((school, idx) => (
                    <tr key={school.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3 text-sm text-slate-600">{idx + 1}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">{school.nama}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{school.jenjang}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{school.kontak || "-"}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            school.status === "Aktif"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {school.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(school)}
                            className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:shadow"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(school)}
                            className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:shadow"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-60 rounded-b-xl" />
        </div>
      </div>

      {/* Modal Tambah/Edit Sekolah */}
      {showModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  {isEdit ? "Edit Sekolah" : "Tambah Sekolah"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isEdit ? "Perbarui informasi sekolah." : "Masukkan data sekolah baru."}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nama Sekolah *</span>
                <input
                  value={form.nama}
                  onChange={(e) => handleChange("nama", e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="Contoh: SMA Negeri 1 Jakarta"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Jenjang *</span>
                <select
                  value={form.jenjang}
                  onChange={(e) => handleChange("jenjang", e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">Pilih jenjang</option>
                  <option value="SMA">SMA</option>
                  <option value="SMK">SMK</option>
                  <option value="MA">MA</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Kontak</span>
                <input
                  value={form.kontak}
                  onChange={(e) => handleChange("kontak", e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="No. Telepon"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Status</span>
                <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value as "Aktif" | "Tidak Aktif")}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </label>
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Sekolah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}