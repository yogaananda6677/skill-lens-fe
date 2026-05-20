import type { FieldErrors, SchoolForm, AdminSchoolStatus } from "../types";
import { Field, PageCard, StatusMessage } from "./AdminSchoolShared";
import { Icon } from "../../../components/ui/icons";

export function AdminSchoolDataSekolah({
  schoolStatus,
  schoolForm,
  schoolErrors,
  schoolTouched,
  schoolMessage,
  schoolError,
  loadingSchool,
  onUpdate,
  onSubmit,
  onBack,
}: {
  schoolStatus: AdminSchoolStatus | null;
  schoolForm: SchoolForm;
  schoolErrors: FieldErrors<SchoolForm>;
  schoolTouched: boolean;
  schoolMessage: string;
  schoolError: string;
  loadingSchool: boolean;
  onUpdate: (key: keyof SchoolForm, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}) {
  // Sekolah sudah diverifikasi
  if (schoolStatus?.school_status === "approved") {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
        <div className="rounded-xl bg-white p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
              <Icon name="school" className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Data Sekolah</p>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Sekolah sudah diverifikasi</h2>
          <p className="mt-1 text-sm text-slate-500">Data sekolah sudah disetujui. Pengajuan baru tidak diperlukan.</p>

          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-700">Status Aktif</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-950">{schoolStatus.nama_sekolah}</h3>
            <p className="mt-2 text-sm text-slate-600">Sekolah sudah diverifikasi oleh superadmin. Fitur guru, jurusan, import siswa, dan data siswa sudah aktif.</p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Kembali ke dashboard
          </button>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70 rounded-b-xl" />
      </div>
    );
  }

  // Sekolah pending
  if (schoolStatus?.school_status === "pending") {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
        <div className="rounded-xl bg-white p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
              <Icon name="school" className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Data Sekolah</p>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Pengajuan sedang diverifikasi</h2>
          <p className="mt-1 text-sm text-slate-500">Data sekolah sudah dikirim dan sedang menunggu persetujuan superadmin.</p>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white p-1.5 text-amber-600">
                <Icon name="clock" className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Menunggu verifikasi</h3>
            </div>
            <p className="mt-2 text-sm text-amber-700">{schoolStatus.message}</p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Kembali ke dashboard
          </button>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70 rounded-b-xl" />
      </div>
    );
  }

  // Form pengajuan (belum ada sekolah)
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-xl bg-white p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
            <Icon name="school" className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Pengajuan Sekolah</p>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Ajukan data sekolah</h2>
        <p className="mt-1 text-sm text-slate-500">Isi data sekolah dengan benar. Setelah terkirim, superadmin akan melakukan verifikasi.</p>

        {schoolStatus?.message && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            {schoolStatus.message}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nama sekolah"
              value={schoolForm.nama_sekolah}
              placeholder="SMAN 1 Contoh"
              error={schoolTouched ? schoolErrors.nama_sekolah : ""}
              onChange={(value) => onUpdate("nama_sekolah", value)}
            />

            <Field
              label="NPSN"
              value={schoolForm.npsn}
              placeholder="Masukkan NPSN"
              error={schoolTouched ? schoolErrors.npsn : ""}
              onChange={(value) => onUpdate("npsn", value)}
            />

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Jenis sekolah</span>
              <select
                value={schoolForm.jenis_sekolah}
                onChange={(event) => onUpdate("jenis_sekolah", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              >
                <option value="SMA">SMA</option>
                <option value="SMK">SMK</option>
              </select>
              {schoolTouched && schoolErrors.jenis_sekolah && (
                <p className="mt-1 text-xs text-red-600">{schoolErrors.jenis_sekolah}</p>
              )}
            </label>

            <Field
              label="Nomor telepon sekolah"
              value={schoolForm.no_telp}
              placeholder="0354xxxxxx"
              error={schoolTouched ? schoolErrors.no_telp : ""}
              onChange={(value) => onUpdate("no_telp", value)}
            />

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Alamat sekolah</span>
              <textarea
                value={schoolForm.alamat}
                placeholder="Masukkan alamat lengkap sekolah"
                onChange={(event) => onUpdate("alamat", event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </label>
          </div>

          <StatusMessage message={schoolMessage} error={schoolError} />

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loadingSchool}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
            >
              <Icon name="spark" className="h-4 w-4" />
              {loadingSchool ? "Mengirim..." : "Ajukan Sekolah"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Kembali
            </button>
          </div>
        </form>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70 rounded-b-xl" />
    </div>
  );
}