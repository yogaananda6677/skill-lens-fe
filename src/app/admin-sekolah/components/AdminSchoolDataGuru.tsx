import type { FormEvent } from "react";
import { Icon } from "../../../components/ui/icons";
import { jabatanOptions } from "../constants";
import type { FieldErrors, TeacherForm, TeacherRow } from "../types";
import {
  Field,
  StatusMessage,
  getInitials,
} from "./AdminSchoolShared";

function StatCard({
  title,
  value,
  desc,
  icon,
}: {
  title: string;
  value: string | number;
  desc: string;
  icon: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-cyan-50/50 to-sky-50/70 p-5 shadow-sm shadow-sky-100/60 transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-sky-700">
            {title}
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
            {desc}
          </p>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
          <Icon name={icon as any} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function AdminSchoolDataGuru({
  teacherRows,
  filteredTeachers,
  teacherSearch,
  teacherRoleFilter,
  teacherForm,
  teacherErrors,
  teacherTouched,
  teacherModalOpen,
  teacherMessage,
  teacherError,
  loadingTeacher,
  setTeacherSearch,
  setTeacherRoleFilter,
  setTeacherModalOpen,
  onUpdateTeacher,
  onSubmitTeacher,
  onOpenCreate,
}: {
  teacherRows: TeacherRow[];
  filteredTeachers: TeacherRow[];
  teacherSearch: string;
  teacherRoleFilter: string;
  teacherForm: TeacherForm;
  teacherErrors: FieldErrors<TeacherForm>;
  teacherTouched: boolean;
  teacherModalOpen: boolean;
  teacherMessage: string;
  teacherError: string;
  loadingTeacher: boolean;
  setTeacherSearch: (value: string) => void;
  setTeacherRoleFilter: (value: string) => void;
  setTeacherModalOpen: (value: boolean) => void;
  onUpdateTeacher: (key: keyof TeacherForm, value: string) => void;
  onSubmitTeacher: (event: FormEvent<HTMLFormElement>) => void;
  onOpenCreate: () => void;
}) {
  const activeTeacherCount = teacherRows.filter(
    (teacher) => !teacher.status || teacher.status.toLowerCase() === "aktif",
  ).length;

  return (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
      <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-7 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
              <Icon name="users" className="h-3.5 w-3.5" />
              Data Guru
            </p>

            <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Kelola Data Guru
            </h3>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Tambahkan akun guru dan pantau daftar guru yang sudah dibuat.
              Password awal otomatis sama dengan NIP/NUPTK.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Icon name="users" className="h-4 w-4" />
            Tambah Guru
          </button>
        </div>
      </div>

      <div className="space-y-6 p-5 md:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Guru"
            value={teacherRows.length}
            desc="Akun guru terdaftar"
            icon="users"
          />
          <StatCard
            title="Ditampilkan"
            value={filteredTeachers.length}
            desc="Data sesuai pencarian/filter"
            icon="profile"
          />
          <StatCard
            title="Status Aktif"
            value={activeTeacherCount}
            desc="Guru dengan status aktif"
            icon="verify"
          />
        </div>

        <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
          <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                Daftar Guru
              </p>
              <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                Data Guru Sekolah
              </h3>
              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Gunakan pencarian dan filter jabatan untuk menemukan data guru
                lebih cepat.
              </p>
            </div>

            <div className="grid w-full gap-3 lg:w-auto lg:grid-cols-[minmax(260px,1fr)_180px]">
              <div className="relative">
                <Icon
                  name="profile"
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={teacherSearch}
                  onChange={(event) => setTeacherSearch(event.target.value)}
                  placeholder="Cari nama, email, username, atau NIP..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <select
                value={teacherRoleFilter}
                onChange={(event) => setTeacherRoleFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              >
                <option value="semua">Semua jabatan</option>
                {jabatanOptions.map((jabatan) => (
                  <option key={jabatan} value={jabatan}>
                    {jabatan}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-sky-100 via-white to-blue-100 text-xs font-black uppercase tracking-[0.14em] text-sky-800">
                <tr>
                  <th className="px-5 py-4">Guru</th>
                  <th className="px-5 py-4">NIP/NUPTK</th>
                  <th className="px-5 py-4">Kontak</th>
                  <th className="px-5 py-4">Username</th>
                  <th className="px-5 py-4">Jabatan</th>
                  <th className="px-5 py-4 text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="transition hover:bg-sky-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sm font-black text-sky-700 ring-1 ring-sky-200/70">
                            {getInitials(teacher.nama)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {teacher.nama}
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                              Guru terdaftar
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-600">
                        {teacher.nip}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {teacher.email}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {teacher.no_hp || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-600">
                        {teacher.username}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-200">
                          {teacher.jabatan}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                          {teacher.status || "Aktif"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                        <Icon name="users" className="h-5 w-5" />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        {teacherRows.length
                          ? "Data guru tidak ditemukan"
                          : "Belum ada data guru"}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {teacherRows.length
                          ? "Ubah kata kunci atau filter jabatan."
                          : "Klik tombol Tambah Guru untuk membuat akun guru baru."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {teacherModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/30 px-4 py-6">
          <form
            onSubmit={onSubmitTeacher}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-sky-100 bg-white shadow-2xl shadow-slate-950/20"
          >
            <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/50 to-sky-50/70 px-6 py-5 text-slate-900">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.045)_1px,transparent_1px)] bg-[size:32px_32px]" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
                    <Icon name="users" className="h-3.5 w-3.5" />
                    Data Guru
                  </p>

                  <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950">
                    Tambah Akun Guru
                  </h3>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    Password awal otomatis sama dengan NIP/NUPTK.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loadingTeacher}
                  onClick={() => setTeacherModalOpen(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                  aria-label="Tutup modal"
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <StatusMessage message={teacherMessage} error={teacherError} />

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field
                  label="Nama guru"
                  value={teacherForm.nama}
                  placeholder="Contoh: Budi Santoso"
                  error={teacherTouched ? teacherErrors.nama : undefined}
                  onChange={(value) => onUpdateTeacher("nama", value)}
                />

                <Field
                  label="Email"
                  value={teacherForm.email}
                  placeholder="guru@email.com"
                  type="email"
                  error={teacherTouched ? teacherErrors.email : undefined}
                  onChange={(value) => onUpdateTeacher("email", value)}
                />

                <Field
                  label="Username"
                  value={teacherForm.username}
                  placeholder="budi123"
                  error={teacherTouched ? teacherErrors.username : undefined}
                  onChange={(value) => onUpdateTeacher("username", value)}
                />

                <Field
                  label="NIP/NUPTK"
                  value={teacherForm.nip}
                  placeholder="1234567890"
                  error={teacherTouched ? teacherErrors.nip : undefined}
                  onChange={(value) => onUpdateTeacher("nip", value)}
                />

                <Field
                  label="No HP"
                  value={teacherForm.no_hp}
                  placeholder="081234567890"
                  error={teacherTouched ? teacherErrors.no_hp : undefined}
                  onChange={(value) => onUpdateTeacher("no_hp", value)}
                />

                <label className="block">
                  <span className="mb-1 block text-sm font-bold text-slate-700">
                    Jabatan
                  </span>
                  <select
                    value={teacherForm.jabatan}
                    onChange={(event) => onUpdateTeacher("jabatan", event.target.value)}
                    className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:ring-4 ${
                      teacherTouched && teacherErrors.jabatan
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                        : "border-slate-200 focus:border-sky-300 focus:bg-white focus:ring-sky-100"
                    }`}
                  >
                    {jabatanOptions.map((jabatan) => (
                      <option key={jabatan} value={jabatan}>
                        {jabatan}
                      </option>
                    ))}
                  </select>

                  {teacherTouched && teacherErrors.jabatan && (
                    <p className="mt-1 text-xs font-medium text-rose-600">
                      {teacherErrors.jabatan}
                    </p>
                  )}
                </label>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  disabled={loadingTeacher}
                  onClick={() => setTeacherModalOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loadingTeacher}
                  className="rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loadingTeacher ? "Menyimpan..." : "Simpan Guru"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
