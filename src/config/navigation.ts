import type { AuthRole } from "../lib/auth";
import type { DashboardNavItem } from "../components/layout/DashboardShell";

export const studentNav = [
  {
    key: "dashboard",
    label: "Beranda",
    description: "Ringkasan siswa",
    href: "/siswa",
    icon: "dashboard",
    roles: ["siswa"],
  },
  {
    key: "profil",
    label: "Profil",
    description: "Data diri & password",
    href: "/siswa/profil",
    icon: "profile",
    roles: ["siswa"],
  },
  {
    key: "rekomendasi",
    label: "Rekomendasi",
    description: "Hasil SPK",
    href: "/siswa/rekomendasi",
    icon: "sparkles",
    roles: ["siswa"],
  },
  {
    key: "roadmap",
    label: "Roadmap",
    description: "Rencana belajar",
    href: "/siswa/roadmap",
    icon: "map",
    roles: ["siswa"],
  },
] as const satisfies readonly DashboardNavItem[];

export const guruNav = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Ringkasan aktivitas",
    href: "/guru",
    icon: "dashboard",
    roles: ["guru"],
  },
  {
    key: "profil",
    label: "Profil",
    description: "Data diri & password",
    href: "/guru/profil",
    icon: "profile",
    roles: ["guru"],
  },
  {
    key: "progress",
    label: "Progress Siswa",
    description: "Pantau roadmap",
    href: "/guru#progress",
    icon: "progress",
    roles: ["guru"],
  },
  {
    key: "bimbingan",
    label: "Catatan Bimbingan",
    description: "Tindak lanjut",
    href: "/guru#bimbingan",
    icon: "guidance",
    roles: ["guru"],
  },
] as const satisfies readonly DashboardNavItem[];

export const adminSekolahNav = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Ringkasan awal",
    icon: "dashboard",
  },
  {
    key: "sekolah",
    label: "Data Sekolah",
    description: "Status pengajuan",
    icon: "school",
  },
  {
    key: "guru",
    label: "Data Guru",
    description: "Kelola guru",
    icon: "users",
  },
  {
    key: "jurusan",
    label: "Data Jurusan",
    description: "Kelola jurusan",
    icon: "graduation",
  },
  {
    key: "mata-pelajaran",
    label: "Mata Pelajaran",
    description: "Kelola mata pelajaran",
    icon: "book",
  },
  {
    key: "import-siswa",
    label: "Import Siswa",
    description: "Upload Excel siswa",
    icon: "upload",
  },
  {
    key: "siswa",
    label: "Data Siswa",
    description: "Kelola siswa",
    icon: "profile",
  },
  {
    key: "nilai",
    label: "Data Nilai",
    description: "Kelola nilai semester",
    icon: "chart",
  },
] as const satisfies readonly DashboardNavItem[];

export const adminNav = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Monitoring",
    href: "/admin/dashboard",
    icon: "dashboard",
    roles: ["admin", "superadmin"],
  },
  {
    key: "profil",
    label: "Profil",
    description: "Data diri & password",
    href: "/admin/profil",
    icon: "profile",
    roles: ["admin", "superadmin"],
  },
  {
    key: "verifikasi",
    label: "Verifikasi",
    description: "Sekolah & akun",
    href: "/admin/verifikasi",
    icon: "verify",
    roles: ["admin", "superadmin"],
  },
  {
    key: "sekolah",
    label: "Data Sekolah",
    description: "Master sekolah",
    href: "/admin/sekolah",
    icon: "school",
    roles: ["admin", "superadmin"],
  },
] as const satisfies readonly DashboardNavItem[];

export const superadminNav: DashboardNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/superadmin",
    icon: "dashboard",
  },
  {
    key: "kelola-admin",
    label: "Kelola Admin",
    href: "/superadmin/admin",
    icon: "users",
  },
];

export function dashboardHomeByRole(role?: AuthRole | string | null) {
  if (role === "superadmin") return "/superadmin/admin";
  if (role === "admin") return "/admin/dashboard";
  if (role === "admin_sekolah") return "/admin-sekolah";
  if (role === "guru") return "/guru";
  if (role === "siswa") return "/siswa";
  return "/auth/login";
}