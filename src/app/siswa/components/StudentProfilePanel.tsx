"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "../../../components/ui/icons";
import {
  experienceOptions,
  hobbyOptions,
  interestOptions,
  talentOptions,
} from "../../../data/profile-options";
import type {
  StudentAchievement,
  StudentProfileForm,
} from "../../../features/siswa/types";
import { OptionPicker, Panel, SectionTitle, type ArrayField } from "./StudentShared";

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
}: {
  profile: StudentProfileForm;
  prestasiRows: StudentAchievement[];
  processing: boolean;
  onChangeProfile: (patch: Partial<StudentProfileForm>) => void;
  onToggleArray: (field: ArrayField, value: string) => void;
  onSave: () => void;
  onProcess: () => void;
  onCreateAchievement?: (payload: {
    nama_prestasi: string;
    tingkat?: string | null;
    tahun?: string | number | null;
    penyelenggara?: string | null;
    keterangan?: string | null;
    bukti_url?: string | null;
  }) => Promise<void>;
  onDeleteAchievement?: (id: number) => Promise<void>;
  processLabel?: string;
}) {
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
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="block text-sm font-bold text-slate-700">Prestasi</span>
      <button
        type="button"
        onClick={() => {
          setAchievementError("");
          setAchievementModalOpen(true);
        }}
        className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700"
      >
        + Tambah Prestasi
      </button>
    </div>

    <div className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {prestasiRows.length ? (
        <div className="grid gap-3">
          {prestasiRows.map((item) => (
            <div
              key={item.id ?? item.id_prestasi ?? item.nama_prestasi}
              className="rounded-2xl border border-sky-100 bg-white p-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
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
                    onClick={() => handleDeleteAchievement(item.id_prestasi ?? item.id)}
                    className="w-fit rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-600 hover:text-white disabled:opacity-50"
                  >
                    Hapus
                  </button>
                ) : null}
                {item.bukti_url ? (
                  <a
                    href={item.bukti_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-fit rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-600 hover:text-white"
                  >
                    Lihat bukti
                  </a>
                ) : (
                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                    Tanpa bukti
                  </span>
                )}
                </div>
              </div>

              {item.keterangan ? (
                <p className="mt-3 text-xs font-medium leading-6 text-slate-500">
                  {item.keterangan}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center">
          <p className="text-sm font-semibold text-slate-500">
            Belum ada data prestasi.
          </p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            Klik Tambah Prestasi untuk menambahkan prestasi yang akan ikut
            dihitung pada SPK.
          </p>
        </div>
      )}
    </div>

    <p className="mt-2 text-xs font-medium text-slate-400">
      Tingkat dan keterangan seperti Juara 1/Nasional/Internasional akan ikut memengaruhi bobot prestasi di SPK.
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

      {achievementModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={submitAchievement}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Prestasi Siswa</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">Tambah prestasi</h3>
                <p className="mt-1 text-sm font-medium text-slate-500">Isi tingkat dan keterangan supaya bobot prestasi di SPK lebih akurat.</p>
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Tingkat</span>
                <select
                  value={achievementForm.tingkat}
                  onChange={(event) => updateAchievementForm("tingkat", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Penyelenggara</span>
                <input
                  value={achievementForm.penyelenggara}
                  onChange={(event) => updateAchievementForm("penyelenggara", event.target.value)}
                  placeholder="Contoh: Dinas Pendidikan / Kampus / Sekolah"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Keterangan / jenis prestasi</span>
                <textarea
                  value={achievementForm.keterangan}
                  onChange={(event) => updateAchievementForm("keterangan", event.target.value)}
                  placeholder="Contoh: Juara 1, kategori lomba aplikasi, finalis, sertifikasi kompetensi, organisasi, karya ilmiah, dll."
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">Link bukti (opsional)</span>
                <input
                  value={achievementForm.bukti_url}
                  onChange={(event) => updateAchievementForm("bukti_url", event.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
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