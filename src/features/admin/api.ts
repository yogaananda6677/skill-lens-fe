import { apiFetch } from "../../lib/axios";

export type AdminDashboardResponse = {
  stats: { schools: number; pendingSchools: number; rejectedSchools?: number; teachers: number; students: number; majors?: number; roadmapCount?: number; roadmapStepLimit?: number };
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
  rejection_reason?: string | null;
  npsn?: string | null;
  email?: string | null;
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


export function rejectSchool(id: number, reason: string) {
  return apiFetch<{ message: string }>(`/admin/verifikasi/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
}

export function updateRoadmapCount(count: number) {
  return apiFetch<{ message: string; data: { recommendation_top_n: number } }>("/admin/settings/roadmap-count", {
    method: "PUT",
    body: JSON.stringify({ count }),
  });
}

export function updateRoadmapStepLimit(count: number) {
  return apiFetch<{ message: string; data: { roadmap_step_limit: number } }>("/admin/settings/roadmap-step-limit", {
    method: "PUT",
    body: JSON.stringify({ count }),
  });
}
