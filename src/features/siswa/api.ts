import { apiFetch, API_BASE_URL } from "../../lib/axios";
import type { AcademicScores, CareerRoadmap, PublishedRoadmap, Recommendation, RoadmapDetail, RoadmapStep, StudentProfileForm, StudentAchievement, StudentAcademicDetailResponse, StudentRoadmapHistoryItem, StudentSpkHistoryItem } from "./types";

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function firstDefined<T>(...values: T[]) {
  return values.find((value) => value !== undefined && value !== null && value !== "") as T | undefined;
}

function normalizeAssetUrl(value: unknown) {
  const url = String(value ?? "").trim();
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
  return url;
}
export type PrestasiSiswaResponse = {
  id?: number;
  id_prestasi?: number;
  nama_prestasi: string;
  tahun?: string | number | null;
  tingkat?: string | null;
  penyelenggara?: string | null;
  keterangan?: string | null;
  bukti_url?: string | null;
};


export type MasterTagOption = {
  id: number;
  tipe: "minat" | "bakat" | "hobi" | "pengalaman" | "prestasi" | string;
  label: string;
  mapped_key?: string;
  kategori_hint?: string | null;
  sort_order?: number;
};

export type MasterTagsGroupedResponse = Partial<Record<
  "minat" | "bakat" | "hobi" | "pengalaman" | "prestasi",
  MasterTagOption[]
>>;

function uniqueLabels(rows: unknown): string[] {
  if (!Array.isArray(rows)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const row of rows) {
    const label = String((row as any)?.label ?? row ?? "").trim();
    if (!label || seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    result.push(label);
  }

  return result;
}

export async function getMasterProfileOptions() {
  const response = await apiFetch<MasterTagsGroupedResponse>("/master-tags");

  return {
    interestOptions: uniqueLabels(response?.minat),
    hobbyOptions: uniqueLabels(response?.hobi),
    talentOptions: uniqueLabels(response?.bakat),
    experienceOptions: uniqueLabels(response?.pengalaman),
  };
}

export type SiswaMeResponse = {
  id_siswa: number;
  nisn: string;
  nama: string;
  email?: string;
  sekolah?:
    | string
    | { id?: number; nama?: string; jenis_sekolah?: string; status?: string }
    | null;
  kelas: string;
  jurusan: string;
  id_jurusan?: number | null;
  must_change_password?: boolean;
  minat?: string[];
  hobi?: string[];
  bakat?: string[];
  pengalaman?: string[];
  prestasi?: PrestasiSiswaResponse[] | string[] | string;
  prestasi_spk?: string[];
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

export async function getSiswaNilai() {
  return apiFetch<StudentAcademicDetailResponse>("/siswa/nilai", {
    method: "GET",
    alert: false,
  });
}

export type CreateStudentAchievementPayload = {
  nama_prestasi: string;
  tahun?: string | number | null;
  tingkat?: string | null;
  penyelenggara?: string | null;
  keterangan?: string | null;
  bukti_url?: string | null;
  bukti_file?: File | null;
};

export async function createStudentAchievement(payload: CreateStudentAchievementPayload) {
  const { bukti_file, ...jsonPayload } = payload;

  if (bukti_file) {
    const formData = new FormData();

    Object.entries(jsonPayload).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      formData.append(key, String(value));
    });

    formData.append("bukti_file", bukti_file);

    return apiFetch<{ message: string; data?: PrestasiSiswaResponse }>("/prestasi-siswa", {
      method: "POST",
      body: formData,
    });
  }

  return apiFetch<{ message: string; data?: PrestasiSiswaResponse }>("/prestasi-siswa", {
    method: "POST",
    body: JSON.stringify(jsonPayload),
  });
}

export async function deleteStudentAchievement(id: number) {
  return apiFetch<{ message: string }>(`/prestasi-siswa/${id}`, {
    method: "DELETE",
  });
}

