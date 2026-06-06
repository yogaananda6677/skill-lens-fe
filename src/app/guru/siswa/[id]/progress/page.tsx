"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import { Icon } from "../../../../../components/ui/icons";
import { ListSkeleton, PageSkeleton } from "../../../../../components/ui/LoadingSkeleton";
import { guruNav } from "../../../../../config/navigation";
import { getGuidanceCases, type GuidanceCase } from "../../../../../features/guru/api";
import { notifyAppAlert } from "../../../../../lib/app-alert-events";
import { apiFetch } from "../../../../../lib/axios";
import { GuruOnbordaProvider } from "../../../components/GuruOnbordaProvider";
import { StartGuruOnbordaButton } from "../../../components/StartGuruOnbordaButton";

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
    headline: String(template?.title ?? template?.headline ?? template?.nama ?? "Roadmap siswa"),
    progress: Number(data?.progress_percent ?? data?.progress ?? data?.progress_percentage ?? data?.percentage ?? 0),
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
      details: (step?.details ?? step?.detail ?? step?.step_details ?? []).map((detail: any) => {
        const progress = detail?.progress ?? detail;
        return {
          id: Number(detail?.id_roadmap_step_detail ?? detail?.id ?? detail?.id_detail ?? 0),
          title: String(detail?.title ?? detail?.judul ?? detail?.name ?? "Detail roadmap"),
          description: detail?.description ?? detail?.deskripsi ?? null,
          status: String(progress?.status ?? detail?.status ?? detail?.progress_status ?? "belum"),
          progressNote: progress?.progress_note ?? null,
        };
      }),
    })),
  };
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-sky-700" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function statusTone(status?: string) {
  const value = String(status ?? "").toLowerCase();
  if (value.includes("selesai")) return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (value.includes("proses")) return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function studentStatus(item?: GuidanceCase | null) {
  if (!item) return "-";
  if (!item.recommendations?.length) return "-";
  if (!item.hasActiveRoadmap) return "Sudah isi data, belum memilih roadmap";
  return `Roadmap aktif • ${item.progress}%`;
}

