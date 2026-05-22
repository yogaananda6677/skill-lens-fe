"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Icon } from "../../../components/ui/icons";
import {
  experienceOptions as fallbackExperienceOptions,
  hobbyOptions as fallbackHobbyOptions,
  interestOptions as fallbackInterestOptions,
  talentOptions as fallbackTalentOptions,
} from "../../../data/profile-options";
import type {
  StudentAchievement,
  StudentProfileForm,
} from "../../../features/siswa/types";
import { Panel, SectionTitle, type ArrayField } from "./StudentShared";

type ProfileOptions = {
  interestOptions?: string[];
  hobbyOptions?: string[];
  talentOptions?: string[];
  experienceOptions?: string[];
};

type AchievementPayload = {
  nama_prestasi: string;
  tingkat?: string | null;
  tahun?: string | number | null;
  penyelenggara?: string | null;
  keterangan?: string | null;
  bukti_url?: string | null;
};

type WizardStepId = "minat" | "hobi" | "bakat" | "pengalaman" | "prestasi" | "tujuan";

type ChoiceStepConfig = {
  id: Extract<WizardStepId, "minat" | "hobi" | "bakat" | "pengalaman">;
  field: ArrayField;
  title: string;
  eyebrow: string;
  description: string;
  tip: string;
  options: string[];
  selected: string[];
  minimum: number;
  suggestions: string[];
};

const BASE_SEARCH_SUGGESTIONS = [
  "Desain",
  "Kesehatan",
  "Hukum",
  "Bisnis",
  "Pendidikan",
  "Pertanian",
  "Seni",
  "Olahraga",
  "Kuliner",
  "Data",
  "Bahasa",
  "Agama",
];

const STEP_ACCENTS: Record<WizardStepId, {
  text: string;
  badge: string;
  button: string;
  selected: string;
  ring: string;
  soft: string;
  gradient: string;
}> = {
  minat: {
    text: "text-sky-600",
    badge: "bg-sky-50 text-sky-700 ring-sky-100",
    button: "bg-sky-50 text-sky-700 ring-sky-100 hover:bg-sky-600 hover:text-white",
    selected: "border-cyan-300 bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-sky-700/25",
    ring: "focus:border-sky-500 focus:ring-sky-100",
    soft: "border-sky-100 bg-sky-50",
    gradient: "from-[#08224f] via-[#0a54c7] to-[#39d9ff]",
  },
  hobi: {
    text: "text-sky-600",
    badge: "bg-sky-50 text-sky-700 ring-sky-100",
    button: "bg-sky-50 text-sky-700 ring-sky-100 hover:bg-sky-600 hover:text-white",
    selected: "border-cyan-300 bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-sky-700/25",
    ring: "focus:border-sky-500 focus:ring-sky-100",
    soft: "border-sky-100 bg-sky-50",
    gradient: "from-[#08224f] via-[#0a54c7] to-[#39d9ff]",
  },
  bakat: {
    text: "text-sky-600",
    badge: "bg-sky-50 text-sky-700 ring-sky-100",
    button: "bg-sky-50 text-sky-700 ring-sky-100 hover:bg-sky-600 hover:text-white",
    selected: "border-cyan-300 bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-sky-700/25",
    ring: "focus:border-sky-500 focus:ring-sky-100",
    soft: "border-sky-100 bg-sky-50",
    gradient: "from-[#08224f] via-[#0a54c7] to-[#39d9ff]",
  },
  pengalaman: {
    text: "text-sky-600",
    badge: "bg-sky-50 text-sky-700 ring-sky-100",
    button: "bg-sky-50 text-sky-700 ring-sky-100 hover:bg-sky-600 hover:text-white",
    selected: "border-cyan-300 bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-sky-700/25",
    ring: "focus:border-sky-500 focus:ring-sky-100",
    soft: "border-sky-100 bg-sky-50",
    gradient: "from-[#08224f] via-[#0a54c7] to-[#39d9ff]",
  },
  prestasi: {
    text: "text-sky-600",
    badge: "bg-sky-50 text-sky-700 ring-sky-100",
    button: "bg-sky-50 text-sky-700 ring-sky-100 hover:bg-sky-600 hover:text-white",
    selected: "border-cyan-300 bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-sky-700/25",
    ring: "focus:border-sky-500 focus:ring-sky-100",
    soft: "border-sky-100 bg-sky-50",
    gradient: "from-[#08224f] via-[#0a54c7] to-[#39d9ff]",
  },
  tujuan: {
    text: "text-sky-600",
    badge: "bg-sky-50 text-sky-700 ring-sky-100",
    button: "bg-sky-50 text-sky-700 ring-sky-100 hover:bg-sky-600 hover:text-white",
    selected: "border-cyan-300 bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-sky-700/25",
    ring: "focus:border-sky-500 focus:ring-sky-100",
    soft: "border-sky-100 bg-sky-50",
    gradient: "from-[#08224f] via-[#0a54c7] to-[#39d9ff]",
  },
};

