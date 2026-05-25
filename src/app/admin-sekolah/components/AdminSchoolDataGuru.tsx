import type { FormEvent } from "react";
import { Icon } from "../../../components/ui/icons";
import { jabatanOptions } from "../constants";
import type { FieldErrors, TeacherForm, TeacherRow } from "../types";
import {
  Field,
  StatusMessage,
  getInitials,
} from "./AdminSchoolShared";

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
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-2xl bg-gradient-to-b from-blue-50/90 to-white p-6">
        {/* Header biru tua gradasi */}
        <div className="-mx-6 -mt-6 mb-6 rounded-t-2xl bg-gradient-to-r from-[#0a1a3a] to-[#0f2a5f] px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/20 p-1.5 text-white">
              <Icon name="users" className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Data Guru</p>
          </div>
          <h2 className="mt-2 text-xl font-bold text-white">Kelola data guru</h2>
          <p className="mt-1 text-sm text-blue-100">
            Tambahkan akun guru dan pantau daftar guru yang sudah dibuat. Password awal otomatis sama dengan NIP/NUPTK.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="grid flex-1 gap-3 md:grid-cols-[1.5fr_0.9fr]">
              <div className="relative">
                <Icon
                  name="profile"
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={teacherSearch}
                  onChange={(event) => setTeacherSearch(event.target.value)}
                  placeholder="Cari nama, email, username, atau NIP..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <select
                value={teacherRoleFilter}
                onChange={(event) => setTeacherRoleFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                <option value="semua">Semua jabatan</option>
                {jabatanOptions.map((jabatan) => (
                  <option key={jabatan} value={jabatan}>
                    {jabatan}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              <Icon name="users" className="h-4 w-4" />
              Tambah Guru
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/50">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-blue-200 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800">
                  <tr>
                    <th className="px-5 py-3">Guru</th>
                    <th className="px-5 py-3">NIP/NUPTK</th>
                    <th className="px-5 py-3">Kontak</th>
                    <th className="px-5 py-3">Username</th>
                    <th className="px-5 py-3">Jabatan</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/50">
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="transition hover:bg-slate-50/80">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                              {getInitials(teacher.nama)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{teacher.nama}</p>
                              <p className="text-xs text-slate-400">Guru terdaftar</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-600">{teacher.nip}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">{teacher.email}</p>
                          <p className="text-xs text-slate-400">{teacher.no_hp || "-"}</p>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-600">{teacher.username}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {teacher.jabatan}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {teacher.status || "Aktif"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <Icon name="users" className="h-6 w-6" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          {teacherRows.length ? "Data guru tidak ditemukan" : "Belum ada data guru"}
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
          </div>
        </div>
      </div>

      {/* Modal (sama seperti sebelumnya, namun sedikit penyesuaian gaya) */}
      {teacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={onSubmitTeacher}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Data Guru</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Tambah akun guru</h3>
                <p className="mt-1 text-sm text-slate-500">Password awal otomatis sama dengan NIP/NUPTK.</p>
              </div>
              <button
                type="button"
                disabled={loadingTeacher}
                onClick={() => setTeacherModalOpen(false)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
              >
                Tutup
              </button>
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
                  <span className="mb-1 block text-sm font-medium text-slate-700">Jabatan</span>
                  <select
                    value={teacherForm.jabatan}
                    onChange={(event) => onUpdateTeacher("jabatan", event.target.value)}
                    className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:ring-4 ${
                      teacherTouched && teacherErrors.jabatan
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                        : "border-slate-200 focus:border-blue-300 focus:bg-white focus:ring-blue-50"
                    }`}
                  >
                    {jabatanOptions.map((jabatan) => (
                      <option key={jabatan} value={jabatan}>{jabatan}</option>
                    ))}
                  </select>
                  {teacherTouched && teacherErrors.jabatan && (
                    <p className="mt-1 text-xs font-medium text-rose-600">{teacherErrors.jabatan}</p>
                  )}
                </label>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  disabled={loadingTeacher}
                  onClick={() => setTeacherModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingTeacher}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingTeacher ? "Menyimpan..." : "Simpan Guru"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-b-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70" />
    </div>
  );
}