export async function saveSiswaProfile(payload: SiswaProfilePayload) {
  return apiFetch<{ message: string }>("/siswa/profil", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

function normalizeReason(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "").trim()).filter(Boolean).join(" ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value ?? "").trim();
}

function normalizeRecommendations(response: any) {
  const raw =
    response?.recommendations ??
    response?.data?.recommendations ??
    response?.data?.data ??
    response?.data ??
    [];

  const rows = Array.isArray(raw) ? raw : [];

  return rows.map((item: any, index: number) => {
    const recommendationId = item.id ?? item.id_rekomendasi ?? index + 1;
    const alternativeId = Number(firstDefined(
      item.alternativeId,
      item.alternatifId,
      item.alternative_id,
      item.alternatif_id,
      item.id_alternatif,
      item.id_alternative,
      item.id_jurusan,
      item.jurusan_id,
      null,
    ));
    const roadmapId = Number(firstDefined(
      item.roadmapId,
      item.id_roadmap,
      item.roadmap_id,
      item.id_roadmap_master,
      item.roadmap?.id_roadmap,
      item.roadmap?.id,
      null,
    ));
    const reasonText = normalizeReason(firstDefined(
      item.alasan_ai,
      item.ai_reason,
      item.alasanPolished,
      item.alasan_polished,
      item.alasan,
      item.summary,
      item.deskripsi,
      item.description,
      "",
    ));
    const summary = reasonText || "Rekomendasi berdasarkan nilai akademik dan profil siswa.";

    return {
      id: recommendationId,
      alternativeId: Number.isFinite(alternativeId) && alternativeId > 0 ? alternativeId : undefined,
      title:
        item.title ??
        item.nama ??
        item.nama_rekomendasi ??
        item.nama_jurusan ??
        item.alternatif ??
        item.alternative_name ??
        "Rekomendasi",
      category: item.category ?? item.kategori ?? item.tipe ?? item.jenis ?? "rekomendasi",
      score: Number(
        item.score ?? item.nilai ?? item.topsis_score ?? item.skor ?? item.persentase_kecocokan ?? 0,
      ),
      summary,
      alasan: summary,
      reasons: Array.isArray(item.reasons) ? item.reasons : reasonText ? [summary] : [],
      fuzzyLabel: String(item.fuzzyLabel ?? item.fuzzy_label ?? item.label_fuzzy ?? ""),
      suggestedMajors: asArray(item.suggestedMajors ?? item.suggested_majors ?? item.saran_jurusan),
      criteria: item.criteria ?? item.kriteria ?? item.detailScore ?? item.detail_skor ?? {},
      dominantFactors: Array.isArray(item.dominantFactors)
        ? item.dominantFactors
        : Array.isArray(item.faktor_dominan)
          ? item.faktor_dominan
          : Array.isArray(item.tags_cocok)
            ? item.tags_cocok
            : typeof item.faktor_dominan === "string"
              ? item.faktor_dominan.split(",").map((value: string) => value.trim()).filter(Boolean)
              : [],
      roadmapId: Number.isFinite(roadmapId) && roadmapId > 0 ? roadmapId : null,
      topsisRank: Number(
        item.topsisRank ?? item.rank ?? item.peringkat ?? item.ranking ?? index + 1,
      ),
    };
  });
}

export async function processSiswaSpk(payload: any) {
  const response = await apiFetch<any>("/siswa/spk", {
    method: "POST",
    body: JSON.stringify(payload),
    alert: false,
  });

  return {
    ...response,
    recommendations: normalizeRecommendations(response),
  };
}

export function toStudentProfile(data: any): StudentProfileForm {
  const prestasiRows = normalizeStudentAchievements(data);

  const prestasiText = prestasiRows
    .map((item) =>
      [item.nama_prestasi, item.tingkat, item.tahun]
        .filter(Boolean)
        .join(" - "),
    )
    .join(", ");

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

    achievements: prestasiText || data?.prestasi_text || "",

    goal: data?.tujuan ?? data?.tujuan_karir ?? "kuliah",
    learningPreference: "",
    constraints: "",
  };
}
function normalizeRoadmapNote(note: any) {
  return {
    id: Number(firstDefined(note?.id, note?.id_roadmap_step_note, note?.id_note, 0)),
    title: firstDefined(note?.title, note?.judul, null) as string | null,
    note: String(firstDefined(note?.note, note?.catatan, note?.text, "")),
    followUp: firstDefined(note?.follow_up, note?.followUp, note?.tindak_lanjut, null) as string | null,
    createdAt: firstDefined(note?.created_at, note?.createdAt, null) as string | null,
    guruName: firstDefined(note?.guru_name, note?.guruName, note?.guru?.nama, note?.guru?.user?.nama, null) as string | null,
  };
}

