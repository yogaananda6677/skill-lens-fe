"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { superadminNav as navItems } from "../../../config/navigation";
import { getStoredUser, redirectPathByRole } from "../../../lib/auth";
import {
  AdminUser,
  createAdmin,
  deleteAdmin,
  getAdmins,
  updateAdmin,
} from "../../../features/superadmin/api";

type FormState = {
  id_user?: number;
  nama: string;
  email: string;
  username: string;
  no_hp: string;
  password: string;
};


const emptyForm: FormState = {
  nama: "",
  email: "",
  username: "",
  no_hp: "",
  password: "",
};

export default function KelolaAdminPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isEdit = useMemo(() => Boolean(form.id_user), [form.id_user]);

  async function loadAdmins() {
    try {
      setLoading(true);
      setError("");
      const data = await getAdmins();
      setAdmins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data admin");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== "superadmin") {
      router.replace(redirectPathByRole(user?.role));
      return;
    }
    loadAdmins();
  }, [router]);

  function openCreateModal() {
    setForm(emptyForm);
    setError("");
    setMessage("");
    setIsModalOpen(true);
  }

  function openEditModal(admin: AdminUser) {
    setMessage("");
    setError("");
    setForm({
      id_user: admin.id_user,
      nama: admin.nama,
      email: admin.email,
      username: admin.username,
      no_hp: admin.no_hp || "",
      password: "",
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setForm(emptyForm);
    setError("");
  }

  function handleChange(name: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.nama || !form.email || !form.username) {
      setError("Nama, email, dan username wajib diisi.");
      return;
    }

    if (!isEdit && !form.password) {
      setError("Password wajib diisi saat membuat admin baru.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (isEdit && form.id_user) {
        await updateAdmin(form.id_user, {
          nama: form.nama,
          email: form.email,
          username: form.username,
          no_hp: form.no_hp,
          ...(form.password ? { password: form.password } : {}),
        });
        setMessage("Data admin berhasil diperbarui.");
      } else {
        await createAdmin({
          nama: form.nama,
          email: form.email,
          username: form.username,
          no_hp: form.no_hp,
          password: form.password,
        });
        setMessage("Admin baru berhasil dibuat.");
      }

      closeModal();
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data admin");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(admin: AdminUser) {
    const confirmed = confirm(`Hapus admin ${admin.nama}?`);
    if (!confirmed) return;

    try {
      setError("");
      setMessage("");
      await deleteAdmin(admin.id_user);
      setMessage("Admin berhasil dihapus.");
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus admin");
    }
  }

  return (
    <DashboardShell
      requiredRole="superadmin"
      activeKey="admin"
      navItems={navItems}
      title="Kelola Admin"
      subtitle="Buat, edit, dan pantau akun administrator yang membantu proses verifikasi sekolah."
      userName="Superadmin"
      userLabel="Superadmin"
      schoolName="Platform SkillLens"
      rightSlot={
        <button onClick={openCreateModal} className="hidden rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 md:inline-flex">
          Tambah Admin
        </button>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-normal text-slate-500">Total Admin</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{admins.length}</p>
            <p className="mt-1 text-sm font-normal text-slate-500">Akun admin terdaftar</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-normal text-slate-500">Hak Akses</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Admin</p>
            <p className="mt-1 text-sm font-normal text-slate-500">Verifikasi sekolah</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-normal text-slate-500">Status</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-emerald-600">Aktif</p>
            <p className="mt-1 text-sm font-normal text-slate-500">Terhubung ke backend</p>
          </div>
        </section>

        {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">{message}</div>}
        {error && !isModalOpen && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</div>}

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">Daftar Admin</h2>
              <p className="mt-1 text-sm font-normal text-slate-500">Admin memiliki akses untuk memverifikasi data sekolah yang diajukan guru.</p>
            </div>

            <button onClick={openCreateModal} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
              Tambah Admin
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Kontak</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-normal text-slate-500">Memuat data admin...</td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-normal text-slate-500">Belum ada admin yang dibuat.</td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id_user} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-950">{admin.nama}</p>
                        <p className="mt-1 text-xs font-normal uppercase text-slate-400">{admin.role}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-normal text-slate-700">{admin.username}</td>
                      <td className="px-6 py-4 text-sm font-normal text-slate-600">{admin.email}</td>
                      <td className="px-6 py-4 text-sm font-normal text-slate-600">{admin.no_hp || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(admin)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">Edit</button>
                          <button onClick={() => handleDelete(admin)} className="rounded-xl bg-red-50 px-4 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{isEdit ? "Edit Admin" : "Tambah Admin"}</h2>
                <p className="mt-1 text-sm font-normal text-slate-500">{isEdit ? "Perbarui data admin. Kosongkan password jika tidak ingin mengganti." : "Buat akun admin baru untuk membantu verifikasi sekolah."}</p>
              </div>
              <button onClick={closeModal} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200">Tutup</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nama lengkap</span>
                <input value={form.nama} onChange={(e) => handleChange("nama", e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50" placeholder="Contoh: Admin Pusat" />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50" placeholder="admin@skilllens.local" />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Username</span>
                  <input value={form.username} onChange={(e) => handleChange("username", e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50" placeholder="adminpusat" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Nomor HP</span>
                  <input value={form.no_hp} onChange={(e) => handleChange("no_hp", e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50" placeholder="Opsional" />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Password</span>
                  <input type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50" placeholder={isEdit ? "Kosongkan jika tidak diganti" : "Minimal 6 karakter"} />
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button type="button" onClick={closeModal} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Batal</button>
                <button disabled={saving} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
                  {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
