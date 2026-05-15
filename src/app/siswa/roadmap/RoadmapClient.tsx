"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardShell, type DashboardNavItem } from "../../../components/layout/DashboardShell";
import { Icon } from "../../../components/ui/icons";
import { careerRoadmaps, getRoadmapForCareer } from "../../../features/siswa/api";
import type { RoadmapStep } from "../../../features/siswa/types";

const studentNav = [
  { key: "profil", label: "Profil Karier", description: "Data diri dan minat", href: "/siswa", icon: "◎" },
  { key: "roadmap", label: "Roadmap", description: "Langkah belajar", href: "/siswa/roadmap", icon: "◇" },
  { key: "hasil", label: "Hasil SPK", description: "Tiga peringkat", href: "/siswa#hasil", icon: "▦" },
  { key: "bimbingan", label: "Bimbingan", description: "Catatan guru", href: "/siswa#bimbingan", icon: "◉" },
] as const satisfies readonly DashboardNavItem[];

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-gradient-to-r from-[#0f2a5f] to-cyan-300" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-6 ${className}`}>{children}</section>;
}

function StepCard({ step, index, done, active, onToggle, onOpen }: { step: RoadmapStep; index: number; done: boolean; active: boolean; onToggle: () => void; onOpen: () => void }) {
  return (
    <article className={`rounded-[1.5rem] border bg-white p-5 shadow-lg shadow-slate-900/5 transition ${active ? "border-[#0f2a5f] ring-4 ring-indigo-50" : "border-slate-100"}`}>
      <div className="flex items-start gap-4">
        <button type="button" onClick={onToggle} className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-semibold transition ${done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-cyan-200 hover:text-slate-950"}`} aria-label={`Tandai ${step.title}`}>
          {done ? "✓" : index + 1}
        </button>
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f2a5f]">{step.phase} · {step.duration}</p>
          <h3 className="mt-2 text-lg font-semibold leading-tight text-slate-950">{step.title}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{step.description}</p>
        </button>
      </div>
    </article>
  );
}

export default function RoadmapClient() {
  const searchParams = useSearchParams();
  const initialCareerId = searchParams.get("career") || "data-analyst-ai";
  const [careerId, setCareerId] = useState(initialCareerId);
  const roadmap = useMemo(() => getRoadmapForCareer(careerId), [careerId]);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [activeStepId, setActiveStepId] = useState("");

  useEffect(() => {
    setCareerId(initialCareerId);
  }, [initialCareerId]);

  useEffect(() => {
    const nextRoadmap = getRoadmapForCareer(careerId);
    setCompletedStepIds(nextRoadmap.steps.slice(0, nextRoadmap.initialCompleted).map((step) => step.id));
    setActiveStepId(nextRoadmap.steps[0]?.id ?? "");
  }, [careerId]);

  const activeStep = roadmap.steps.find((step) => step.id === activeStepId) ?? roadmap.steps[0];
  const progress = roadmap.steps.length ? Math.round((completedStepIds.length / roadmap.steps.length) * 100) : 0;
  const totalDuration = roadmap.steps.map((step) => step.duration).filter((duration) => !duration.toLowerCase().includes("berkelanjutan")).join(" + ");

  const toggleStep = (stepId: string) => {
    setCompletedStepIds((current) => current.includes(stepId) ? current.filter((id) => id !== stepId) : [...current, stepId]);
  };

  return (
    <DashboardShell
      requiredRole="siswa"
      activeKey="roadmap"
      navItems={studentNav}
      title="Roadmap Pengembangan Diri"
      subtitle="Ikuti langkah belajar berdasarkan arah karier yang dipilih. Setiap tahap memiliki durasi, output, dan checklist agar progres mudah dipantau."
      userName="Siswa"
      userLabel="Siswa"
      schoolName="Data sekolah"
      rightSlot={<Link href="/siswa#hasil" className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 md:inline-flex">Ganti hasil</Link>}
    >
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Progress", `${progress}%`, "Langkah yang sudah ditandai selesai.", "check"],
          ["Tahap", `${roadmap.steps.length}`, "Jumlah langkah utama roadmap.", "roadmap"],
          ["Target", roadmap.targetRole.split(",")[0], "Peran awal yang disiapkan.", "target"],
          ["Durasi", totalDuration || "Berkelanjutan", "Estimasi belajar bertahap.", "clock"],
        ].map(([label, value, detail, icon]) => (
          <article key={label} className="rounded-[1.4rem] border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100"><Icon name={icon as "check" | "roadmap" | "target" | "clock"} className="h-5 w-5" /></div>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <Panel className="bg-slate-950 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Pilihan roadmap</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">{roadmap.headline}</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">Target awal: {roadmap.targetRole}</p>
            <div className="mt-6"><ProgressBar value={progress} /></div>
            <p className="mt-2 text-xs font-semibold text-slate-300">{completedStepIds.length} dari {roadmap.steps.length} tahap selesai</p>
          </Panel>

          <Panel>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f2a5f]">Ganti arah karier</p>
            <div className="mt-4 grid gap-3">
              {Object.values(careerRoadmaps).map((item) => (
                <button key={item.careerId} type="button" onClick={() => setCareerId(item.careerId)} className={`rounded-[1.25rem] border p-4 text-left transition hover:-translate-y-0.5 ${careerId === item.careerId ? "border-[#0f2a5f] bg-[#eef5ff]" : "border-slate-100 bg-slate-50 hover:bg-white"}`}>
                  <p className="font-semibold text-slate-950">{item.headline.replace("Roadmap ", "")}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{item.targetRole}</p>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f2a5f]">Timeline roadmap</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Langkah belajar bertahap</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">Progress {progress}%</span>
            </div>
            <div className="mt-6 space-y-3">
              {roadmap.steps.map((step, index) => (
                <StepCard key={step.id} step={step} index={index} done={completedStepIds.includes(step.id)} active={activeStep?.id === step.id} onToggle={() => toggleStep(step.id)} onOpen={() => setActiveStepId(step.id)} />
              ))}
            </div>
          </Panel>

          {activeStep && (
            <Panel>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f2a5f]">Detail tahap aktif</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{activeStep.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{activeStep.description}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.25rem] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Durasi</p>
                  <p className="mt-2 font-semibold text-slate-950">{activeStep.duration}</p>
                </div>
                <div className="rounded-[1.25rem] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Output</p>
                  <p className="mt-2 font-semibold text-slate-950">{activeStep.output}</p>
                </div>
              </div>
              <div className="mt-5">
                <p className="text-sm font-semibold text-slate-950">Checklist penyelesaian</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeStep.checklist.map((item) => <span key={item} className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#4c51d9]">{item}</span>)}
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => toggleStep(activeStep.id)} className="rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0f2a5f]">
                  {completedStepIds.includes(activeStep.id) ? "Batalkan selesai" : "Tandai selesai"}
                </button>
                <Link href="/siswa" className="rounded-full border border-slate-200 bg-white px-6 py-4 text-center text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-[#0f2a5f]/30 hover:text-[#0f2a5f]">Kembali ke profil</Link>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
