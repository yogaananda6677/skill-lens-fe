"use client";

import { Icon } from "../../../components/ui/icons";
import {
  experienceOptions,
  hobbyOptions,
  interestOptions,
  talentOptions,
} from "../../../data/profile-options";
import type { StudentProfileForm } from "../../../features/siswa/types";
import { OptionPicker, Panel, SectionTitle, type ArrayField } from "./StudentShared";

export function StudentProfilePanel({
  profile,
  processing,
  onChangeProfile,
  onToggleArray,
  onSave,
  onProcess,
}: {
  profile: StudentProfileForm;
  processing: boolean;
  onChangeProfile: (patch: Partial<StudentProfileForm>) => void;
  onToggleArray: (field: ArrayField, value: string) => void;
  onSave: () => void;
  onProcess: () => void;
}) {
  return (
    <Panel id="profil">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <SectionTitle
          eyebrow="Profil Potensi"
          title="Data minat dan pengalaman"
          description="Pilih beberapa hal yang paling menggambarkan dirimu."
        />

        <span className="w-fit rounded-full bg-sky-50 px-4 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
          {profile.name || "Siswa"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <OptionPicker
          title="Minat"
          options={interestOptions}
          selected={profile.interests}
          onToggle={(value) => onToggleArray("interests", value)}
        />

        <OptionPicker
          title="Hobi"
          options={hobbyOptions}
          selected={profile.hobbies}
          onToggle={(value) => onToggleArray("hobbies", value)}
        />

        <OptionPicker
          title="Bakat"
          options={talentOptions}
          selected={profile.talents}
          onToggle={(value) => onToggleArray("talents", value)}
        />

        <OptionPicker
          title="Pengalaman"
          options={experienceOptions}
          selected={profile.experiences}
          onToggle={(value) => onToggleArray("experiences", value)}
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_260px]">
  <div className="block">
    <span className="mb-2 block text-sm font-bold text-slate-700">
      Prestasi
    </span>

    <div className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      {profile.achievements ? (
        <div className="flex flex-wrap gap-2">
          {profile.achievements
            .split(/[,\n]/)
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => (
              <span
                key={item}
                className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-200"
              >
                {item}
              </span>
            ))}
        </div>
      ) : (
        <p className="text-sm font-medium text-slate-400">
          Belum ada data prestasi dari database.
        </p>
      )}
    </div>

    <p className="mt-2 text-xs font-medium text-slate-400">
      Prestasi diambil otomatis dari data tag/database, bukan diketik manual.
    </p>
  </div>

  <label className="block">
    <span className="mb-2 block text-sm font-bold text-slate-700">
      Tujuan
    </span>

    <select
      value={profile.goal}
      onChange={(event) => onChangeProfile({ goal: event.target.value })}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
    >
      <option value="kuliah">Kuliah</option>
      <option value="kerja">Kerja</option>
      <option value="wirausaha">Wirausaha</option>
    </select>

    <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs font-medium leading-6 text-slate-500">
      Hasil rekomendasi akan menyesuaikan tujuan yang kamu pilih.
    </div>
  </label>
</div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSave}
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
        >
          Simpan Profil
        </button>

        <button
          type="button"
          onClick={onProcess}
          disabled={processing}
          className="rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:opacity-60"
        >
          <Icon name="rocket" className="mr-2 inline h-4 w-4" />
          {processing ? "Memproses..." : "Proses Rekomendasi"}
        </button>
      </div>
    </Panel>
  );
}