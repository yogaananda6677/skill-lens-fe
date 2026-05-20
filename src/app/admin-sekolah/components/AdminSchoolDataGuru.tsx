import { Icon } from "../../../components/ui/icons";
import { jabatanOptions } from "../constants";
import type { FieldErrors, TeacherForm, TeacherRow } from "../types";
import {
  Field,
  PageCard,
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
  onSubmitTeacher: (event: React.FormEvent<HTMLFormElement>) => void;
  onOpenCreate: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-xl bg-white p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
            <Icon name="users" className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Data Guru</p>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Kelola data guru</h2>
        <p className="mt-1 text-sm text-slate-500">Tambahkan akun guru dan pantau daftar guru yang sudah dibuat. Password awal otomatis sama dengan NIP/NUPTK.</p>

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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <select
                value={teacherRoleFilter}
                onChange={(event) => setTeacherRoleFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
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
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
            >
              <Icon name="users" className="h-4 w-4" />
              Tambah Guru
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800 border-b border-blue-200">
                  <tr>
                    <th className="px-5 py-3">Guru</th>
                    <th className="px-5 py-3">NIP/NUPTK</th>
                    <th className="px-5 py-3">Kontak</th>
                    <th className="px-5 py-3">Username</th>
                    <th className="px-5 py-3">Jabatan</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-slate-50/70 transition">
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
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {teacher.jabatan}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
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
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70 rounded-b-xl" />
    </div>
  );
}