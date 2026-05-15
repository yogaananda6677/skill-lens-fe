"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DashboardShell, type DashboardNavItem } from "../../components/layout/DashboardShell";
import { getSiswaMe, processSiswaSpk, saveSiswaProfile, toStudentProfile } from "../../features/siswa/api";
import type { AcademicScores, Recommendation, StudentProfileForm } from "../../features/siswa/types";
import { hobbyOptions, interestOptions, skillOptions, talentOptions } from "../../data/profile-options";

const emptyProfile: StudentProfileForm = {
  name: "",
  nisn: "",
  school: "",
  className: "",
  major: "",
  academicScores: {},
  interests: [],
  hobbies: [],
  talents: [],
  skills: [],
  achievements: "",
  goal: "",
  learningPreference: "",
  constraints: "",
};

const studentNav = [
  { key: "profil", label: "Profil", description: "Minat dan tujuan", href: "#profil", icon: "profile" },
  { key: "akademik", label: "Akademik", description: "Nilai dari sekolah", href: "#akademik", icon: "academic" },
  { key: "hasil", label: "Hasil SPK", description: "Rekomendasi", href: "#hasil", icon: "result" },
] as const satisfies readonly DashboardNavItem[];

type ArrayField = "interests" | "hobbies" | "talents" | "skills";
type TextField = "achievements" | "goal" | "learningPreference" | "constraints";

function Panel({ children, id, className = "" }: { children: ReactNode; id?: string; className?: string }) {
  return <section id={id} className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</section>;
}

function average(scores: AcademicScores) {
  const values = Object.values(scores).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{Math.round(value || 0)}</p>
      <div className="mt-3 h-2 rounded-full bg-white">
        <div className="h-full rounded-full bg-slate-950" style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }} />
      </div>
    </div>
  );
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950"}`}>
      {label}
    </button>
  );
}

function OptionPicker({ title, subtitle, options, selected, onToggle }: { title: string; subtitle: string; options: readonly string[]; selected: string[]; onToggle: (value: string) => void }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const filtered = keyword ? options.filter((item) => item.toLowerCase().includes(keyword)) : options;
    const pinned = selected.filter((item) => !filtered.includes(item));
    return [...pinned, ...filtered].slice(0, 24);
  }, [options, query, selected]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{subtitle}</p>
        </div>
        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">{selected.length} dipilih</span>
      </div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari pilihan..." className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-slate-950" />
      <div className="mt-4 flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-1">
        {visible.map((option) => <ToggleChip key={option} label={option} active={selected.includes(option)} onClick={() => onToggle(option)} />)}
      </div>
    </div>
  );
}

function RecommendationCard({ item }: { item: Recommendation }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Peringkat {item.topsisRank}</span>
          <h3 className="mt-4 text-xl font-semibold leading-tight text-slate-950">{item.title}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">{item.category}</p>
        </div>
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-slate-950 text-xl font-semibold text-white">{Math.round(item.score || 0)}</div>
      </div>
      <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">{item.summary}</p>
      {!!item.suggestedMajors.length && <div className="mt-4 flex flex-wrap gap-2">{item.suggestedMajors.map((major) => <span key={major} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{major}</span>)}</div>}
      {!!item.reasons.length && <ul className="mt-4 space-y-2 text-sm font-semibold text-slate-600">{item.reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul>}
    </article>
  );
}

