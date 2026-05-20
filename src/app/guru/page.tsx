"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "../../components/layout/DashboardShell";
import { FeedbackModal } from "../../components/ui/FeedbackModal";
import { Icon } from "../../components/ui/icons";
import { guruNav } from "../../config/navigation";
import { apiFetch } from "../../lib/axios";
import { getGuidanceCases, type GuidanceCase } from "../../features/guru/api";

type RoadmapDetail = {
  id: number;
  progressId?: number;
  title: string;
  description?: string | null;
  status?: string;
  notes?: Array<{ id: number; note: string; guruName?: string | null; createdAt?: string | null }>;
};

type RoadmapStep = {
  id: number;
  title: string;
  description?: string | null;
  details: RoadmapDetail[];
};

type StudentRoadmap = {
  headline: string;
  progress: number;
  steps: RoadmapStep[];
};

function normalizeStudentRoadmap(raw: any): StudentRoadmap | null {
  const data = raw?.data ?? raw?.roadmap ?? raw;
  if (!data) return null;
  const master = data?.master ?? data?.roadmap_master ?? data;
  const steps = data?.steps ?? master?.steps ?? data?.roadmap_steps ?? [];
  if (!Array.isArray(steps)) return null;
  return {
    headline: String(master?.title ?? master?.headline ?? master?.nama ?? "Roadmap siswa"),
    progress: Number(data?.progress ?? data?.progress_percentage ?? data?.percentage ?? 0),
    steps: steps.map((step: any, index: number) => ({
      id: Number(step?.id ?? step?.id_step ?? index + 1),
      title: String(step?.title ?? step?.judul ?? step?.name ?? `Tahap ${index + 1}`),
      description: step?.description ?? step?.deskripsi ?? null,
      details: (step?.details ?? step?.detail ?? step?.step_details ?? []).map((detail: any) => ({
        id: Number(detail?.id ?? detail?.id_detail ?? detail?.roadmap_step_detail_id ?? 0),
        progressId: Number(detail?.progress_id ?? detail?.id_progress ?? 0) || undefined,
        title: String(detail?.title ?? detail?.judul ?? detail?.name ?? "Detail roadmap"),
        description: detail?.description ?? detail?.deskripsi ?? null,
        status: String(detail?.status ?? detail?.progress_status ?? "belum"),
        notes: detail?.notes ?? detail?.catatan ?? [],
      })),
    })),
  };
}

