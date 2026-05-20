"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { superadminNav as navItems } from "@/config/navigation";
import { getStoredUser, redirectPathByRole } from "@/lib/auth";
import {
  AdminUser,
  createAdmin,
  deleteAdmin,
  getAdmins,
  updateAdmin,
} from "@/features/superadmin/api";
import { Icon } from "@/components/ui/icons";

type FormState = {
  id_user?: number;
  nama: string;
  email: string;
  username: string;
  no_hp: string;
  password: string;
};

type ActivityLog = {
  id: string;
  action: "create" | "update" | "delete";
  adminName: string;
  timestamp: Date;
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
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const isEdit = useMemo(() => Boolean(form.id_user), [form.id_user]);

  function addActivityLog(action: "create" | "update" | "delete", adminName: string) {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      action,
      adminName,
      timestamp: new Date(),
    };
    setActivities((prev) => [newLog, ...prev].slice(0, 5));
  }

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
        addActivityLog("update", form.nama);
      } else {
        await createAdmin({
          nama: form.nama,
          email: form.email,
          username: form.username,
          no_hp: form.no_hp,
          password: form.password,
        });
        setMessage("Admin baru berhasil dibuat.");
        addActivityLog("create", form.nama);
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
      addActivityLog("delete", admin.nama);
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus admin");
    }
  }

  function formatTimestamp(date: Date) {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    }).format(date);
  }

  return (
    <DashboardShell
      requiredRole="superadmin"
      activeKey="kelola-admin"
      navItems={navItems}
      title="Kelola Admin"
      subtitle="Buat, edit, dan kelola akun administrator yang membantu verifikasi sekolah."
      userName="Admin Pusat"
      userLabel="Super Administrator"
      schoolName="Platform SkillLens"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bagian Kiri: Tabel Admin */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:shadow-lg hover:from-blue-700 hover:to-blue-800"
            >
              <Icon name="spark" className="h-4 w-4" />
              Tambah Admin
            </button>
          </div>

          {/* Kartu Tabel dengan gradasi biru di background */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
            <div className="overflow-x-auto rounded-xl bg-white">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800 border-b border-blue-200">
                  <tr>
                    <th className="px-5 py-3">No</th>
                    <th className="px-5 py-3">Nama</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Username</th>
                    <th className="px-5 py-3">Kontak</th>
                    <th className="px-5 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                        Memuat data admin...
                      </td>
                    </tr>
                  ) : admins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                        Belum ada admin yang dibuat.
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin, idx) => (
                      <tr key={admin.id_user} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3 text-sm text-slate-600">{idx + 1}</td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-800">{admin.nama}</p>
                          <p className="text-xs uppercase text-slate-400">{admin.role}</p>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{admin.email}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{admin.username}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{admin.no_hp || "-"}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(admin)}
                              className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:from-blue-600 hover:to-blue-700 hover:shadow"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(admin)}
                              className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:from-red-600 hover:to-red-700 hover:shadow"
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

        {/* Bagian Kanan: Kartu statistik, aktivitas, info */}
        <div className="space-y-5">
          {/* Total Admin */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 p-5 shadow-md border border-blue-100/60">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
                <Icon name="users" className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Admin</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-800">{admins.length}</p>
            <p className="text-xs text-slate-500">Akun administrator terdaftar</p>
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-60" />
          </div>

          {/* Aktivitas Terbaru */}
          <div className="rounded-xl bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 p-5 shadow-md border border-blue-100/60">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
                  <Icon name="clock" className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-blue-800">Aktivitas Terbaru</h3>
              </div>
              <button onClick={() => setActivities([])} className="text-xs text-blue-600 hover:text-blue-700">
                Bersihkan
              </button>
            </div>
            {activities.length === 0 ? (
              <p className="py-3 text-center text-xs text-slate-400">Belum ada aktivitas</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {activities.map((act) => (
                  <li key={act.id} className="text-xs border-b border-blue-100 pb-2 last:border-0">
                    <div className="flex items-start gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full mt-1 ${
                          act.action === "create"
                            ? "bg-green-500"
                            : act.action === "update"
                            ? "bg-blue-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-700">
                          {act.action === "create"
                            ? "Admin baru"
                            : act.action === "update"
                            ? "Admin diperbarui"
                            : "Admin dihapus"}
                        </p>
                        <p className="text-slate-500">{act.adminName}</p>
                        <p className="text-[10px] text-slate-400">{formatTimestamp(act.timestamp)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Info Card */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50/80 via-sky-50/30 to-white p-5 shadow-md border border-blue-200/60">
            <div className="flex items-center gap-2">
              <Icon name="info" className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-800">Tentang Admin</h3>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Admin memiliki akses untuk memverifikasi data sekolah yang diajukan guru. Pastikan email dan username valid untuk memudahkan komunikasi.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Tambah/Edit Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  {isEdit ? "Edit Admin" : "Tambah Admin"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isEdit
                    ? "Perbarui data admin. Kosongkan password jika tidak ingin mengganti."
                    : "Buat akun admin baru untuk membantu verifikasi sekolah."}
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
                <span className="text-sm font-medium text-slate-700">Nama lengkap</span>
                <input
                  value={form.nama}
                  onChange={(e) => handleChange("nama", e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  placeholder="Contoh: Admin Pusat"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    placeholder="admin@skilllens.local"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Username</span>
                  <input
                    value={form.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    placeholder="adminpusat"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Nomor HP</span>
                  <input
                    value={form.no_hp}
                    onChange={(e) => handleChange("no_hp", e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    placeholder="Opsional"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Password</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    placeholder={
                      isEdit ? "Kosongkan jika tidak diganti" : "Minimal 6 karakter"
                    }
                  />
                </label>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md disabled:opacity-60"
                >
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