function uniqueOptions(options: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const option of options) {
    const label = String(option ?? "").trim();
    if (!label) continue;

    const key = label.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(label);
  }

  return result;
}

function selectedSummary(profile: StudentProfileForm, prestasiRows: StudentAchievement[]) {
  return [
    { label: "Minat", value: profile.interests.length },
    { label: "Hobi", value: profile.hobbies.length },
    { label: "Bakat", value: profile.talents.length },
    { label: "Pengalaman", value: profile.experiences.length },
    { label: "Prestasi", value: prestasiRows.length },
  ];
}

function ChoiceWizardStep({
  config,
  onToggle,
}: {
  config: ChoiceStepConfig;
  onToggle: (field: ArrayField, value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [visibleLimit, setVisibleLimit] = useState(72);

  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const words = keyword.split(/\s+/).filter(Boolean);

    return config.options.filter((option) => {
      const label = option.toLowerCase();
      return words.length ? words.every((word) => label.includes(word)) : true;
    });
  }, [config.options, query]);

  const visibleOptions = useMemo(() => {
    const pinned = config.selected.filter(
      (item) => !filteredOptions.some((option) => option.toLowerCase() === item.toLowerCase()),
    );

    return uniqueOptions([...pinned, ...filteredOptions]).slice(0, visibleLimit);
  }, [config.selected, filteredOptions, visibleLimit]);

  function handleSearch(value: string) {
    setQuery(value);
    setVisibleLimit(value.trim() ? 96 : 72);
  }

  const accent = STEP_ACCENTS[config.id];

  return (
    <div key={config.id} className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px] skilllens-page-enter">
      <div className="rounded-[1.8rem] border border-sky-100/80 bg-white/75 p-4 shadow-lg shadow-sky-950/5 backdrop-blur-md md:p-5 skilllens-smooth-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent.text}`}>
              {config.eyebrow}
            </p>
            <h3 className="mt-2 text-xl font-bold text-slate-950">
              {config.title}
            </h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              {config.description}
            </p>
          </div>

          <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${accent.badge}`}>
            {config.selected.length} dipilih • {config.options.length} opsi
          </span>
        </div>

        <div className="mt-5 rounded-3xl bg-white/80 p-3 ring-1 ring-sky-100 backdrop-blur">
          <label className="relative block">
            <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder={`Cari ${config.title.toLowerCase()}...`}
              className={`w-full rounded-2xl border border-sky-100 bg-white/90 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-4 skilllens-smooth ${accent.ring}`}
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            {config.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSearch(suggestion)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 skilllens-smooth hover:-translate-y-0.5 ${accent.button}`}
              >
                {suggestion}
              </button>
            ))}
            {query ? (
              <button
                type="button"
                onClick={() => handleSearch("")}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 skilllens-smooth hover:bg-slate-200"
              >
                Reset pencarian
              </button>
            ) : null}
          </div>
        </div>

        {config.selected.length ? (
          <div className={`mt-4 rounded-3xl border p-4 ${accent.soft}`}>
            <p className={`text-xs font-bold uppercase tracking-[0.18em] ${accent.text}`}>
              Pilihan kamu
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {config.selected.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onToggle(config.field, item)}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-white shadow-sm skilllens-smooth hover:-translate-y-0.5 ${accent.selected}`}
                >
                  {item}
                  <Icon name="x" className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-slate-400">
          <span>
            Menampilkan {visibleOptions.length} dari {filteredOptions.length} hasil cocok
          </span>
          <span>Klik beberapa yang paling menggambarkan kamu</span>
        </div>

        <div className="mt-3 grid max-h-[430px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3 skilllens-page-enter">
          {visibleOptions.map((option) => {
            const active = config.selected.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() => onToggle(config.field, option)}
                className={`group rounded-2xl border p-3 text-left text-sm font-semibold leading-5 skilllens-smooth ${
                  active
                    ? accent.selected
                    : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700 hover:shadow-md"
                }`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span>{option}</span>
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] ${
                      active
                        ? "border-white bg-white text-sky-700"
                        : "border-slate-200 text-slate-300 group-hover:border-sky-200 group-hover:text-sky-600"
                    }`}
                  >
                    {active ? "✓" : "+"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {visibleOptions.length < filteredOptions.length ? (
          <button
            type="button"
            onClick={() => setVisibleLimit((current) => current + 96)}
            className="mt-4 rounded-full border border-cyan-100 bg-white px-4 py-2 text-xs font-bold text-sky-700 skilllens-smooth hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"
          >
            Tampilkan lebih banyak
          </button>
        ) : null}

        {!visibleOptions.length ? (
          <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold text-slate-500 ring-1 ring-slate-100">
            Belum ada hasil yang cocok. Coba kata kunci lain, misalnya desain,
            kesehatan, hukum, bisnis, kuliner, atau pendidikan.
          </div>
        ) : null}
      </div>

      <aside className="rounded-[1.8rem] border border-sky-100/80 bg-white/[0.78] p-5 shadow-lg shadow-sky-950/5 backdrop-blur-md skilllens-smooth-card">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${accent.gradient} text-white shadow-lg shadow-slate-950/20`}>
          <Icon name="sparkles" className="h-5 w-5 skilllens-float" />
        </div>
        <h4 className="mt-4 text-base font-bold text-slate-950">
          Tips mengisi
        </h4>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          {config.tip}
        </p>

        <div className="mt-5 rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Saran
          </p>
          <ul className="mt-3 space-y-2 text-xs font-semibold leading-5 text-slate-500">
            <li>• Pilih yang benar-benar kamu suka atau pernah kamu lakukan.</li>
            <li>• Boleh pilih lintas bidang, misalnya desain dan kesehatan.</li>
            <li>• Semakin jujur, hasil rekomendasi akan semakin akurat.</li>
          </ul>
        </div>

        {config.minimum > 0 && config.selected.length < config.minimum ? (
          <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-700 ring-1 ring-amber-100">
            Minimal pilih {config.minimum} agar bisa lanjut dengan data yang cukup.
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-700 ring-1 ring-emerald-100">
            Langkah ini sudah cukup. Kamu bisa lanjut ke tahap berikutnya.
          </div>
        )}
      </aside>
    </div>
  );
}

function GoalStep({
  profile,
  onChangeProfile,
}: {
  profile: StudentProfileForm;
  onChangeProfile: (patch: Partial<StudentProfileForm>) => void;
}) {
  const accent = STEP_ACCENTS.tujuan;
  const goals = [
    {
      id: "kuliah",
      title: "Kuliah",
      icon: "graduation",
      description: "Cari jurusan atau program studi yang paling cocok dengan nilai, minat, bakat, pengalaman, dan prestasimu.",
    },
    {
      id: "kerja",
      title: "Kerja",
      icon: "briefcase",
      description: "Cari arah pekerjaan awal yang realistis dan sesuai potensi setelah lulus sekolah.",
    },
    {
      id: "wirausaha",
      title: "Wirausaha",
      icon: "building",
      description: "Cari ide bidang usaha yang cocok dengan kemampuan, kebiasaan, dan pengalamanmu.",
    },
  ];

  return (
    <div className="mt-6 rounded-[1.8rem] border border-sky-100/80 bg-white/[0.78] p-5 shadow-lg shadow-sky-950/5 backdrop-blur-md skilllens-page-enter">
      <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent.text}`}>
        Tahap Terakhir
      </p>
      <h3 className="mt-2 text-xl font-bold text-slate-950">
        Pilih tujuan karirmu
      </h3>
      <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
        Tujuan ini akan menentukan jenis alternatif yang dihitung SPK: jurusan kuliah, pekerjaan, atau peluang wirausaha.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {goals.map((goal) => {
          const active = profile.goal === goal.id;

          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => onChangeProfile({ goal: goal.id })}
              className={`rounded-[1.5rem] border p-5 text-left skilllens-smooth hover:-translate-y-1 ${
                active
                  ? `border-cyan-300 bg-gradient-to-br ${accent.gradient} text-white shadow-xl shadow-sky-700/25`
                  : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
              }`}
            >
              <div className={`grid h-11 w-11 place-items-center rounded-2xl ${active ? "bg-white/20" : "bg-sky-50 text-sky-700"}`}>
                <Icon name={goal.icon} className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-base font-bold">{goal.title}</h4>
              <p className={`mt-2 text-sm font-semibold leading-6 ${active ? "text-sky-50" : "text-slate-500"}`}>
                {goal.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-3xl bg-white p-4 text-sm font-semibold leading-6 text-slate-500 ring-1 ring-slate-100">
        Setelah kamu klik <span className="font-bold text-slate-800">Simpan Profil</span>, data akan tersimpan dulu. Setelah itu lanjut ke halaman rekomendasi untuk memproses SPK dengan animasi tunggu.
      </div>
    </div>
  );
}

function AchievementStep({
  prestasiRows,
  achievementSaving,
  onOpenModal,
  onDeleteAchievement,
  onDelete,
}: {
  prestasiRows: StudentAchievement[];
  achievementSaving: boolean;
  onOpenModal: () => void;
  onDeleteAchievement?: (id: number) => Promise<void>;
  onDelete: (id?: number) => void;
}) {
  return (
    <div className="mt-6 rounded-[1.8rem] border border-sky-100/80 bg-white/[0.78] p-5 shadow-lg shadow-sky-950/5 backdrop-blur-md skilllens-page-enter">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
            Bukti Pendukung
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-950">
            Tambahkan prestasi yang pernah kamu dapatkan
          </h3>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Prestasi bisa berupa lomba, sertifikat, organisasi, karya, proyek, finalis, juara, atau kegiatan lain yang membuktikan kemampuanmu.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenModal}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0a54c7] to-[#39d9ff] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5"
        >
          <Icon name="sparkles" className="h-4 w-4" />
          Tambah Prestasi
        </button>
      </div>

      <div className="mt-5 min-h-40 rounded-3xl bg-white p-4 ring-1 ring-slate-100">
        {prestasiRows.length ? (
          <div className="grid gap-3">
            {prestasiRows.map((item) => (
              <div
                key={item.id ?? item.id_prestasi ?? item.nama_prestasi}
                className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-950">
                      {item.nama_prestasi}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {[item.tingkat, item.tahun, item.penyelenggara]
                        .filter(Boolean)
                        .join(" • ") || "Detail prestasi belum lengkap"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {onDeleteAchievement ? (
                      <button
                        type="button"
                        disabled={achievementSaving}
                        onClick={() => onDelete(item.id_prestasi ?? item.id)}
                        className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-600 hover:text-white disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    ) : null}

                    {item.bukti_url ? (
                      <a
                        href={item.bukti_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-600 hover:text-white"
                      >
                        Lihat bukti
                      </a>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                        Tanpa bukti
                      </span>
                    )}
                  </div>
                </div>

                {item.keterangan ? (
                  <p className="mt-3 text-xs font-semibold leading-6 text-slate-500">
                    {item.keterangan}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-sky-700">
              <Icon name="clipboard" className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-700">
              Belum ada prestasi
            </p>
            <p className="mt-1 max-w-md text-xs font-semibold leading-5 text-slate-400">
              Langkah ini boleh dilewati, tapi prestasi akan menjadi nilai tambah jika ada bukti kemampuan yang relevan.
            </p>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs font-semibold leading-5 text-slate-400">
        Tingkat dan keterangan seperti Juara 1, Nasional, Internasional, Sertifikasi, atau Finalis akan ikut memengaruhi bobot prestasi di SPK.
      </p>
    </div>
  );
}


function ProfileSavingOverlay({ open }: { open: boolean }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#07142f]/[0.55] px-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white/[0.96] p-6 text-center shadow-2xl skilllens-page-enter">
        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-cyan-200/60 blur-3xl" />
        <div className="absolute -bottom-20 -right-14 h-48 w-48 rounded-full bg-blue-300/50 blur-3xl" />
        <div className="relative">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[linear-gradient(135deg,#08224f,#0a54c7,#39d9ff)] text-white shadow-xl shadow-sky-700/30 skilllens-soft-pulse">
            <Icon name="check" className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl font-extrabold text-slate-950">Menyimpan profil</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Sebentar ya, data minat, pengalaman, prestasi, dan tujuan karir sedang diamankan.
          </p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-sky-500 via-sky-500 to-cyan-300 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentProfilePanel({
  profile,
  prestasiRows,
  processing,
  onChangeProfile,
  onToggleArray,
  onSave,
  onProcess,
  onCreateAchievement,
  onDeleteAchievement,
  profileOptions,
  loadingOptions = false,
  processLabel = "Simpan Profil",
}: {
  profile: StudentProfileForm;
  prestasiRows: StudentAchievement[];
  processing: boolean;
  onChangeProfile: (patch: Partial<StudentProfileForm>) => void;
  onToggleArray: (field: ArrayField, value: string) => void;
  onSave: () => void;
  onProcess: () => void;
  onCreateAchievement?: (payload: AchievementPayload) => Promise<void>;
  onDeleteAchievement?: (id: number) => Promise<void>;
  processLabel?: string;
  profileOptions?: ProfileOptions;
  loadingOptions?: boolean;
}) {
  const [activeStep, setActiveStep] = useState<WizardStepId>("minat");
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [achievementSaving, setAchievementSaving] = useState(false);
  const [achievementError, setAchievementError] = useState("");
  const [achievementForm, setAchievementForm] = useState({
    nama_prestasi: "",
    tingkat: "Lokal",
    tahun: new Date().getFullYear().toString(),
    penyelenggara: "",
    keterangan: "",
    bukti_url: "",
  });

  const resolvedInterestOptions = uniqueOptions(
    profileOptions?.interestOptions?.length
      ? profileOptions.interestOptions
      : [...fallbackInterestOptions],
  );
  const resolvedHobbyOptions = uniqueOptions(
    profileOptions?.hobbyOptions?.length
      ? profileOptions.hobbyOptions
      : [...fallbackHobbyOptions],
  );
  const resolvedTalentOptions = uniqueOptions(
    profileOptions?.talentOptions?.length
      ? profileOptions.talentOptions
      : [...fallbackTalentOptions],
  );
  const resolvedExperienceOptions = uniqueOptions(
    profileOptions?.experienceOptions?.length
      ? profileOptions.experienceOptions
      : [...fallbackExperienceOptions],
  );

  const steps = useMemo(
    () => [
      {
        id: "minat" as const,
        label: "Minat",
        short: "1",
        description: "Apa yang paling menarik buat kamu?",
      },
      {
        id: "hobi" as const,
        label: "Hobi",
        short: "2",
        description: "Aktivitas yang sering kamu lakukan.",
      },
      {
        id: "bakat" as const,
        label: "Bakat",
        short: "3",
        description: "Kemampuan yang kamu rasa kuat.",
      },
      {
        id: "pengalaman" as const,
        label: "Pengalaman",
        short: "4",
        description: "Hal yang pernah kamu coba.",
      },
      {
        id: "prestasi" as const,
        label: "Prestasi",
        short: "5",
        description: "Bukti pendukung potensi.",
      },
      {
        id: "tujuan" as const,
        label: "Tujuan",
        short: "6",
        description: "Kuliah, kerja, atau wirausaha.",
      },
    ],
    [],
  );

  const currentStepIndex = steps.findIndex((step) => step.id === activeStep);
  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  const choiceStepConfigs: Record<ChoiceStepConfig["id"], ChoiceStepConfig> = {
    minat: {
      id: "minat",
      field: "interests",
      title: "Pilih minat kamu",
      eyebrow: "Langkah 1 dari 6",
      description: "Mulai dari hal yang paling kamu sukai atau bidang yang bikin kamu penasaran.",
      tip: "Minat dibuat paling penting karena ini menentukan arah utama rekomendasi. Pilih minimal satu, lebih bagus 3 sampai 8 pilihan.",
      options: resolvedInterestOptions,
      selected: profile.interests,
      minimum: 1,
      suggestions: BASE_SEARCH_SUGGESTIONS,
    },
    hobi: {
      id: "hobi",
      field: "hobbies",
      title: "Pilih hobi kamu",
      eyebrow: "Langkah 2 dari 6",
      description: "Hobi membantu sistem membaca kebiasaan dan aktivitas alami yang kamu nikmati.",
      tip: "Hobi bukan penentu utama, tapi bisa membantu membedakan dua rekomendasi yang skornya dekat.",
      options: resolvedHobbyOptions,
      selected: profile.hobbies,
      minimum: 0,
      suggestions: ["Menulis", "Menggambar", "Musik", "Olahraga", "Membaca", "Memasak", "Gaming", "Fotografi", "Organisasi", "Merawat", "Berkebun", "Video"],
    },
    bakat: {
      id: "bakat",
      field: "talents",
      title: "Pilih bakat atau kemampuan kamu",
      eyebrow: "Langkah 3 dari 6",
      description: "Pilih kemampuan yang kamu rasa cukup kuat, sering dipuji, atau mudah kamu pelajari.",
      tip: "Bakat membantu SPK membedakan antara sekadar suka dan benar-benar punya potensi untuk berkembang di bidang itu.",
      options: resolvedTalentOptions,
      selected: profile.talents,
      minimum: 0,
      suggestions: ["Komunikasi", "Logika", "Desain", "Analisis", "Mengajar", "Menulis", "Manajemen", "Kesehatan", "Akuntansi", "Mekanik", "Bahasa", "Kreatif"],
    },
    pengalaman: {
      id: "pengalaman",
      field: "experiences",
      title: "Pilih pengalaman kamu",
      eyebrow: "Langkah 4 dari 6",
      description: "Masukkan pengalaman sekolah, organisasi, lomba, proyek, magang, atau kegiatan pribadi.",
      tip: "Pengalaman membuat rekomendasi lebih realistis karena sistem tahu apa yang sudah pernah kamu kerjakan.",
      options: resolvedExperienceOptions,
      selected: profile.experiences,
      minimum: 0,
      suggestions: ["Organisasi", "Lomba", "Magang", "Proyek", "Desain", "Riset", "Jualan", "Kesehatan", "Debat", "Mengajar", "Konten", "Admin"],
    },
  };

  const activeChoiceConfig =
    activeStep === "minat" || activeStep === "hobi" || activeStep === "bakat" || activeStep === "pengalaman"
      ? choiceStepConfigs[activeStep]
      : null;

  const canGoNext = !activeChoiceConfig || activeChoiceConfig.selected.length >= activeChoiceConfig.minimum;
  const isLastStep = currentStepIndex === steps.length - 1;
  const mainProfileComplete = profile.interests.length > 0 && Boolean(profile.goal);

  function stepIsFilled(stepId: WizardStepId) {
    if (stepId === "minat") return profile.interests.length > 0;
    if (stepId === "hobi") return profile.hobbies.length > 0;
    if (stepId === "bakat") return profile.talents.length > 0;
    if (stepId === "pengalaman") return profile.experiences.length > 0;
    if (stepId === "prestasi") return prestasiRows.length > 0;
    return Boolean(profile.goal);
  }

  function goNext() {
    if (!canGoNext) return;
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) setActiveStep(nextStep.id);
  }

  function goBack() {
    const previousStep = steps[currentStepIndex - 1];
    if (previousStep) setActiveStep(previousStep.id);
  }

  function updateAchievementForm(key: keyof typeof achievementForm, value: string) {
    setAchievementForm((current) => ({ ...current, [key]: value }));
  }

  async function submitAchievement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nama = achievementForm.nama_prestasi.trim();
    if (!nama) {
      setAchievementError("Nama prestasi wajib diisi.");
      return;
    }

    setAchievementSaving(true);
    setAchievementError("");
    try {
      await onCreateAchievement?.({
        nama_prestasi: nama,
        tingkat: achievementForm.tingkat || null,
        tahun: achievementForm.tahun || null,
        penyelenggara: achievementForm.penyelenggara.trim() || null,
        keterangan: achievementForm.keterangan.trim() || null,
        bukti_url: achievementForm.bukti_url.trim() || null,
      });
      setAchievementForm({
        nama_prestasi: "",
        tingkat: "Lokal",
        tahun: new Date().getFullYear().toString(),
        penyelenggara: "",
        keterangan: "",
        bukti_url: "",
      });
      setAchievementModalOpen(false);
    } catch (err) {
      setAchievementError(err instanceof Error ? err.message : "Gagal menambah prestasi.");
    } finally {
      setAchievementSaving(false);
    }
  }

  async function handleDeleteAchievement(id?: number) {
    if (!id || !onDeleteAchievement) return;
    const confirmed = window.confirm("Hapus prestasi ini?");
    if (!confirmed) return;
    setAchievementSaving(true);
    try {
      await onDeleteAchievement(id);
    } finally {
      setAchievementSaving(false);
    }
  }

  function handleFinalSave() {
    onSave();
  }

  return (
    <Panel id="profil" className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-blue-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 rounded-full bg-cyan-200/[0.35] blur-3xl" />
      <div className="relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <SectionTitle
          eyebrow="Profil Potensi"
          title="Isi profil secara bertahap"
          description={
            loadingOptions
              ? "Memuat pilihan dari master tag database..."
              : "Jawab dari minat sampai tujuan karir. Setiap langkah dibuat seperti wizard supaya tidak terasa penuh walau datanya banyak."
          }
        />

        <span className="w-fit rounded-full bg-sky-50 px-4 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
          {profile.name || "Siswa"}
        </span>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-white/80 bg-white/70 p-4 shadow-inner shadow-sky-100/50 backdrop-blur skilllens-fade-slide">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {mainProfileComplete ? "Data utama sudah lengkap" : `Progress pengisian ${progressPercent}%`}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {mainProfileComplete ? "Kamu sudah bisa menyimpan profil dan melanjutkan ke rekomendasi." : `Langkah ${currentStepIndex + 1} dari ${steps.length}: ${steps[currentStepIndex]?.description}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedSummary(profile, prestasiRows).map((item) => (
              <span
                key={item.label}
                className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-100"
              >
                {item.label}: {item.value}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#08224f] via-[#0a54c7] to-[#39d9ff] transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {steps.map((step, index) => {
            const active = step.id === activeStep;
            const done = stepIsFilled(step.id) || index < currentStepIndex;
            const optionalEmpty = (step.id === "hobi" || step.id === "bakat" || step.id === "pengalaman" || step.id === "prestasi") && !stepIsFilled(step.id);

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`rounded-2xl border p-3 text-left skilllens-smooth hover:-translate-y-1 ${
                  active
                    ? "border-sky-300 bg-white text-sky-700 shadow-md"
                    : done
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : optionalEmpty
                        ? "border-amber-100 bg-amber-50/70 text-amber-700 hover:bg-white"
                        : "border-white bg-white/70 text-slate-500 hover:bg-white"
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-bold">
                  <span className={`grid h-6 w-6 place-items-center rounded-full ${active ? "bg-sky-600 text-white" : done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {done ? "✓" : optionalEmpty ? "•" : step.short}
                  </span>
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeChoiceConfig ? (
        <ChoiceWizardStep config={activeChoiceConfig} onToggle={onToggleArray} />
      ) : activeStep === "prestasi" ? (
        <AchievementStep
          prestasiRows={prestasiRows}
          achievementSaving={achievementSaving}
          onOpenModal={() => {
            setAchievementError("");
            setAchievementModalOpen(true);
          }}
          onDeleteAchievement={onDeleteAchievement}
          onDelete={handleDeleteAchievement}
        />
      ) : (
        <GoalStep profile={profile} onChangeProfile={onChangeProfile} />
      )}

      <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-sky-100 bg-white/80 p-4 shadow-sm shadow-sky-950/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStepIndex === 0 || processing}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-100 bg-white px-5 py-3 text-sm font-bold text-slate-700 skilllens-smooth hover:-translate-y-0.5 hover:border-cyan-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="arrowLeft" className="h-4 w-4" />
          Kembali
        </button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {!canGoNext ? (
            <span className="rounded-full bg-amber-50 px-4 py-2 text-center text-xs font-bold text-amber-700 ring-1 ring-amber-100">
              Pilih minimal {activeChoiceConfig?.minimum} data untuk lanjut
            </span>
          ) : null}

          {isLastStep ? (
            <button
              type="button"
              onClick={handleFinalSave}
              disabled={processing || !canGoNext}
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 skilllens-button-primary skilllens-shimmer"
            >
              <Icon name="check" className="h-4 w-4" />
              {processing ? "Menyimpan..." : processLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext || processing}
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 skilllens-button-primary skilllens-shimmer"
            >
              Lanjut
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      </div>

      <ProfileSavingOverlay open={processing} />

      {achievementModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07142f]/[0.55] px-4 py-6 backdrop-blur-md">
          <form
            onSubmit={submitAchievement}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.9rem] bg-white/[0.96] p-6 shadow-2xl skilllens-page-enter"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Prestasi Siswa</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">Tambah prestasi</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">Isi tingkat dan keterangan supaya bobot prestasi di SPK lebih akurat.</p>
              </div>
              <button
                type="button"
                onClick={() => setAchievementModalOpen(false)}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>

            {achievementError ? (
              <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
                {achievementError}
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Nama prestasi</span>
                <input
                  value={achievementForm.nama_prestasi}
                  onChange={(event) => updateAchievementForm("nama_prestasi", event.target.value)}
                  placeholder="Contoh: Juara 1 Lomba Web Design"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Tingkat</span>
                <select
                  value={achievementForm.tingkat}
                  onChange={(event) => updateAchievementForm("tingkat", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                >
                  <option value="Sekolah">Sekolah</option>
                  <option value="Lokal">Lokal</option>
                  <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                  <option value="Provinsi">Provinsi</option>
                  <option value="Nasional">Nasional</option>
                  <option value="Internasional">Internasional</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Tahun</span>
                <input
                  value={achievementForm.tahun}
                  onChange={(event) => updateAchievementForm("tahun", event.target.value)}
                  placeholder="2026"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Penyelenggara</span>
                <input
                  value={achievementForm.penyelenggara}
                  onChange={(event) => updateAchievementForm("penyelenggara", event.target.value)}
                  placeholder="Contoh: Dinas Pendidikan / Kampus / Sekolah"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Keterangan / jenis prestasi</span>
                <textarea
                  value={achievementForm.keterangan}
                  onChange={(event) => updateAchievementForm("keterangan", event.target.value)}
                  placeholder="Contoh: Juara 1, kategori lomba aplikasi, finalis, sertifikasi kompetensi, organisasi, karya ilmiah, dll."
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Link bukti (opsional)</span>
                <input
                  value={achievementForm.bukti_url}
                  onChange={(event) => updateAchievementForm("bukti_url", event.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setAchievementModalOpen(false)}
                disabled={achievementSaving}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={achievementSaving}
                className="rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700 disabled:opacity-50"
              >
                {achievementSaving ? "Menyimpan..." : "Simpan Prestasi"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </Panel>
  );
}