function ProgressBar({ value }: { value: number }) {
  return <div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-700" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

export default function GuruPage() {
  const [active, setActive] = useState("progress");
  const [cases, setCases] = useState<GuidanceCase[]>([]);
  const [selected, setSelected] = useState<GuidanceCase | null>(null);
  const [roadmap, setRoadmap] = useState<StudentRoadmap | null>(null);
  const [noteText, setNoteText] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ title: string; description: string } | null>(null);

  async function refreshCases() {
    setLoading(true);
    try {
      const data = await getGuidanceCases();
      setCases(data);
      if (!selected && data[0]) setSelected(data[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data progress siswa.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshCases();
  }, []);

  useEffect(() => {
    if (!selected?.studentId) return;
    setRoadmap(null);
    apiFetch<any>(`/roadmaps/guru/siswa/${selected.studentId}`)
      .then((response) => setRoadmap(normalizeStudentRoadmap(response)))
      .catch(() => setRoadmap(null));
  }, [selected?.studentId]);

  async function sendStepNote(detail: RoadmapDetail) {
    if (!selected) return;
    const note = String(noteText[detail.id] ?? "").trim();
    if (!note) return setError("Catatan tidak boleh kosong.");
    setError("");
    setMessage("");
    try {
      await apiFetch("/roadmaps/guru/step-notes", {
        method: "POST",
        body: JSON.stringify({
          id_siswa: selected.studentId,
          student_id: selected.studentId,
          roadmap_step_detail_id: detail.id,
          id_roadmap_step_detail: detail.id,
          note,
          catatan: note,
        }),
      });
      setNoteText((current) => ({ ...current, [detail.id]: "" }));
      setMessage("Catatan bimbingan berhasil disimpan.");
      setModal({ title: "Catatan tersimpan", description: "Catatan guru sudah ditambahkan pada step roadmap siswa." });
      apiFetch<any>(`/roadmaps/guru/siswa/${selected.studentId}`).then((response) => setRoadmap(normalizeStudentRoadmap(response))).catch(() => null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan catatan.");
    }
  }

  return (
    <DashboardShell requiredRole="guru" activeKey={active} navItems={guruNav} title="Ruang Bimbingan Guru" subtitle="Guru difokuskan untuk melihat progress roadmap siswa dan memberi catatan bimbingan." onNavigate={setActive}>
      {(message || error) && <div className={`mb-6 rounded-2xl p-4 text-sm font-bold ${error ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"}`}>{error || message}</div>}

      <section id="progress" className="scroll-mt-28 grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-900/5">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">Siswa</p><h2 className="mt-2 text-xl font-extrabold">Progress Roadmap</h2></div>
            <Icon name="progress" className="h-6 w-6 text-sky-700" />
          </div>
          {loading && <p className="mt-6 text-sm font-bold text-slate-500">Memuat data siswa...</p>}
          <div className="mt-5 space-y-3">
            {cases.map((item) => (
              <button key={item.id} type="button" onClick={() => setSelected(item)} className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === item.id ? "border-sky-200 bg-sky-50" : "border-slate-100 bg-slate-50 hover:bg-white"}`}>
                <div className="flex items-start justify-between gap-3"><div><p className="font-extrabold text-slate-950">{item.studentName}</p><p className="mt-1 text-xs font-bold text-slate-500">{item.className}</p></div><span className="rounded-full bg-white px-2 py-1 text-xs font-extrabold text-slate-600">{item.progress}%</span></div>
                <div className="mt-3"><ProgressBar value={item.progress} /></div>
              </button>
            ))}
          </div>
        </aside>

        <section id="bimbingan" className="scroll-mt-28 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5">
          {!selected ? (
            <div className="rounded-3xl bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">Pilih siswa terlebih dahulu untuk melihat progress roadmap.</div>
          ) : (
            <>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div><p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">Bimbingan</p><h2 className="mt-2 text-2xl font-extrabold text-slate-950">{selected.studentName}</h2><p className="mt-2 text-sm font-medium text-slate-500">Rekomendasi: {selected.recommendation || "Belum tersedia"}</p></div>
                <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white"><p className="text-xs font-bold text-cyan-200">Progress</p><p className="mt-1 text-2xl font-extrabold">{selected.progress}%</p></div>
              </div>
              <div className="mt-6"><ProgressBar value={selected.progress} /></div>

              {!roadmap ? <div className="mt-6 rounded-3xl bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">Roadmap siswa belum tersedia atau belum dipilih.</div> : (
                <div className="mt-6 space-y-4">
                  <h3 className="text-xl font-extrabold text-slate-950">{roadmap.headline}</h3>
                  {roadmap.steps.map((step) => (
                    <article key={step.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                      <h4 className="font-extrabold text-slate-950">{step.title}</h4>
                      {step.description && <p className="mt-1 text-sm font-medium text-slate-500">{step.description}</p>}
                      <div className="mt-4 space-y-3">
                        {step.details.map((detail) => (
                          <div key={detail.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                            <div className="flex items-start justify-between gap-3"><div><p className="font-extrabold text-slate-900">{detail.title}</p>{detail.description && <p className="mt-1 text-sm font-medium text-slate-500">{detail.description}</p>}</div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold capitalize text-slate-600">{detail.status}</span></div>
                            {!!detail.notes?.length && <div className="mt-3 space-y-2">{detail.notes.map((note) => <p key={note.id} className="rounded-2xl bg-sky-50 p-3 text-sm font-medium leading-6 text-sky-800">{note.note}</p>)}</div>}
                            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><textarea value={noteText[detail.id] ?? ""} onChange={(event) => setNoteText((current) => ({ ...current, [detail.id]: event.target.value }))} placeholder="Tulis catatan bimbingan untuk step ini..." className="min-h-20 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-sky-700 focus:bg-white" /><button type="button" onClick={() => sendStepNote(detail)} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-sky-700"><Icon name="message" className="mb-1 h-4 w-4" />Simpan</button></div>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </section>
      <FeedbackModal open={!!modal} title={modal?.title ?? ""} description={modal?.description} onClose={() => setModal(null)} />
    </DashboardShell>
  );
}
