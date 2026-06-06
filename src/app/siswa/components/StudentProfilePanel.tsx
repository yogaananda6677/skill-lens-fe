"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  bukti_file?: File | null;
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
  maximum: number;
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

const PROFILE_CHOICE_MIN = 1;
const PROFILE_CHOICE_MAX = 4;
const ACHIEVEMENT_MAX = 4;
const ACHIEVEMENT_NAME_MIN = 6;
const ACHIEVEMENT_TEXT_MIN = 3;
const ACHIEVEMENT_DESC_MIN = 10;

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


function onlySafeText(value: string) {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

function validateAchievementInput(form: {
  nama_prestasi: string;
  tingkat: string;
  tahun: string;
  penyelenggara: string;
  keterangan: string;
}) {
  const currentYear = new Date().getFullYear();
  const nama = onlySafeText(form.nama_prestasi);
  const penyelenggara = onlySafeText(form.penyelenggara);
  const keterangan = onlySafeText(form.keterangan);
  const tahun = onlySafeText(form.tahun);

  if (!nama) return "Nama prestasi wajib diisi.";
  if (nama.length < ACHIEVEMENT_NAME_MIN) return `Nama prestasi minimal ${ACHIEVEMENT_NAME_MIN} karakter.`;
  if (!/^[a-zA-Z0-9À-ÿ\s.,()\-\/]+$/.test(nama)) return "Nama prestasi hanya boleh berisi huruf, angka, spasi, titik, koma, kurung, garis miring, dan tanda hubung.";
  if (!tahun) return "Tahun prestasi wajib diisi.";
  if (!/^\d{4}$/.test(tahun)) return "Tahun harus 4 digit, contoh 2026.";
  const yearNumber = Number(tahun);
  if (yearNumber < 1990 || yearNumber > currentYear + 1) return `Tahun harus di antara 1990 sampai ${currentYear + 1}.`;
  if (penyelenggara && penyelenggara.length < ACHIEVEMENT_TEXT_MIN) return `Penyelenggara minimal ${ACHIEVEMENT_TEXT_MIN} karakter jika diisi.`;
  if (keterangan && keterangan.length < ACHIEVEMENT_DESC_MIN) return `Keterangan minimal ${ACHIEVEMENT_DESC_MIN} karakter jika diisi.`;

  return "";
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
  const maxReached = config.selected.length >= config.maximum;

  return (
    <div key={config.id} className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px] skilllens-page-enter">
      <div className="relative overflow-hidden rounded-[1.8rem] p-4 shadow-xl shadow-sky-950/7 skilllens-smooth-card">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)]" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="relative">
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
            {config.selected.length}/{config.maximum} dipilih • {config.options.length} opsi
          </span>
        </div>

        <div className="mt-5 rounded-3xl border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#edf8ff_100%)] p-3 shadow-sm shadow-sky-950/5 ring-1 ring-sky-50 backdrop-blur">
          <label className="relative block">
            <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder={`Cari ${config.title.toLowerCase()}...`}
              className={`w-full rounded-2xl border border-sky-200 bg-white/95 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-4 skilllens-smooth ${accent.ring}`}
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
          <span>Pilih minimal {config.minimum} dan maksimal {config.maximum}</span>
        </div>

        <div className="mt-3 grid max-h-[430px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3 skilllens-page-enter">
          {visibleOptions.map((option) => {
            const active = config.selected.includes(option);
            const disabled = !active && maxReached;

            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  onToggle(config.field, option);
                }}
                className={`group rounded-2xl border p-3 text-left text-sm font-semibold leading-5 skilllens-smooth ${
                  active
                    ? accent.selected
                    : disabled
                      ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 opacity-70"
                      : "border-sky-200 bg-[linear-gradient(180deg,#ffffff_0%,#f2f9ff_100%)] text-slate-700 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-[linear-gradient(180deg,#f9fdff_0%,#eaf7ff_100%)] hover:text-sky-700 hover:shadow-md hover:shadow-sky-950/7"
                }`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span>{option}</span>
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] ${
                      active
                        ? "border-white bg-white text-sky-700"
                        : disabled
                          ? "border-slate-100 bg-white text-slate-300"
                          : "border-slate-200 text-slate-300 group-hover:border-sky-200 group-hover:text-sky-600"
                    }`}
                  >
                    {active ? "✓" : disabled ? "•" : "+"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {maxReached ? (
          <div className="mt-4 rounded-2xl bg-sky-50 p-3 text-xs font-bold leading-5 text-sky-700 ring-1 ring-sky-100">
            Maksimal {config.maximum} pilihan. Hapus salah satu pilihan dulu kalau ingin mengganti.
          </div>
        ) : null}

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
          <div className="mt-4 rounded-2xl border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#eef8ff_100%)] p-4 text-sm font-semibold text-slate-500 ring-1 ring-sky-50">
            Belum ada hasil yang cocok. Coba kata kunci lain, misalnya desain,
            kesehatan, hukum, bisnis, kuliner, atau pendidikan.
          </div>
        ) : null}
        </div>
      </div>

      <aside className="relative overflow-hidden rounded-[1.8rem] border border-sky-200/80 bg-[linear-gradient(180deg,#f0faff_0%,#ffffff_58%,#eef8ff_100%)] p-5 shadow-xl shadow-sky-950/7 ring-1 ring-sky-50 backdrop-blur-md skilllens-smooth-card">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="relative">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${accent.gradient} text-white shadow-lg shadow-slate-950/20`}>
          <Icon name="sparkles" className="h-5 w-5 skilllens-float" />
        </div>
        <h4 className="mt-4 text-base font-bold text-slate-950">
          Tips mengisi
        </h4>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          {config.tip}
        </p>

        <div className="mt-5 rounded-3xl border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#edf8ff_100%)] p-4 shadow-sm shadow-sky-950/5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Saran
          </p>
          <ul className="mt-3 space-y-2 text-xs font-semibold leading-5 text-slate-500">
            <li>• Pilih yang benar-benar kamu suka atau pernah kamu lakukan.</li>
            <li>• Boleh pilih lintas bidang, misalnya desain dan kesehatan.</li>
            <li>• Semakin jujur, hasil rekomendasi akan semakin akurat.</li>
          </ul>
        </div>

        {config.selected.length < config.minimum ? (
          <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-700 ring-1 ring-amber-100">
            Minimal pilih {config.minimum} agar bisa lanjut dengan data yang cukup.
          </div>
        ) : config.selected.length > config.maximum ? (
          <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-xs font-bold leading-5 text-rose-700 ring-1 ring-rose-100">
            Maksimal hanya {config.maximum} pilihan. Kurangi dulu pilihan yang kurang relevan.
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-700 ring-1 ring-emerald-100">
            Langkah ini sudah cukup. Kamu bisa lanjut ke tahap berikutnya.
          </div>
        )}
        </div>
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
    <div className="relative mt-6 overflow-hidden rounded-[1.8rem] border border-sky-200/80 bg-[linear-gradient(180deg,#f2fbff_0%,#ffffff_52%,#eaf7ff_100%)] p-5 shadow-xl shadow-sky-950/7 ring-1 ring-sky-50 backdrop-blur-md skilllens-page-enter">
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
                  : "border-sky-200 bg-[linear-gradient(180deg,#ffffff_0%,#f2f9ff_100%)] text-slate-700 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-[linear-gradient(180deg,#f9fdff_0%,#eaf7ff_100%)] hover:shadow-md hover:shadow-sky-950/7"
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
  onDelete: (id?: number, title?: string) => void;
}) {
  const maxReached = prestasiRows.length >= ACHIEVEMENT_MAX;

  return (
    <div className="relative mt-6 overflow-hidden rounded-[1.8rem] border border-sky-200/80 bg-[linear-gradient(180deg,#f2fbff_0%,#ffffff_52%,#eaf7ff_100%)] p-5 shadow-xl shadow-sky-950/7 ring-1 ring-sky-50 backdrop-blur-md skilllens-page-enter">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
            Bukti Pendukung
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-950">
            Tambahkan prestasi yang pernah kamu dapatkan
          </h3>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Prestasi ini opsional. Isi kalau kamu punya lomba, sertifikat, organisasi, karya, proyek, finalis, juara, atau kegiatan lain. Maksimal {ACHIEVEMENT_MAX} prestasi.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenModal}
          disabled={maxReached || achievementSaving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0a54c7] to-[#39d9ff] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="sparkles" className="h-4 w-4" />
          {maxReached ? "Maksimal 4 Prestasi" : "Tambah Prestasi"}
        </button>
      </div>

      <div className="mt-5 min-h-40 rounded-3xl border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#edf8ff_100%)] p-4 shadow-sm shadow-sky-950/5 ring-1 ring-sky-50">
        {prestasiRows.length ? (
          <div className="grid gap-3">
            {prestasiRows.map((item) => (
              <div
                key={item.id ?? item.id_prestasi ?? item.nama_prestasi}
                className="rounded-2xl border border-sky-200 bg-[linear-gradient(180deg,#ffffff_0%,#f1f9ff_100%)] p-4 shadow-sm shadow-sky-950/5"
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
                        onClick={() => onDelete(item.id_prestasi ?? item.id, item.nama_prestasi)}
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
          <div className="rounded-3xl border border-sky-100 bg-sky-50/50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:text-left">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-sky-700 shadow-sm ring-1 ring-sky-100">
                <Icon name="clipboard" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Belum ada prestasi
                </p>
                <p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-slate-500">
                  Bagian ini boleh dilewati. Kalau ada sertifikat atau bukti prestasi, tekan tombol Tambah Prestasi di atas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {maxReached ? (
        <div className="mt-3 rounded-2xl bg-sky-50 p-3 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
          Batas prestasi sudah mencapai {ACHIEVEMENT_MAX}. Hapus salah satu jika ingin mengganti data.
        </div>
      ) : null}

      <p className="mt-3 text-xs font-semibold leading-5 text-slate-400">
        Tingkat dan keterangan seperti Juara 1, Nasional, Internasional, Sertifikasi, atau Finalis akan ikut memengaruhi bobot prestasi di SPK.
      </p>
    </div>
  );
}


function StudentModalPortal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;

  return createPortal(children, document.body);
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
  const [deleteAchievementTarget, setDeleteAchievementTarget] = useState<{ id: number; title: string } | null>(null);
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
  const [achievementFile, setAchievementFile] = useState<File | null>(null);

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
      tip: "Minat dibuat paling penting karena ini menentukan arah utama rekomendasi. Pilih 1 sampai 4 pilihan yang paling menggambarkan kamu.",
      options: resolvedInterestOptions,
      selected: profile.interests,
      minimum: PROFILE_CHOICE_MIN,
      maximum: PROFILE_CHOICE_MAX,
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
      minimum: PROFILE_CHOICE_MIN,
      maximum: PROFILE_CHOICE_MAX,
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
      minimum: PROFILE_CHOICE_MIN,
      maximum: PROFILE_CHOICE_MAX,
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
      minimum: PROFILE_CHOICE_MIN,
      maximum: PROFILE_CHOICE_MAX,
      suggestions: ["Organisasi", "Lomba", "Magang", "Proyek", "Desain", "Riset", "Jualan", "Kesehatan", "Debat", "Mengajar", "Konten", "Admin"],
    },
  };

  const activeChoiceConfig =
    activeStep === "minat" || activeStep === "hobi" || activeStep === "bakat" || activeStep === "pengalaman"
      ? choiceStepConfigs[activeStep]
      : null;

  const canGoNext = !activeChoiceConfig || (
    activeChoiceConfig.selected.length >= activeChoiceConfig.minimum &&
    activeChoiceConfig.selected.length <= activeChoiceConfig.maximum
  );
  const isLastStep = currentStepIndex === steps.length - 1;
  const hasValidChoiceCount = (items: string[]) =>
    items.length >= PROFILE_CHOICE_MIN && items.length <= PROFILE_CHOICE_MAX;
  const mainProfileComplete =
    hasValidChoiceCount(profile.interests) &&
    hasValidChoiceCount(profile.hobbies) &&
    hasValidChoiceCount(profile.talents) &&
    hasValidChoiceCount(profile.experiences) &&
    Boolean(profile.goal);

  function stepIsFilled(stepId: WizardStepId) {
    if (stepId === "minat") return hasValidChoiceCount(profile.interests);
    if (stepId === "hobi") return hasValidChoiceCount(profile.hobbies);
    if (stepId === "bakat") return hasValidChoiceCount(profile.talents);
    if (stepId === "pengalaman") return hasValidChoiceCount(profile.experiences);
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
    const nextValue = value.replace(/[<>]/g, "");
    setAchievementForm((current) => ({ ...current, [key]: nextValue }));
    if (achievementError) setAchievementError("");
  }

  function updateAchievementFile(file?: File | null) {
    if (!file) {
      setAchievementFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setAchievementError("Bukti prestasi harus berupa JPG, PNG, WEBP, atau PDF.");
      setAchievementFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAchievementError("Ukuran bukti maksimal 5 MB.");
      setAchievementFile(null);
      return;
    }

    setAchievementError("");
    setAchievementFile(file);
  }

  async function submitAchievement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (prestasiRows.length >= ACHIEVEMENT_MAX) {
      setAchievementError(`Maksimal hanya ${ACHIEVEMENT_MAX} prestasi.`);
      return;
    }

    const validationMessage = validateAchievementInput(achievementForm);
    if (validationMessage) {
      setAchievementError(validationMessage);
      return;
    }

    const nama = onlySafeText(achievementForm.nama_prestasi);
    const penyelenggara = onlySafeText(achievementForm.penyelenggara);
    const keterangan = onlySafeText(achievementForm.keterangan);
    const tahun = onlySafeText(achievementForm.tahun);

    setAchievementSaving(true);
    setAchievementError("");
    try {
      await onCreateAchievement?.({
        nama_prestasi: nama,
        tingkat: achievementForm.tingkat || null,
        tahun: tahun || null,
        penyelenggara: penyelenggara || null,
        keterangan: keterangan || null,
        bukti_url: achievementForm.bukti_url.trim() || null,
        bukti_file: achievementFile,
      });
      setAchievementForm({
        nama_prestasi: "",
        tingkat: "Lokal",
        tahun: new Date().getFullYear().toString(),
        penyelenggara: "",
        keterangan: "",
        bukti_url: "",
      });
      setAchievementFile(null);
      setAchievementModalOpen(false);
    } catch (err) {
      setAchievementError(err instanceof Error ? err.message : "Gagal menambah prestasi.");
    } finally {
      setAchievementSaving(false);
    }
  }

  function requestDeleteAchievement(id?: number, title?: string) {
    if (!id || !onDeleteAchievement) return;
    setDeleteAchievementTarget({ id, title: title || "Prestasi" });
  }

  async function confirmDeleteAchievement() {
    if (!deleteAchievementTarget || !onDeleteAchievement) return;

    setAchievementSaving(true);
    try {
      await onDeleteAchievement(deleteAchievementTarget.id);
      setDeleteAchievementTarget(null);
    } finally {
      setAchievementSaving(false);
    }
  }

  function handleFinalSave() {
    onSave();
  }

  return (
    <Panel id="profil" className="relative overflow-hidden border-sky-200 bg-[linear-gradient(180deg,#f2fbff_0%,#ffffff_50%,#eaf7ff_100%)] shadow-xl shadow-sky-950/7">
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

      <div className="mt-6 overflow-hidden rounded-[1.7rem] border border-sky-200 bg-white p-4 shadow-xl shadow-sky-950/5 ring-1 ring-sky-50 backdrop-blur skilllens-fade-slide">
        <div className="-mx-4 -mt-4 mb-4 h-1 bg-[linear-gradient(90deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)]" />        
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
                className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100"
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
                    ? "border-sky-300 bg-[linear-gradient(180deg,#ffffff_0%,#e8f6ff_100%)] text-sky-800 shadow-md shadow-sky-950/7"
                    : done
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : optionalEmpty
                        ? "border-amber-100 bg-amber-50/70 text-amber-700 hover:bg-white"
                        : "border-sky-200 bg-[linear-gradient(180deg,#ffffff_0%,#f1f9ff_100%)] text-slate-600 hover:border-cyan-300 hover:bg-[linear-gradient(180deg,#f9fdff_0%,#e8f6ff_100%)]"
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
            if (prestasiRows.length >= ACHIEVEMENT_MAX) {
              setAchievementError(`Maksimal hanya ${ACHIEVEMENT_MAX} prestasi.`);
              return;
            }
            setAchievementError("");
            setAchievementModalOpen(true);
          }}
          onDeleteAchievement={onDeleteAchievement}
          onDelete={(id, title) => requestDeleteAchievement(id, title)}
        />
      ) : (
        <GoalStep profile={profile} onChangeProfile={onChangeProfile} />
      )}

      <div className="mt-6 flex flex-col gap-3 rounded-[1.6rem] border border-sky-200 bg-white p-4 shadow-lg shadow-sky-950/5 ring-1 ring-sky-50 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStepIndex === 0 || processing}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-200 bg-[linear-gradient(180deg,#ffffff_0%,#eef8ff_100%)] px-5 py-3 text-sm font-extrabold text-sky-800 shadow-sm shadow-sky-950/5 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-[linear-gradient(180deg,#f8fcff_0%,#dff3ff_100%)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="arrowLeft" className="h-4 w-4" />
          Kembali
        </button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {!canGoNext ? (
            <span className="rounded-full border border-amber-200 bg-[linear-gradient(180deg,#fffdf5_0%,#fff2cc_100%)] px-4 py-2 text-center text-xs font-extrabold text-amber-800 shadow-sm">
              {activeChoiceConfig &&
              activeChoiceConfig.selected.length > activeChoiceConfig.maximum
                ? `Maksimal ${activeChoiceConfig.maximum} data untuk lanjut`
                : `Pilih minimal ${activeChoiceConfig?.minimum} data untuk lanjut`}
            </span>
          ) : null}

          {isLastStep ? (
            <button
              type="button"
              onClick={handleFinalSave}
              disabled={processing || !canGoNext || !mainProfileComplete}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-700/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="check" className="h-4 w-4" />
              {processing ? "Menyimpan..." : processLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext || processing}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-700/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              Lanjut
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      </div>

      {deleteAchievementTarget ? (
        <StudentModalPortal>
          <div className="fixed inset-0 z-[240] grid place-items-center bg-slate-950/58 px-4 py-6 backdrop-blur-[4px]">
            <button
              type="button"
              onClick={() => (achievementSaving ? undefined : setDeleteAchievementTarget(null))}
              className="absolute inset-0 cursor-default"
              aria-label="Tutup konfirmasi hapus prestasi"
            />

            <section className="relative w-full max-w-md overflow-hidden rounded-[1.7rem] border border-white/30 bg-white shadow-2xl skilllens-page-enter">
              <div className="border-b border-slate-100 px-6 py-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-rose-600">Konfirmasi</p>
                <h3 className="mt-2 text-xl font-black text-slate-950">Hapus prestasi?</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  Apakah kamu ingin menghapus prestasi <span className="font-extrabold text-slate-800">{deleteAchievementTarget.title}</span>?
                </p>
              </div>


              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteAchievementTarget(null)}
                  disabled={achievementSaving}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAchievement}
                  disabled={achievementSaving}
                  className="rounded-full bg-rose-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {achievementSaving ? "Menghapus..." : "Ya, hapus"}
                </button>
              </div>
            </section>
          </div>
        </StudentModalPortal>
      ) : null}

      {achievementModalOpen ? (
        <StudentModalPortal>
          <div className="fixed inset-0 z-[230] flex items-center justify-center bg-slate-950/58 px-4 py-6 backdrop-blur-[4px]">
            <form
              onSubmit={submitAchievement}
              className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[1.9rem] bg-white/[0.96] p-6 shadow-2xl skilllens-page-enter"
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
                  minLength={ACHIEVEMENT_NAME_MIN}
                  maxLength={80}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
                  Minimal {ACHIEVEMENT_NAME_MIN} karakter. Contoh format: Juara 1 Lomba Web Design, Finalis Olimpiade, atau Sertifikasi Desain.
                </p>
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
                  onChange={(event) => updateAchievementForm("tahun", event.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="2026"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
                  Wajib 4 digit, misalnya 2026.
                </p>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Penyelenggara</span>
                <input
                  value={achievementForm.penyelenggara}
                  onChange={(event) => updateAchievementForm("penyelenggara", event.target.value)}
                  placeholder="Contoh: Dinas Pendidikan / Kampus / Sekolah"
                  maxLength={80}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
                  Boleh dikosongi. Jika diisi, tulis minimal {ACHIEVEMENT_TEXT_MIN} karakter.
                </p>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Keterangan / jenis prestasi</span>
                <textarea
                  value={achievementForm.keterangan}
                  onChange={(event) => updateAchievementForm("keterangan", event.target.value)}
                  placeholder="Contoh: Juara 1 kategori aplikasi mobile tingkat kabupaten."
                  rows={3}
                  maxLength={220}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
                  Boleh dikosongi. Jika diisi, minimal {ACHIEVEMENT_DESC_MIN} karakter dan maksimal 220 karakter.
                </p>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Foto sertifikat / bukti prestasi (opsional)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(event) => updateAchievementFile(event.target.files?.[0] ?? null)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-sky-700 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
                  Bisa berupa foto sertifikat JPG/PNG/WEBP atau PDF. Maksimal 5 MB. Bagian ini boleh dikosongi.
                </p>
                {achievementFile ? (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
                    <Icon name="check" className="h-3.5 w-3.5" />
                    {achievementFile.name}
                  </div>
                ) : null}
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
        </StudentModalPortal>
      ) : null}
    </Panel>
  );
}