export default function SiswaPage() {
  const [profile, setProfile] = useState<StudentProfileForm>(emptyProfile);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeSection, setActiveSection] = useState("profil");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoadingProfile(true);
        const data = await getSiswaMe();
        setProfile(toStudentProfile(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengambil data siswa.");
      } finally {
        setLoadingProfile(false);
      }
    }
    load();
  }, []);

  function updateText(field: TextField, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function toggleArrayValue(field: ArrayField, value: string) {
    setProfile((current) => {
      const exists = current[field].includes(value);
      return { ...current, [field]: exists ? current[field].filter((item) => item !== value) : [...current[field], value] };
    });
  }

  async function handleSaveOnly() {
    setError("");
    setMessage("");
    try {
      await saveSiswaProfile({
        minat: profile.interests,
        hobi: profile.hobbies,
        bakat: profile.talents,
        skill: profile.skills,
        prestasi: profile.achievements,
        tujuan: profile.goal,
        preferensi_belajar: profile.learningPreference,
        kendala: profile.constraints,
      });
      setMessage("Profil berhasil disimpan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan profil.");
    }
  }

  async function handleProcessSpk() {
    setError("");
    setMessage("");
    setProcessing(true);
    try {
      const payload = {
        minat: profile.interests,
        hobi: profile.hobbies,
        bakat: profile.talents,
        skill: profile.skills,
        prestasi: profile.achievements,
        tujuan: profile.goal,
        preferensi_belajar: profile.learningPreference,
        kendala: profile.constraints,
      };
      await saveSiswaProfile(payload);
      const result = await processSiswaSpk(payload);
      setRecommendations(result.recommendations);
      setMessage("Profil berhasil disimpan dan rekomendasi berhasil diproses.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses rekomendasi.");
    } finally {
      setProcessing(false);
    }
  }

  const academicAverage = average(profile.academicScores);
  const academicRows = [
    ["Numerik", profile.academicScores.numerik ?? 0],
    ["Bahasa", profile.academicScores.bahasa ?? 0],
    ["Sains", profile.academicScores.sains ?? 0],
    ["Sosial", profile.academicScores.sosial ?? 0],
    ["Teknologi", profile.academicScores.teknologi ?? 0],
    ["Kreativitas", profile.academicScores.kreativitas ?? 0],
    ["Softskill", profile.academicScores.softskill ?? 0],
    ["Agama", profile.academicScores.agama ?? 0],
  ] as const;

  return (
    <DashboardShell
      requiredRole="siswa"
      activeKey={activeSection}
      navItems={studentNav}
      title="Profil dan Rekomendasi Siswa"
      subtitle="Lengkapi minat, hobi, bakat, skill, dan tujuan. Nilai akademik dibaca dari data sekolah, bukan diinput siswa."
      userName={profile.name || "Siswa"}
      userLabel={profile.className || "Siswa"}
      schoolName={profile.school || profile.major || "Data sekolah"}
      onNavigate={(key) => setActiveSection(key)}
    >
      {loadingProfile && <div className="mb-5 rounded-2xl bg-white p-4 text-sm font-medium text-slate-500 shadow-sm">Memuat data siswa...</div>}
      {(message || error) && <div className={`mb-5 rounded-2xl p-4 text-sm font-medium ${error ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"}`}>{error || message}</div>}

      <div className="grid gap-5 md:grid-cols-4">
        <Panel className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Identitas siswa</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{profile.name || "Data siswa"}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">NISN</p><p className="mt-1 font-semibold">{profile.nisn || "-"}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">Kelas</p><p className="mt-1 font-semibold">{profile.className || "-"}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2"><p className="text-xs font-semibold text-slate-400">Jurusan</p><p className="mt-1 font-semibold">{profile.major || "-"}</p></div>
          </div>
        </Panel>
        <Panel><p className="text-sm font-medium text-slate-500">Rata-rata akademik</p><p className="mt-3 text-4xl font-semibold">{academicAverage}</p><p className="mt-2 text-sm font-semibold text-slate-500">Dari data sekolah</p></Panel>
        <Panel><p className="text-sm font-medium text-slate-500">Profil nonakademik</p><p className="mt-3 text-4xl font-semibold">{profile.interests.length + profile.hobbies.length + profile.talents.length + profile.skills.length}</p><p className="mt-2 text-sm font-semibold text-slate-500">Pilihan terisi</p></Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6">
          <Panel id="profil">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Profil nonakademik</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Minat, hobi, bakat, dan skill</h2>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">Bagian ini diisi siswa. Nilai akademik tetap berasal dari sekolah.</p>
            </div>
            <div className="space-y-4">
              <OptionPicker title="Minat" subtitle="Pilih bidang yang paling menarik." options={interestOptions} selected={profile.interests} onToggle={(value) => toggleArrayValue("interests", value)} />
              <OptionPicker title="Hobi" subtitle="Pilih aktivitas yang sering dilakukan." options={hobbyOptions} selected={profile.hobbies} onToggle={(value) => toggleArrayValue("hobbies", value)} />
              <OptionPicker title="Bakat" subtitle="Pilih kemampuan yang paling menonjol." options={talentOptions} selected={profile.talents} onToggle={(value) => toggleArrayValue("talents", value)} />
              <OptionPicker title="Skill" subtitle="Pilih skill yang sudah dimiliki." options={skillOptions} selected={profile.skills} onToggle={(value) => toggleArrayValue("skills", value)} />
            </div>
          </Panel>

          <Panel>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tujuan dan pertimbangan</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Rencana setelah lulus</h2>
            <div className="mt-6 space-y-4">
              <label className="block"><span className="text-sm font-semibold text-slate-700">Prestasi / pengalaman</span><textarea value={profile.achievements} onChange={(e) => updateText("achievements", e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium leading-7 outline-none focus:border-slate-950 focus:bg-white" /></label>
              <label className="block"><span className="text-sm font-semibold text-slate-700">Tujuan setelah lulus</span><textarea value={profile.goal} onChange={(e) => updateText("goal", e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium leading-7 outline-none focus:border-slate-950 focus:bg-white" /></label>
              <label className="block"><span className="text-sm font-semibold text-slate-700">Preferensi belajar</span><input value={profile.learningPreference} onChange={(e) => updateText("learningPreference", e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium outline-none focus:border-slate-950 focus:bg-white" /></label>
              <label className="block"><span className="text-sm font-semibold text-slate-700">Kendala / pertimbangan</span><textarea value={profile.constraints} onChange={(e) => updateText("constraints", e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium leading-7 outline-none focus:border-slate-950 focus:bg-white" /></label>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={handleSaveOnly} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Simpan Profil</button>
              <button type="button" onClick={handleProcessSpk} disabled={processing} className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{processing ? "Memproses..." : "Simpan dan Proses Rekomendasi"}</button>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel id="akademik">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Akademik</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Nilai dari sekolah</h2>
            <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">Siswa tidak mengubah nilai. Nilai ini berasal dari hasil import guru.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {academicRows.map(([label, value]) => <ScoreCard key={label} label={label} value={Number(value)} />)}
            </div>
          </Panel>
        </div>
      </div>

      <Panel id="hasil" className="mt-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Hasil SPK</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Rekomendasi dari layanan Python</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-500">Hasil muncul setelah profil disimpan dan diproses oleh backend ke layanan SPK Python.</p>
          </div>
          {!!recommendations[0] && <Link href={`/siswa/roadmap?career=${recommendations[0].id}`} className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white hover:bg-slate-800">Buka roadmap</Link>}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {recommendations.map((item) => <RecommendationCard key={item.id} item={item} />)}
          {!recommendations.length && <div className="rounded-2xl bg-slate-50 p-6 text-sm font-medium text-slate-500 lg:col-span-3">Belum ada hasil rekomendasi. Lengkapi profil, lalu klik tombol proses rekomendasi.</div>}
        </div>
      </Panel>
    </DashboardShell>
  );
}
