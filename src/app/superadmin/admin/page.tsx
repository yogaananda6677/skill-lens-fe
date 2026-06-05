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

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((item) => item[0]?.toUpperCase())
      .join("") || "AD"
  );
}

function actionLabel(action: ActivityLog["action"]) {
  if (action === "create") return "Admin baru ditambahkan";
  if (action === "update") return "Data admin diperbarui";
  return "Admin dihapus";
}

function StatCard({
  title,
  value,
  desc,
  icon,
}: {
  title: string;
  value: string | number;
  desc: string;
  icon: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/60 to-blue-50/70 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.11)]">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0f2d5a] via-sky-500 to-cyan-300" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-sky-700">
            {title}
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
            {desc}
          </p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
          <Icon name={icon as any} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // jumlah admin per halaman

  const isEdit = useMemo(() => Boolean(form.id_user), [form.id_user]);

  // Filter admin berdasarkan search query
  const filteredAdmins = useMemo(() => {
    if (!searchQuery.trim()) return admins;
    const query = searchQuery.toLowerCase();
    return admins.filter(
      (admin) =>
        admin.nama.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query) ||
        admin.username.toLowerCase().includes(query)
    );
  }, [admins, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAdmins.slice(start, start + itemsPerPage);
  }, [filteredAdmins, currentPage, itemsPerPage]);

  // Reset ke halaman 1 ketika pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

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
      subtitle="Buat, edit, dan kelola akun administrator yang membantu proses verifikasi sekolah."
      userName="Admin Pusat"
      userLabel="Super Administrator"
      schoolName="Platform SkillLens"
    >
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Admin"
            value={loading ? "..." : admins.length}
            desc="Akun administrator terdaftar"
            icon="users"
          />
          <StatCard
            title="Aktivitas"
            value={activities.length}
            desc="Aktivitas terbaru sesi ini"
            icon="clock"
          />
          <StatCard
            title="Status Sistem"
            value="Aktif"
            desc="Modul admin siap digunakan"
            icon="chart"
          />
          <StatCard
            title="Akses"
            value="Pusat"
            desc="Level super administrator"
            icon="spark"
          />
        </div>

        {/* Notifikasi */}
        {(message || error) && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          {/* Daftar Admin */}
          <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
            <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                  Administrator
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                  Daftar Admin
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Kelola akun admin yang membantu verifikasi data sekolah.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon name="search" className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari admin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200"
                >
                  <Icon name="spark" className="h-4 w-4" />
                  Tambah Admin
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid min-h-[260px] place-items-center px-5 py-12 text-sm font-semibold text-slate-500">
                Memuat data admin...
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="grid min-h-[260px] place-items-center px-5 py-12 text-center">
                <div>
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700">
                    <Icon name="users" className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    {searchQuery ? "Tidak ada admin yang cocok." : "Belum ada admin yang dibuat."}
                  </p>
                  {!searchQuery && (
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition hover:bg-sky-700"
                    >
                      <Icon name="spark" className="h-4 w-4" />
                      Tambah Admin
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">
                  {paginatedAdmins.map((admin) => (
                    <article
                      key={admin.id_user}
                      className="group rounded-2xl border border-sky-200 bg-gradient-to-br from-white via-sky-50/80 to-blue-50/80 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md hover:shadow-sky-200/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sm font-black text-sky-700 ring-1 ring-sky-200/70">
                            {getInitials(admin.nama)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-slate-900">
                              {admin.nama}
                            </h3>
                            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-600/80">
                              {admin.role}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(admin)}
                            className="grid h-9 w-9 place-items-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-100 hover:shadow-sm"
                            title="Edit admin"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(admin)}
                            className="grid h-9 w-9 place-items-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-100 hover:shadow-sm"
                            title="Hapus admin"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 rounded-2xl bg-white/70 p-3 text-xs font-medium text-slate-600 ring-1 ring-sky-100">
                        <p className="flex items-center gap-2 truncate">
                          <Icon name="mail" className="h-3.5 w-3.5 text-sky-600" />
                          <span className="truncate">{admin.email}</span>
                        </p>
                        <p className="flex items-center gap-2 truncate">
                          <Icon name="user" className="h-3.5 w-3.5 text-sky-600" />
                          <span className="truncate">{admin.username}</span>
                        </p>
                        <p className="flex items-center gap-2 truncate">
                          <Icon name="phone" className="h-3.5 w-3.5 text-sky-600" />
                          <span className="truncate">{admin.no_hp || "Nomor HP belum diisi"}</span>
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-sky-100 px-5 py-4">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Sebelumnya
                    </button>
                    <div className="text-sm text-slate-600">
                      Halaman {currentPage} dari {totalPages}
                    </div>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Selanjutnya
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Sidebar Kanan */}
          <aside className="space-y-5">
            {/* Aktivitas Terbaru */}
            <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
              <div className="flex items-center justify-between border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                    <Icon name="clock" className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Aktivitas Terbaru
                    </h3>
                    <p className="text-xs font-medium text-slate-500">Sesi saat ini</p>
                  </div>
                </div>
                {activities.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActivities([])}
                    className="text-xs font-bold text-sky-600 transition hover:text-sky-800"
                  >
                    Bersihkan
                  </button>
                )}
              </div>

              {activities.length === 0 ? (
                <p className="px-5 py-8 text-center text-xs font-medium text-slate-400">
                  Belum ada aktivitas
                </p>
              ) : (
                <ul className="space-y-2 p-4">
                  {activities.map((act, idx) => (
                    <li key={act.id} className="flex gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-black ${
                          act.action === "create"
                            ? "bg-emerald-100 text-emerald-700"
                            : act.action === "update"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">
                          {actionLabel(act.action)}
                        </p>
                        <p className="truncate text-xs text-slate-500">{act.adminName}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {formatTimestamp(act.timestamp)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Tentang Admin */}
            <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/90 via-white to-blue-50/70 p-5 shadow-sm shadow-sky-100/60">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                  <Icon name="info" className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Tentang Admin</h3>
              </div>
              <p className="mt-3 text-xs font-medium leading-6 text-slate-600">
                Admin memiliki akses untuk memverifikasi data sekolah yang diajukan guru.
                Pastikan email dan username valid agar proses komunikasi dan pengelolaan data lebih mudah.
              </p>
            </section>
          </aside>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-2xl shadow-slate-950/20">
            <div className="relative overflow-hidden bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-6 py-5 text-white">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    {isEdit ? "Edit Admin" : "Tambah Admin"}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-sky-100/90">
                    {isEdit
                      ? "Perbarui data admin. Kosongkan password jika tidak ingin mengganti."
                      : "Buat akun admin baru untuk membantu verifikasi sekolah."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="grid h-9 w-9 place-items-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600">Nama lengkap</span>
                <input
                  value={form.nama}
                  onChange={(e) => handleChange("nama", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
                  placeholder="Contoh: Admin Pusat"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
                    placeholder="admin@skilllens.local"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600">Username</span>
                  <input
                    value={form.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
                    placeholder="adminpusat"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600">Nomor HP</span>
                  <input
                    value={form.no_hp}
                    onChange={(e) => handleChange("no_hp", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
                    placeholder="Opsional"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600">Password</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50"
                    placeholder={isEdit ? "Kosongkan jika tidak diganti" : "Minimal 6 karakter"}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  <Icon name="spark" className="h-4 w-4" />
                  {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Admin"}
                </button>
              </div>
            </form>

            {/* Footer copyright dalam modal */}
            <div className="border-t border-slate-200 px-6 pb-5 pt-4 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} SkillLens. All rights reserved.
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}