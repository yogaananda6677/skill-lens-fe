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
    <PageCard
      eyebrow="Data Guru"
      title="Kelola data guru"
      description="Tambahkan akun guru dan pantau daftar guru yang sudah dibuat. Password awal otomatis sama dengan NIP/NUPTK."
      icon="users"
    >
      <div className="space-y-5">
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
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <select
              value={teacherRoleFilter}
              onChange={(event) => setTeacherRoleFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
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
            className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-700"
          >
            <Icon name="users" className="h-4 w-4" />
            Tambah Guru
          </button>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                    <tr
                      key={teacher.id}
                      className="transition hover:bg-sky-50/50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sm font-bold text-sky-700">
                            {getInitials(teacher.nama)}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {teacher.nama}
                            </p>
                            <p className="text-xs font-medium text-slate-400">
                              Guru terdaftar
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-600">
                        {teacher.nip}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {teacher.email}
                        </p>
                        <p className="text-xs font-medium text-slate-400">
                          {teacher.no_hp || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-600">
                        {teacher.username}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                          {teacher.jabatan}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                          {teacher.status || "Aktif"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                        <Icon name="users" className="h-6 w-6" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        {teacherRows.length
                          ? "Data guru tidak ditemukan"
                          : "Belum ada data guru"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-400">
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

        {teacherModalOpen ? (
          <div className="fixed inset-0 z-[80] grid place-items-center px-4 py-6">
            <button
              type="button"
              onClick={() => setTeacherModalOpen(false)}
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
              aria-label="Tutup modal tambah guru"
            />

            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
              <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 px-6 py-5 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setTeacherModalOpen(false)}
                  className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-950"
                  aria-label="Tutup modal"
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>

                <p className="text-sm font-semibold text-sky-700">
                  Tambah Data Guru
                </p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  Buat akun guru baru
                </h3>
                <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">
                  Password awal guru otomatis sama dengan NIP/NUPTK.
                </p>
              </div>

              <form onSubmit={onSubmitTeacher} className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Nama guru"
                    value={teacherForm.nama}
                    placeholder="Nama lengkap guru"
                    error={teacherTouched ? teacherErrors.nama : ""}
                    onChange={(value) => onUpdateTeacher("nama", value)}
                  />

                  <Field
                    label="NIP / NUPTK"
                    value={teacherForm.nip}
                    placeholder="Masukkan NIP/NUPTK"
                    error={teacherTouched ? teacherErrors.nip : ""}
                    onChange={(value) => onUpdateTeacher("nip", value)}
                  />

                  <Field
                    label="Email"
                    type="email"
                    value={teacherForm.email}
                    placeholder="guru@email.com"
                    error={teacherTouched ? teacherErrors.email : ""}
                    onChange={(value) => onUpdateTeacher("email", value)}
                  />

                  <Field
                    label="Nomor HP"
                    value={teacherForm.no_hp}
                    placeholder="08xxxxxxxxxx"
                    error={teacherTouched ? teacherErrors.no_hp : ""}
                    onChange={(value) => onUpdateTeacher("no_hp", value)}
                  />

                  <Field
                    label="Username"
                    value={teacherForm.username}
                    placeholder="contoh: guru01"
                    error={teacherTouched ? teacherErrors.username : ""}
                    onChange={(value) => onUpdateTeacher("username", value)}
                  />

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Password awal
                    </span>
                    <input
                      value={teacherForm.nip || "Akan mengikuti NIP/NUPTK"}
                      readOnly
                      className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-500 outline-none"
                    />
                    <p className="mt-2 text-xs font-medium text-slate-400">
                      Password otomatis disamakan dengan NIP/NUPTK.
                    </p>
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Jabatan
                    </span>
                    <select
                      value={teacherForm.jabatan}
                      onChange={(event) =>
                        onUpdateTeacher("jabatan", event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    >
                      {jabatanOptions.map((jabatan) => (
                        <option key={jabatan} value={jabatan}>
                          {jabatan}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-5">
                  <StatusMessage message={teacherMessage} error={teacherError} />
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setTeacherModalOpen(false)}
                    className="rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={loadingTeacher}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:opacity-60"
                  >
                    <Icon name="users" className="h-4 w-4" />
                    {loadingTeacher ? "Menyimpan..." : "Simpan Guru"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </PageCard>
  );
}