function normalizeRoadmapDetail(raw: any): RoadmapDetail {
  const progress = raw?.progress ?? {};

  return {
    id: Number(firstDefined(raw?.id, raw?.id_detail, raw?.roadmap_step_detail_id, raw?.id_roadmap_step_detail, 0)),
    progressId: Number(firstDefined(
      progress?.id_student_roadmap_progress,
      raw?.progress_id,
      raw?.id_progress,
      raw?.student_progress_id,
      0,
    )) || undefined,
    title: String(firstDefined(raw?.title, raw?.judul, raw?.name, "Detail roadmap")),
    description: firstDefined(raw?.description, raw?.deskripsi, raw?.content, null) as string | null,
    referenceLink: firstDefined(raw?.reference_link, raw?.referenceLink, raw?.link, raw?.url, null) as string | null,
    status: String(firstDefined(progress?.status, raw?.status, raw?.progress_status, "belum")),
    completedAt: firstDefined(progress?.completed_at, raw?.completed_at, raw?.completedAt, null) as string | null,
    notes: (raw?.notes ?? raw?.catatan ?? []).map?.(normalizeRoadmapNote) ?? [],
  };
}

function normalizeRoadmapStep(raw: any, index: number): RoadmapStep {
  const details = raw?.details ?? raw?.detail ?? raw?.step_details ?? raw?.roadmap_step_details ?? [];
  return {
    id: Number(firstDefined(raw?.id, raw?.id_step, raw?.roadmap_step_id, raw?.id_roadmap_step, 0)),
    title: String(firstDefined(raw?.title, raw?.judul, raw?.name, `Tahap ${index + 1}`)),
    description: firstDefined(raw?.description, raw?.deskripsi, null) as string | null,
    order: Number(firstDefined(raw?.step_order, raw?.order, index + 1)),
    notes: (raw?.notes ?? raw?.catatan ?? raw?.step_notes ?? []).map?.(normalizeRoadmapNote) ?? [],
    details: Array.isArray(details) ? details.map(normalizeRoadmapDetail) : [],
  };
}

function normalizeActiveRoadmap(raw: any): CareerRoadmap | null {
  const data = raw?.data ?? raw;
  if (!data) return null;

  const master = data?.roadmap ?? data?.master ?? data?.roadmap_master ?? data;
  const steps = data?.steps ?? master?.steps ?? data?.roadmap_steps ?? [];

  if (!Array.isArray(steps)) return null;

  return {
    id: Number(firstDefined(master?.id, master?.id_roadmap, data?.roadmap_id, data?.id_roadmap, 0)),
    studentRoadmapId: Number(firstDefined(data?.id_student_roadmap, data?.id, data?.student_roadmap_id, 0)) || undefined,
    headline: String(firstDefined(master?.title, master?.headline, master?.nama, "Roadmap Pengembangan Diri")),
    targetRole: String(firstDefined(master?.recommended_for, master?.target_role, master?.targetRole, master?.category, "Target belajar")),
    description: firstDefined(master?.description, master?.deskripsi, null) as string | null,
    progress: Number(firstDefined(data?.progress_percent, data?.progress, data?.progress_percentage, data?.percentage, 0)),
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
    body: JSON.stringify({ id_roadmap: roadmapId }),
    alert: false,
  });
}

export async function getActiveStudentRoadmap() {
  const response = await apiFetch<any>("/roadmaps/student/active", {
    method: "GET",
    alert: false,
  });
  return normalizeActiveRoadmap(response);
}

function normalizeStudentRoadmapHistoryItem(raw: any): StudentRoadmapHistoryItem {
  return {
    id: Number(firstDefined(raw?.id, raw?.id_student_roadmap, raw?.student_roadmap_id, 0)),
    roadmapId: Number(firstDefined(raw?.roadmapId, raw?.id_roadmap, raw?.roadmap_id, raw?.roadmap?.id_roadmap, raw?.roadmap?.id, 0)),
    title: String(firstDefined(raw?.title, raw?.headline, raw?.roadmap?.title, raw?.roadmap?.headline, "Roadmap Pengembangan Diri")),
    targetRole: firstDefined(raw?.recommended_for, raw?.targetRole, raw?.target_role, raw?.roadmap?.recommended_for, null) as string | null,
    category: firstDefined(raw?.category, raw?.kategori, raw?.roadmap?.category, raw?.roadmap?.kategori, null) as string | null,
    status: String(firstDefined(raw?.status, "aktif")),
    progress: Number(firstDefined(raw?.progress, raw?.progress_percent, raw?.progress_percentage, raw?.percentage, 0)),
    totalDetail: Number(firstDefined(raw?.totalDetail, raw?.total_detail, raw?.total, 0)),
    completedDetail: Number(firstDefined(raw?.completedDetail, raw?.completed_detail, raw?.completed, 0)),
    inProgressDetail: Number(firstDefined(raw?.inProgressDetail, raw?.in_progress_detail, raw?.in_progress, 0)),
    startedAt: firstDefined(raw?.startedAt, raw?.started_at, null) as string | null,
    completedAt: firstDefined(raw?.completedAt, raw?.completed_at, null) as string | null,
    createdAt: firstDefined(raw?.createdAt, raw?.created_at, null) as string | null,
    updatedAt: firstDefined(raw?.updatedAt, raw?.updated_at, null) as string | null,
    isActive: Boolean(firstDefined(raw?.isActive, raw?.is_active, raw?.status === "aktif")),
  };
}

