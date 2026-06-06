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

export type AdminSchoolRow = { id: number; name: string; npsn?: string | null; level: string; status: string; address: string; phone: string };
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

export type RoadmapTargetType = "kuliah" | "kerja" | "wirausaha" | "umum";

export type RoadmapStepDetailRow = {
  id_roadmap_step_detail: number;
  id_roadmap_step: number;
  title: string;
  description?: string | null;
  reference_link?: string | null;
  reference_type?: string | null;
  detail_order: number;
  is_active?: number | boolean;
};

export type RoadmapStepRow = {
  id_roadmap_step: number;
  id_roadmap: number;
  title: string;
  description?: string | null;
  step_order: number;
  estimated_duration?: string | null;
  output_target?: string | null;
  is_active?: number | boolean;
  details?: RoadmapStepDetailRow[];
};

export type RoadmapMasterRow = {
  id_roadmap: number;
  title: string;
  description?: string | null;
  category?: string | null;
  target_type: RoadmapTargetType;
  recommended_for?: string | null;
  is_active?: number | boolean;
  steps?: RoadmapStepRow[];
};

export type RoadmapMasterPayload = {
  title: string;
  description?: string | null;
  category?: string | null;
  target_type?: RoadmapTargetType;
  recommended_for?: string | null;
  is_active?: boolean;
};

export type RoadmapStepPayload = {
  id_roadmap: number;
  title: string;
  description?: string | null;
  step_order?: number;
  estimated_duration?: string | null;
  output_target?: string | null;
  is_active?: boolean;
};

export type RoadmapStepDetailPayload = {
  id_roadmap_step: number;
  title: string;
  description?: string | null;
  reference_link?: string | null;
  reference_type?: string | null;
  detail_order?: number;
  is_active?: boolean;
};

export function getRoadmapMasters() {
  return apiFetch<RoadmapMasterRow[]>("/roadmap-master", { method: "GET" });
}

export function createRoadmapMaster(payload: RoadmapMasterPayload) {
  return apiFetch<RoadmapMasterRow>("/roadmap-master", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateRoadmapMaster(id: number, payload: Partial<RoadmapMasterPayload>) {
  return apiFetch<RoadmapMasterRow>(`/roadmap-master/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteRoadmapMaster(id: number) {
  return apiFetch<{ message: string }>(`/roadmap-master/${id}`, { method: "DELETE" });
}

export function createRoadmapStep(payload: RoadmapStepPayload) {
  return apiFetch<RoadmapStepRow>("/roadmap-step", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateRoadmapStep(id: number, payload: Partial<RoadmapStepPayload>) {
  return apiFetch<RoadmapStepRow>(`/roadmap-step/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteRoadmapStep(id: number) {
  return apiFetch<{ message: string }>(`/roadmap-step/${id}`, { method: "DELETE" });
}

export function createRoadmapStepDetail(payload: RoadmapStepDetailPayload) {
  return apiFetch<RoadmapStepDetailRow>("/roadmap-step-detail", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateRoadmapStepDetail(id: number, payload: Partial<RoadmapStepDetailPayload>) {
  return apiFetch<RoadmapStepDetailRow>(`/roadmap-step-detail/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteRoadmapStepDetail(id: number) {
  return apiFetch<{ message: string }>(`/roadmap-step-detail/${id}`, { method: "DELETE" });
}