export default function GuruStudentProgressDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const studentId = String(params?.id ?? "");

  const [cases, setCases] = useState<GuidanceCase[]>([]);
  const [selected, setSelected] = useState<GuidanceCase | null>(null);
  const [roadmap, setRoadmap] = useState<StudentRoadmap | null>(null);
  const [noteText, setNoteText] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [error, setError] = useState("");

  const selectedIndex = useMemo(() => cases.findIndex((item) => String(item.studentId) === studentId), [cases, studentId]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const rows = await getGuidanceCases();
      const current = rows.find((item) => String(item.studentId) === studentId) ?? null;
      setCases(rows);
      setSelected(current);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memuat data siswa.";
      setError(message);
      notifyAppAlert({ type: "error", title: "Gagal memuat data", description: message, autoCloseMs: false });
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
      notifyAppAlert({ type: "error", title: "Catatan kosong", description: "Tulis catatan bimbingan terlebih dahulu.", autoCloseMs: 2400 });
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
      notifyAppAlert({ type: "success", title: "Catatan tersimpan", description: "Catatan bimbingan berhasil ditambahkan.", autoCloseMs: 2200 });
      await loadRoadmap();
      window.requestAnimationFrame(() => window.scrollTo({ top: currentScrollY, behavior: "auto" }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan catatan.";
      setError(message);
      notifyAppAlert({ type: "error", title: "Gagal menyimpan catatan", description: message, autoCloseMs: false });
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
          className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
        >
          <Icon name="arrowLeft" className="h-4 w-4" />
          Kembali ke daftar siswa
        </button>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-100">
            {error}
          </div>
        )}

        {loading ? (
          <PageSkeleton title stats={false} />
        ) : !selected ? (
          <div className="rounded-[2rem] bg-white p-10 text-center text-sm font-bold text-slate-500 ring-1 ring-slate-100">Siswa tidak ditemukan.</div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">Data Siswa</p>
                  <h2 className="mt-2 text-3xl font-extrabold text-slate-950">{selected.studentName}</h2>
                  <p className="mt-2 text-sm font-bold text-slate-500">
                    {selected.className || "-"} • {selected.jurusan || "-"} • NISN {(selected as any).nisn || "-"} • No HP {selected.phone || "-"}
                  </p>
                  <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600 ring-1 ring-slate-200">
                    {studentStatus(selected)}
                  </p>
                </div>

                <div className="rounded-3xl bg-slate-950 px-6 py-5 text-white">
                  <p className="text-xs font-bold text-cyan-200">Progress total</p>
                  <p className="mt-1 text-3xl font-extrabold">{selected.progress}%</p>
                </div>
              </div>
              <div className="mt-6"><ProgressBar value={selected.progress} /></div>
            </section>

            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5">
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">3 Hasil Keputusan SPK</p>
              <h3 className="mt-2 text-2xl font-extrabold text-slate-950">Rekomendasi dan pilihan siswa</h3>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {(selected.recommendations ?? []).length ? (
                  (selected.recommendations ?? []).slice(0, 3).map((item) => {
                    const chosen = Number(item.roadmapId || 0) === Number(selected.selectedRoadmapId || 0) || item.title === selected.selectedRoadmapTitle;
                    return (
                      <article key={item.id} className={`rounded-3xl p-5 ring-1 ${chosen ? "bg-sky-50 ring-sky-200" : "bg-slate-50 ring-slate-100"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`grid h-10 w-10 place-items-center rounded-full text-sm font-extrabold ${chosen ? "bg-sky-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-100"}`}>#{item.rank}</span>
                          {chosen && <span className="rounded-full bg-sky-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">Dipilih siswa</span>}
                        </div>
                        <h4 className="mt-4 text-lg font-extrabold text-slate-950">{item.title}</h4>
                        <p className="mt-1 text-xs font-bold text-slate-500">{item.category || "Rekomendasi"}</p>
                        <p className="mt-4 text-sm font-extrabold text-sky-700">Skor {Number(item.score || 0).toFixed(2)}</p>
                      </article>
                    );
                  })
                ) : (
                  <div className="col-span-full rounded-3xl bg-slate-50 p-8 text-center text-sm font-bold text-slate-500 ring-1 ring-slate-100">
                    Siswa belum melakukan generate rekomendasi SPK.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5">
              {loadingRoadmap ? (
                <ListSkeleton count={4} />
              ) : !roadmap ? (
                <div className="rounded-3xl bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">Roadmap siswa belum tersedia atau belum dipilih.</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">Roadmap siswa</p>
                    <h3 className="mt-2 text-2xl font-extrabold text-slate-950">{roadmap.headline}</h3>
                  </div>

                  {roadmap.steps.map((step) => (
                    <article key={step.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                        <div>
                          <h4 className="font-extrabold text-slate-950">{step.title}</h4>
                          {step.description && <p className="mt-1 text-sm font-medium text-slate-500">{step.description}</p>}
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-100">{step.details.length} aktivitas</span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {step.details.map((detail) => (
                          <div key={detail.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-extrabold text-slate-900">{detail.title}</p>
                                {detail.description && <p className="mt-1 text-sm font-medium text-slate-500">{detail.description}</p>}
                                {detail.progressNote && <p className="mt-2 rounded-xl bg-slate-50 p-2 text-xs font-semibold text-slate-500">Catatan siswa: {detail.progressNote}</p>}
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ring-1 ${statusTone(detail.status)}`}>{detail.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {!!step.notes?.length && (
                        <div className="mt-4 space-y-2">
                          {step.notes.map((note) => (
                            <div key={note.id} className="rounded-2xl bg-sky-50 p-3 text-sm font-medium leading-6 text-sky-800 ring-1 ring-sky-100">
                              <p className="font-bold">{note.title || "Catatan guru"}</p>
                              <p>{note.note}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                        <textarea
                          value={noteText[step.id] ?? ""}
                          onChange={(event) => setNoteText((current) => ({ ...current, [step.id]: event.target.value }))}
                          placeholder="Tulis catatan bimbingan untuk tahap/progress ini..."
                          className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-sky-700 focus:bg-white"
                        />
                        <button type="button" onClick={() => sendStepNote(step)} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-sky-700">
                          <Icon name="message" className="mb-1 h-4 w-4" />
                          Simpan Catatan
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </DashboardShell>
    </GuruOnbordaProvider>
  );
}