export async function getStudentRoadmapHistory(): Promise<StudentRoadmapHistoryItem[]> {
  const response = await apiFetch<any>("/roadmaps/student/history", {
    method: "GET",
    alert: false,
  });

  const rows = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.history)
        ? response.history
        : [];

  return rows.map(normalizeStudentRoadmapHistoryItem).filter((item) => item.id > 0);
}

function normalizeSelectedSpkRoadmap(raw: any) {
  if (!raw) return null;

  return {
    id: Number(firstDefined(raw?.id, raw?.id_student_roadmap, 0)),
    roadmapId: Number(firstDefined(raw?.roadmapId, raw?.id_roadmap, raw?.roadmap_id, 0)),
    title: String(firstDefined(raw?.title, raw?.recommended_for, raw?.roadmap?.recommended_for, "Roadmap dipilih")),
    roadmapTitle: firstDefined(raw?.roadmapTitle, raw?.roadmap_title, raw?.roadmap?.title, null) as string | null,
    category: firstDefined(raw?.category, raw?.kategori, raw?.roadmap?.category, null) as string | null,
    status: firstDefined(raw?.status, null) as string | null,
    selectedAt: firstDefined(raw?.selectedAt, raw?.selected_at, raw?.createdAt, raw?.created_at, null) as string | null,
  };
}

function normalizeStudentSpkHistoryItem(raw: any): StudentSpkHistoryItem {
  return {
    id: Number(firstDefined(raw?.id, raw?.id_recommendation_run, 0)),
    runCode: firstDefined(raw?.runCode, raw?.run_code, null) as string | null,
    tujuanKarir: firstDefined(raw?.tujuanKarir, raw?.tujuan_karir, null) as string | null,
    jenisSekolah: firstDefined(raw?.jenisSekolah, raw?.jenis_sekolah, null) as string | null,
    jurusanSekolah: firstDefined(raw?.jurusanSekolah, raw?.jurusan_sekolah, null) as string | null,
    createdAt: firstDefined(raw?.createdAt, raw?.created_at, null) as string | null,
    selected: normalizeSelectedSpkRoadmap(raw?.selected ?? raw?.selectedRoadmap ?? raw?.selected_roadmap),
    recommendations: normalizeRecommendations({ recommendations: raw?.recommendations ?? raw?.results ?? [] }),
  };
}

export async function getStudentSpkHistory(): Promise<StudentSpkHistoryItem[]> {
  const response = await apiFetch<any>("/siswa/spk/history", {
    method: "GET",
    alert: false,
  });

  const rows = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.history)
        ? response.history
        : [];

  return rows.map(normalizeStudentSpkHistoryItem).filter((item) => item.id > 0);
}

export async function updateStudentRoadmapProgress(progressId: number, status: "belum" | "proses" | "selesai") {
  return apiFetch<{ message: string; data?: any }>(`/roadmaps/student/progress/${progressId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    alert: false,
  });
}


export async function getLatestSiswaSpk() {
  const response = await apiFetch<any>("/siswa/spk/latest", {
    method: "GET",
  });

  return {
    ...response,
    recommendations: normalizeRecommendations(response),
  };
}


export function normalizeStudentAchievements(data: any): StudentAchievement[] {
  const rows = Array.isArray(data?.prestasi) ? data.prestasi : [];

  return rows
    .map((item: any, index: number) => {
      if (typeof item === "string") {
        return {
          id: index + 1,
          nama_prestasi: item,
          tahun: null,
          tingkat: null,
          penyelenggara: null,
          keterangan: null,
          bukti_url: null,
        };
      }

      return {
        id: Number(item?.id ?? item?.id_prestasi ?? index + 1),
        id_prestasi: Number(item?.id_prestasi ?? item?.id ?? index + 1),
        nama_prestasi: String(item?.nama_prestasi ?? item?.nama ?? "").trim(),
        tahun: item?.tahun ?? null,
        tingkat: item?.tingkat ?? null,
        penyelenggara: item?.penyelenggara ?? null,
        keterangan: item?.keterangan ?? null,
        bukti_url: normalizeAssetUrl(item?.bukti_url ?? item?.bukti),
      };
    })
    .filter((item: StudentAchievement) => item.nama_prestasi);
}