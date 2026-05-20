import { apiFetch } from "../../lib/axios";
import type { AcademicScores, CareerRoadmap, PublishedRoadmap, Recommendation, RoadmapDetail, RoadmapStep, StudentProfileForm } from "./types";

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function firstDefined<T>(...values: T[]) {
  return values.find((value) => value !== undefined && value !== null && value !== "") as T | undefined;
}

export type SiswaMeResponse = {
  id_siswa: number;
  nisn: string;
  nama: string;
  email?: string;
  sekolah?: string | { id?: number; nama?: string; jenis_sekolah?: string; status?: string } | null;
  kelas: string;
  jurusan: string;
  id_jurusan?: number | null;
  minat?: string[];
  hobi?: string[];
  bakat?: string[];
  pengalaman?: string[];
  prestasi?: string[] | string;
  prestasi_text?: string;
  tujuan?: string;
  nilai_akademik?: AcademicScores;
};

export type SiswaProfilePayload = {
  minat: string[];
  hobi: string[];
  bakat: string[];
  pengalaman: string[];
  prestasi: string[];
  tujuan_karir: string;
  top_n?: number;
};

export async function getSiswaMe() {
  return apiFetch<SiswaMeResponse>("/siswa/me");
}

export async function saveSiswaProfile(payload: SiswaProfilePayload) {
  return apiFetch<{ message: string }>("/siswa/profil", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

function normalizeRecommendations(response: any) {
  const raw =
    response?.recommendations ??
    response?.data?.recommendations ??
    response?.data?.data ??
    response?.data ??
    [];

  const rows = Array.isArray(raw) ? raw : [];

  return rows.map((item: any, index: number) => ({
    id: item.id ?? item.id_rekomendasi ?? index + 1,
    title:
      item.title ??
      item.nama ??
      item.nama_rekomendasi ??
      item.nama_jurusan ??
      "Rekomendasi",
    category: item.category ?? item.kategori ?? item.tipe ?? "rekomendasi",
    score: Number(
      item.score ?? item.nilai ?? item.topsis_score ?? item.skor ?? 0,
    ),
    summary:
      item.summary ??
      item.deskripsi ??
      item.alasan ??
      "Rekomendasi berdasarkan nilai akademik dan profil siswa.",
    dominantFactors: Array.isArray(item.dominantFactors)
      ? item.dominantFactors
      : Array.isArray(item.faktor_dominan)
        ? item.faktor_dominan
        : typeof item.faktor_dominan === "string"
          ? item.faktor_dominan.split(",").map((value: string) => value.trim())
          : [],
    roadmapId:
      item.roadmapId ??
      item.id_roadmap ??
      item.roadmap?.id_roadmap ??
      item.roadmap?.id ??
      null,
    topsisRank: Number(
      item.topsisRank ?? item.rank ?? item.peringkat ?? index + 1,
    ),
  }));
}

export async function processSiswaSpk(payload: any) {
  const response = await apiFetch<any>("/siswa/spk", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    ...response,
    recommendations: normalizeRecommendations(response),
  };
}

export function toStudentProfile(data: any): StudentProfileForm {
  return {
    name: data?.nama ?? "",
    nisn: data?.nisn ?? "",
    school: data?.sekolah?.nama ?? data?.nama_sekolah ?? "",
    className: data?.kelas ?? "",
    major: data?.jurusan ?? "",
    academicScores: data?.nilai_akademik ?? {},

    interests: Array.isArray(data?.minat) ? data.minat : [],
    hobbies: Array.isArray(data?.hobi) ? data.hobi : [],
    talents: Array.isArray(data?.bakat) ? data.bakat : [],
    experiences: Array.isArray(data?.pengalaman) ? data.pengalaman : [],

    // PRESTASI DIAMBIL DARI DATABASE / TAG
    achievements: Array.isArray(data?.prestasi)
      ? data.prestasi.join(", ")
      : data?.prestasi_text ?? "",

    goal: data?.tujuan ?? data?.tujuan_karir ?? "kuliah",
    learningPreference: "",
    constraints: "",
  };
}
function normalizeRoadmapDetail(raw: any): RoadmapDetail {
  return {
    id: Number(firstDefined(raw?.id, raw?.id_detail, raw?.roadmap_step_detail_id, raw?.id_roadmap_step_detail, 0)),
    progressId: Number(firstDefined(raw?.progress_id, raw?.id_progress, raw?.student_progress_id, raw?.id, 0)) || undefined,
    title: String(firstDefined(raw?.title, raw?.judul, raw?.name, "Detail roadmap")),
    description: firstDefined(raw?.description, raw?.deskripsi, raw?.content, null) as string | null,
    referenceLink: firstDefined(raw?.reference_link, raw?.referenceLink, raw?.link, raw?.url, null) as string | null,
    status: String(firstDefined(raw?.status, raw?.progress_status, "belum")),
    completedAt: firstDefined(raw?.completed_at, raw?.completedAt, null) as string | null,
    notes: (raw?.notes ?? raw?.catatan ?? []).map?.((note: any) => ({
      id: Number(firstDefined(note?.id, note?.id_note, 0)),
      note: String(firstDefined(note?.note, note?.catatan, note?.text, "")),
      createdAt: firstDefined(note?.created_at, note?.createdAt, null) as string | null,
      guruName: firstDefined(note?.guru_name, note?.guruName, note?.guru?.nama, null) as string | null,
    })) ?? [],
  };
}

function normalizeRoadmapStep(raw: any, index: number): RoadmapStep {
  const details = raw?.details ?? raw?.detail ?? raw?.step_details ?? raw?.roadmap_step_details ?? [];
  return {
    id: Number(firstDefined(raw?.id, raw?.id_step, raw?.roadmap_step_id, 0)),
    title: String(firstDefined(raw?.title, raw?.judul, raw?.name, `Tahap ${index + 1}`)),
    description: firstDefined(raw?.description, raw?.deskripsi, null) as string | null,
    order: Number(firstDefined(raw?.step_order, raw?.order, index + 1)),
    details: Array.isArray(details) ? details.map(normalizeRoadmapDetail) : [],
  };
}

function normalizeActiveRoadmap(raw: any): CareerRoadmap | null {
  const data = raw?.data ?? raw?.roadmap ?? raw;
  if (!data) return null;
  const master = data?.master ?? data?.roadmap_master ?? data;
  const steps = data?.steps ?? master?.steps ?? data?.roadmap_steps ?? [];
  if (!Array.isArray(steps)) return null;
  return {
    id: Number(firstDefined(master?.id, master?.id_roadmap, data?.roadmap_id, data?.id_roadmap, 0)),
    studentRoadmapId: Number(firstDefined(data?.id, data?.id_student_roadmap, data?.student_roadmap_id, 0)) || undefined,
    headline: String(firstDefined(master?.title, master?.headline, master?.nama, "Roadmap Pengembangan Diri")),
    targetRole: String(firstDefined(master?.target_role, master?.targetRole, master?.category, "Target belajar")),
    description: firstDefined(master?.description, master?.deskripsi, null) as string | null,
    progress: Number(firstDefined(data?.progress, data?.progress_percentage, data?.percentage, 0)),
    steps: steps.map(normalizeRoadmapStep),
  };
}

export async function getPublishedRoadmaps(): Promise<PublishedRoadmap[]> {
  const response = await apiFetch<any>("/roadmaps/published");
  const rows = Array.isArray(response) ? response : response?.data ?? [];
  return rows.map((item: any) => ({
    id: Number(firstDefined(item?.id, item?.id_roadmap, 0)),
    title: String(firstDefined(item?.title, item?.headline, item?.nama, "Roadmap")),
    description: firstDefined(item?.description, item?.deskripsi, null) as string | null,
    category: firstDefined(item?.category, item?.kategori, null) as string | null,
  }));
}

export async function selectStudentRoadmap(roadmapId: number) {
  return apiFetch<{ message: string; data?: any }>("/roadmaps/student/select", {
    method: "POST",
    body: JSON.stringify({ roadmap_id: roadmapId, id_roadmap: roadmapId }),
  });
}

export async function getActiveStudentRoadmap() {
  const response = await apiFetch<any>("/roadmaps/student/active");
  return normalizeActiveRoadmap(response);
}

export async function updateStudentRoadmapProgress(progressId: number, status: "belum" | "proses" | "selesai") {
  return apiFetch<{ message: string; data?: any }>(`/roadmaps/student/progress/${progressId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
