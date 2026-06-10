"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Icon } from "@/components/ui/icons";
import { ListSkeleton, PageSkeleton } from "@/components/ui/LoadingSkeleton";
import { guruNav } from "@/config/navigation";
import { getGuidanceCases, type GuidanceCase } from "@/features/guru/api";
import { notifyAppAlert } from "@/lib/app-alert-events";
import { apiFetch } from "@/lib/axios";
import { GuruOnbordaProvider } from "@/app/guru/components/GuruOnbordaProvider";
import { StartGuruOnbordaButton } from "@/app/guru/components/StartGuruOnbordaButton";

type RoadmapDetail = {
  id: number;
  title: string;
  description?: string | null;
  status?: string;
  progressNote?: string | null;
};

type StepNote = {
  id: number;
  note: string;
  title?: string | null;
  guruName?: string | null;
  createdAt?: string | null;
};

type RoadmapStep = {
  id: number;
  title: string;
  description?: string | null;
  notes?: StepNote[];
  details: RoadmapDetail[];
};

type StudentRoadmap = {
  studentRoadmapId: number;
  headline: string;
  progress: number;
  steps: RoadmapStep[];
};

function normalizeStudentRoadmap(raw: any): StudentRoadmap | null {
  const data = raw?.data ?? raw?.roadmap ?? raw;
  if (!data) return null;

  const template = data?.roadmap ?? data?.master ?? data?.roadmap_master ?? data;
  const steps = data?.steps ?? template?.steps ?? data?.roadmap_steps ?? [];
  if (!Array.isArray(steps)) return null;

  return {
    studentRoadmapId: Number(data?.id_student_roadmap ?? data?.id ?? 0),
    headline: String(
      template?.title ?? template?.headline ?? template?.nama ?? "Roadmap siswa",
    ),
    progress: Number(
      data?.progress_percent ??
        data?.progress ??
        data?.progress_percentage ??
        data?.percentage ??
        0,
    ),
    steps: steps.map((step: any, index: number) => ({
      id: Number(step?.id_roadmap_step ?? step?.id ?? step?.id_step ?? index + 1),
      title: String(step?.title ?? step?.judul ?? step?.name ?? `Tahap ${index + 1}`),
      description: step?.description ?? step?.deskripsi ?? null,
      notes: (step?.notes ?? []).map((note: any) => ({
        id: Number(note?.id ?? note?.id_roadmap_step_note ?? 0),
        title: note?.title ?? null,
        note: String(note?.note ?? note?.catatan ?? ""),
        guruName: note?.guruName ?? note?.guru_name ?? note?.guru?.user?.nama ?? null,
        createdAt: note?.createdAt ?? note?.created_at ?? null,
      })),
      details: (step?.details ?? step?.detail ?? step?.step_details ?? []).map(
        (detail: any) => {
          const progress = detail?.progress ?? detail;
          return {
            id: Number(
              detail?.id_roadmap_step_detail ?? detail?.id ?? detail?.id_detail ?? 0,
            ),
            title: String(detail?.title ?? detail?.judul ?? detail?.name ?? "Detail roadmap"),
            description: detail?.description ?? detail?.deskripsi ?? null,
            status: String(progress?.status ?? detail?.status ?? detail?.progress_status ?? "belum"),
            progressNote: progress?.progress_note ?? null,
          };
        },
      ),
    })),
  };
}

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, Number(value || 0)));
}

