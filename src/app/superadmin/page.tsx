"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { superadminNav as navItems } from "@/config/navigation";
import { getStoredUser, redirectPathByRole } from "@/lib/auth";
import { getAdmins, AdminUser } from "@/features/superadmin/api";
import { Icon } from "@/components/ui/icons";

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
    <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/70 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.11)]">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
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

function getRoleLabel(role: string) {
  if (role === "admin") return "SkillLens Admin";
  if (role === "admin_sekolah") return "Admin Sekolah";
  return role;
}

export default function SuperadminDashboard() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== "superadmin") {
      router.replace(redirectPathByRole(user?.role));
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAdmins();
        setAdmins(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const totalSkilllensAdmin = useMemo(
    () => admins.filter((a) => (a.role as string) === "admin").length,
    [admins]
  );
  const totalSekolahAdmin = useMemo(
    () => admins.filter((a) => (a.role as string) === "admin_sekolah").length,
    [admins]
  );

  const sortedAdmins = useMemo(
    () => [...admins].sort((a, b) => b.id_user - a.id_user),
    [admins]
  );

  const totalPages = Math.ceil(sortedAdmins.length / itemsPerPage);
  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedAdmins.slice(start, start + itemsPerPage);
  }, [sortedAdmins, currentPage, itemsPerPage]);

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  return (
    <DashboardShell
      requiredRole="superadmin"
      activeKey="dashboard"
      navItems={navItems}
      title="Dashboard Super Admin"
      subtitle="Kelola akun administrator, pantau aktivitas platform, dan akses modul pengelolaan pusat."
      userName="Admin Pusat"
      userLabel="Super Administrator"
      schoolName="Platform SkillLens"
    >
      <div className="space-y-7">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <StatCard
            title="SkillLens Admin"
            value={loading ? "..." : totalSkilllensAdmin}
            desc="Administrator platform SkillLens"
            icon="users"
          />
          <StatCard
            title="Admin Sekolah"
            value={loading ? "..." : totalSekolahAdmin}
            desc="Administrator yang mengelola sekolah"
            icon="school"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
            <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                  Administrator
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                  Admin Terbaru
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Daftar 6 akun admin terbaru (SkillLens & Sekolah)
                </p>
              </div>
              <Link
                href="/superadmin/admin"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-100 hover:shadow-sm"
              >
                Lihat semua
                <span aria-hidden="true">›</span>
              </Link>
            </div>

            {loading ? (
              <div className="grid min-h-[290px] place-items-center px-5 py-12 text-sm font-semibold text-slate-500">
                Memuat data admin...
              </div>
            ) : paginatedAdmins.length === 0 ? (
              <div className="grid min-h-[290px] place-items-center px-5 py-12 text-center">
                <div>
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                    <Icon name="users" className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Belum ada admin yang dibuat.
                  </p>
                  <Link
                    href="/superadmin/kelola-admin"
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition hover:bg-sky-700"
                  >
                    <Icon name="spark" className="h-4 w-4" />
                    Tambah admin
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">
                  {paginatedAdmins.map((admin) => (
                    <article
                      key={admin.id_user}
                      className="group rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-white to-sky-50/70 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/70"
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
                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-600/80">
                              {getRoleLabel(admin.role)}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200/70">
                          Aktif
                        </span>
                      </div>
                      <div className="mt-4 space-y-2 rounded-2xl bg-slate-50/80 p-3 text-xs font-medium text-slate-600 ring-1 ring-slate-100">
                        <p className="flex items-center gap-2 truncate">
                          <Icon name="mail" className="h-3.5 w-3.5 text-sky-600" />
                          <span className="truncate">{admin.email}</span>
                        </p>
                        <p className="flex items-center gap-2 truncate">
                          <Icon name="user" className="h-3.5 w-3.5 text-sky-600" />
                          <span className="truncate">{admin.username}</span>
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

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

          <aside className="space-y-5">
            <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
              <div className="flex items-center gap-2 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-4">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                  <Icon name="info" className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Panduan Super Admin
                  </h3>
                  <p className="text-xs font-medium text-slate-500">
                    Langkah pengelolaan platform
                  </p>
                </div>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">
                    1
                  </div>
                  <p className="text-xs font-medium leading-6 text-slate-600">
                    <strong className="text-slate-800">Kelola Admin</strong> untuk membuat,
                    mengedit, atau menghapus akun administrator (SkillLens Admin & Admin Sekolah).
                  </p>
                </div>
                <div className="flex gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">
                    2
                  </div>
                  <p className="text-xs font-medium leading-6 text-slate-600">
                    Administrator sekolah (Admin Sekolah) meninjau dan memverifikasi sekolah yang diajukan.
                  </p>
                </div>
                <div className="flex gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">
                    3
                  </div>
                  <p className="text-xs font-medium leading-6 text-slate-600">
                    Setelah sekolah terverifikasi, guru dan siswa dapat menggunakan SkillLens.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/90 via-white to-blue-50/70 p-5 shadow-sm shadow-sky-100/60">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                  <Icon name="chart" className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Status Sistem</h3>
              </div>
              <p className="mt-3 text-xs font-medium leading-6 text-slate-600">
                Dashboard membaca data admin dari backend. Modul sekolah, guru, dan siswa dapat
                ditampilkan setelah endpoint dan tabel datanya dihubungkan.
              </p>
            </section>
          </aside>
        </div>

        <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} SkillLens. All rights reserved.
        </div>
      </div>
    </DashboardShell>
  );
}