import { apiFetch } from "../../lib/axios";

export type AdminDashboardResponse = {
  stats: { schools: number; pendingSchools: number; teachers: number; students: number; majors?: number };
  activities: Array<{ title: string; text: string; tone: string }>;
};

export type VerificationRow = {
  id: number;
  school: string;
  level: string;
  city: string;
  status: string;
  address: string;
  phone: string;
};

export function getAdminDashboard() {
  return apiFetch<AdminDashboardResponse>("/admin/dashboard");
}

export function deleteSchool(id: number) {
  return apiFetch(`/admin/sekolah/${id}`, { method: "DELETE" });
}

export function getSchoolVerifications() {
  return apiFetch<VerificationRow[]>("/admin/verifikasi");
}

export function approveSchool(id: number) {
  return apiFetch<{ message: string }>(`/admin/verifikasi/${id}`, { method: "PUT" });
}

export type AdminSchoolRow = { id: number; name: string; level: string; status: string; address: string; phone: string };
export function getAdminSchools() {
  return apiFetch<AdminSchoolRow[]>("/admin/sekolah");
}