function ProgressBar({ value }: { value: number }) {
  const safeValue = clampProgress(value);

  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-sky-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300 transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function statusTone(status?: string) {
  const value = String(status ?? "").toLowerCase();
  if (value.includes("selesai")) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }
  if (value.includes("proses")) {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function studentStatus(item?: GuidanceCase | null) {
  if (!item) return "-";
  if (!item.recommendations?.length) return "Belum generate rekomendasi";
  if (!item.hasActiveRoadmap) return "Sudah isi data, belum memilih roadmap";
  return `Roadmap aktif • ${item.progress}%`;
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "SW"
  );
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SoftPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[1.55rem] border border-sky-100 bg-gradient-to-br from-white via-cyan-50/25 to-sky-50/55 shadow-sm shadow-sky-100/50 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.032)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.032)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-200/20 blur-3xl" />
      <div className="relative">{children}</div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700">
        {eyebrow}
      </p>
      <h3 className="mt-1.5 text-xl font-black tracking-tight text-slate-950 md:text-2xl">
        {title}
      </h3>
      {desc && <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">{desc}</p>}
    </div>
  );
}

function StudentInfoCard({ selected, index }: { selected: GuidanceCase; index: number }) {
  return (
    <SoftPanel>
      <div className="p-5 md:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="flex items-start gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
                <Icon name="profile" className="h-3.5 w-3.5" />
                Data Siswa
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                {selected.studentName}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                <span className="rounded-full bg-white px-3 py-1 ring-1 ring-sky-100">
                  {selected.className || "Kelas -"}
                </span>
                <span className="rounded-full bg-white px-3 py-1 ring-1 ring-sky-100">
                  NISN {(selected as any).nisn || "-"}
                </span>
                <span className="rounded-full bg-white px-3 py-1 ring-1 ring-sky-100">
                  No HP {selected.phone || "-"}
                </span>
              </div>
              <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                {studentStatus(selected)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SoftPanel>
  );
}

function RecommendationSection({ selected }: { selected: GuidanceCase }) {
  return (
    <SoftPanel>
      <div className="border-b border-sky-100 px-5 py-5 md:px-6 md:py-5">
        <SectionTitle
          eyebrow="3 Hasil Keputusan SPK"
          title="Rekomendasi dan pilihan siswa"
          desc="Tampilkan tiga rekomendasi utama serta roadmap yang sudah dipilih siswa."
        />
      </div>

      <div className="p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {(selected.recommendations ?? []).length ? (
            (selected.recommendations ?? []).slice(0, 3).map((item) => {
              const chosen =
                Number(item.roadmapId || 0) === Number(selected.selectedRoadmapId || 0) ||
                item.title === selected.selectedRoadmapTitle;

              return (
                <article
                  key={item.id}
                  className={`relative overflow-hidden rounded-[1.35rem] border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    chosen
                      ? "border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50"
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-2xl text-sm font-black ${
                        chosen
                          ? "bg-gradient-to-r from-[#0b2450] to-sky-600 text-white shadow-md shadow-sky-600/20"
                          : "bg-slate-50 text-slate-600 ring-1 ring-slate-100"
                      }`}
                    >
                      #{item.rank}
                    </span>
                    {chosen && (
                      <span className="rounded-full bg-sky-600 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                        Dipilih siswa
                      </span>
                    )}
                  </div>

                  <h4 className="mt-4 line-clamp-2 text-base font-black leading-6 text-slate-950">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {item.category || "Rekomendasi"}
                  </p>
                  <div className="mt-4 rounded-2xl bg-white px-3 py-2 text-sm font-black text-sky-700 ring-1 ring-sky-100">
                    Skor {Number(item.score || 0).toFixed(2)}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full rounded-[1.35rem] border border-dashed border-sky-200 bg-white/75 px-5 py-6 text-center text-sm font-bold text-slate-500">
              Siswa belum melakukan generate rekomendasi SPK.
            </div>
          )}
        </div>
      </div>
    </SoftPanel>
  );
}

function RoadmapSection({
  roadmap,
  loadingRoadmap,
  noteText,
  setNoteText,
  sendStepNote,
}: {
  roadmap: StudentRoadmap | null;
  loadingRoadmap: boolean;
  noteText: Record<number, string>;
  setNoteText: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  sendStepNote: (step: RoadmapStep) => Promise<void>;
}) {
  return (
    <SoftPanel>
      <div className="border-b border-sky-100 px-5 py-5 md:px-6 md:py-5">
        <SectionTitle
          eyebrow="Roadmap Siswa"
          title={roadmap?.headline || "Roadmap pilihan siswa"}
          desc="Pantau aktivitas roadmap siswa dan tambahkan catatan bimbingan pada setiap tahap."
        />
      </div>

      <div className="p-5 md:p-6">
        {loadingRoadmap ? (
          <ListSkeleton count={4} />
        ) : !roadmap ? (
          <div className="rounded-[1.35rem] border border-dashed border-sky-200 bg-white/75 px-5 py-6 text-center text-sm font-bold text-slate-500">
            Roadmap siswa belum tersedia atau belum dipilih.
          </div>
        ) : (
          <div className="space-y-4">
            {roadmap.steps.map((step, stepIndex) => (
              <article
                key={step.id}
                className="overflow-hidden rounded-[1.35rem] border border-sky-100 bg-white shadow-sm shadow-sky-100/50"
              >
                <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 px-5 py-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sm font-black text-sky-700 ring-1 ring-sky-200/70">
                        {stepIndex + 1}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-950">{step.title}</h4>
                        {step.description && (
                          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-sky-100">
                      {step.details.length} aktivitas
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  {step.details.map((detail) => (
                    <div
                      key={detail.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-black text-slate-900">{detail.title}</p>
                          {detail.description && (
                            <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                              {detail.description}
                            </p>
                          )}
                          {detail.progressNote && (
                            <p className="mt-3 rounded-2xl bg-white p-3 text-xs font-semibold leading-5 text-slate-500 ring-1 ring-slate-100">
                              Catatan siswa: {detail.progressNote}
                            </p>
                          )}
                        </div>
                        <span
                          className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-black capitalize ring-1 ${statusTone(
                            detail.status,
                          )}`}
                        >
                          {detail.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {!!step.notes?.length && (
                    <div className="space-y-2 rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">
                        Catatan Guru
                      </p>
                      {step.notes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-2xl bg-white p-3 text-sm font-medium leading-6 text-slate-600 ring-1 ring-sky-100"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-black text-slate-900">
                              {note.title || "Catatan guru"}
                            </p>
                            {formatDate(note.createdAt) && (
                              <span className="text-[11px] font-bold text-slate-400">
                                {formatDate(note.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="mt-1">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 md:grid-cols-[1fr_auto] md:items-end">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-bold text-slate-700">
                        Catatan bimbingan
                      </span>
                      <textarea
                        value={noteText[step.id] ?? ""}
                        onChange={(event) =>
                          setNoteText((current) => ({
                            ...current,
                            [step.id]: event.target.value,
                          }))
                        }
                        placeholder="Tulis catatan bimbingan untuk tahap/progress ini..."
                        className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => sendStepNote(step)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      <Icon name="message" className="h-4 w-4" />
                      Simpan Catatan
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SoftPanel>
  );
}

export default function GuruStudentProgressDetailPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    setStudentId(String(searchParams.get("id") ?? ""));
  }, []);

  const [cases, setCases] = useState<GuidanceCase[]>([]);
  const [selected, setSelected] = useState<GuidanceCase | null>(null);
  const [roadmap, setRoadmap] = useState<StudentRoadmap | null>(null);
  const [noteText, setNoteText] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [error, setError] = useState("");

  const selectedIndex = useMemo(
    () => cases.findIndex((item) => String(item.studentId) === studentId),
    [cases, studentId],
  );

  async function loadData() {
    setLoading(true);
    setError("");

    if (!studentId) {
      setCases([]);
      setSelected(null);
      setError("Parameter id siswa belum tersedia.");
      setLoading(false);
      return;
    }

    try {
      const rows = await getGuidanceCases();
      const current = rows.find((item) => String(item.studentId) === studentId) ?? null;
      setCases(rows);
      setSelected(current);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memuat data siswa.";
      setError(message);
      notifyAppAlert({
        type: "error",
        title: "Gagal memuat data",
        description: message,
        autoCloseMs: false,
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadRoadmap() {
    if (!studentId) return;

    setLoadingRoadmap(true);
    setRoadmap(null);

    try {
      const response = await apiFetch<any>(`/roadmaps/guru/siswa/${studentId}`, {
        method: "GET",
        alert: false,
      });
      setRoadmap(normalizeStudentRoadmap(response));
    } catch (err) {
      setRoadmap(null);
      setError(err instanceof Error ? err.message : "Roadmap siswa belum tersedia.");
    } finally {
      setLoadingRoadmap(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [studentId]);

  useEffect(() => {
    if (selected) loadRoadmap();
  }, [selected?.studentId]);

  async function sendStepNote(step: RoadmapStep) {
    if (!selected || !roadmap?.studentRoadmapId) return;

    const note = String(noteText[step.id] ?? "").trim();
    if (!note) {
      notifyAppAlert({
        type: "error",
        title: "Catatan kosong",
        description: "Tulis catatan bimbingan terlebih dahulu.",
        autoCloseMs: 2400,
      });
      return;
    }

    try {
      await apiFetch("/roadmaps/guru/step-notes", {
        method: "POST",
        body: JSON.stringify({
          id_student_roadmap: roadmap.studentRoadmapId,
          id_roadmap_step: step.id,
          title: `Catatan ${step.title}`,
          note,
          visible_to_student: true,
        }),
        successMessage: false,
        errorMessage: false,
      });

      const currentScrollY = window.scrollY;
      setNoteText((current) => ({ ...current, [step.id]: "" }));
      notifyAppAlert({
        type: "success",
        title: "Catatan tersimpan",
        description: "Catatan bimbingan berhasil ditambahkan.",
        autoCloseMs: 2200,
      });
      await loadRoadmap();
      window.requestAnimationFrame(() =>
        window.scrollTo({ top: currentScrollY, behavior: "auto" }),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan catatan.";
      setError(message);
      notifyAppAlert({
        type: "error",
        title: "Gagal menyimpan catatan",
        description: message,
        autoCloseMs: false,
      });
    }
  }

  return (
    <GuruOnbordaProvider>
      <DashboardShell
        requiredRole="guru"
        activeKey="progress"
        navItems={guruNav}
        title="Detail Progress Siswa"
        subtitle="Lihat 3 hasil keputusan SPK, roadmap pilihan siswa, progress, dan catatan bimbingan."
        onNavigate={(key) => {
          if (key === "dashboard") router.push("/guru");
          if (key === "progress") router.push("/guru/progress");
          if (key === "nilai") router.push("/guru/nilai");
          if (key === "profil") router.push("/guru/profil");
        }}
        rightSlot={<StartGuruOnbordaButton />}
      >
        <button
          type="button"
          onClick={() => router.push("/guru/progress")}
          className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-black text-sky-700 shadow-sm shadow-sky-100/60 transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md"
        >
          <Icon name="arrowLeft" className="h-4 w-4" />
          Kembali ke daftar siswa
        </button>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <PageSkeleton title stats={false} />
        ) : !selected ? (
          <div className="rounded-[2rem] border border-sky-100 bg-white px-5 py-8 text-center text-sm font-bold text-slate-500 shadow-sm">
            Siswa tidak ditemukan.
          </div>
        ) : (
          <div className="space-y-6">
            <StudentInfoCard selected={selected} index={selectedIndex} />
            <RecommendationSection selected={selected} />
            <RoadmapSection
              roadmap={roadmap}
              loadingRoadmap={loadingRoadmap}
              noteText={noteText}
              setNoteText={setNoteText}
              sendStepNote={sendStepNote}
            />
          </div>
        )}
      </DashboardShell>
    </GuruOnbordaProvider>
  );
}
