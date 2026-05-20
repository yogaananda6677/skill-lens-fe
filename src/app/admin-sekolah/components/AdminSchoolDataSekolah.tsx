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
  if (schoolStatus?.school_status === "approved") {
    return (
      <PageCard
        eyebrow="Data Sekolah"
        title="Sekolah sudah diverifikasi"
        description="Data sekolah sudah disetujui. Pengajuan baru tidak diperlukan."
        icon="school"
      >
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <p className="text-sm font-semibold text-emerald-700">
            Status Aktif
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-950">
            {schoolStatus.nama_sekolah}
          </h3>
          <p className="mt-2 text-sm font-medium leading-7 text-emerald-800">
            Sekolah sudah diverifikasi oleh superadmin. Fitur guru, jurusan,
            import siswa, dan data siswa sudah aktif.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Kembali ke dashboard
        </button>
      </PageCard>
    );
  }

  if (schoolStatus?.school_status === "pending") {
    return (
      <PageCard
        eyebrow="Data Sekolah"
        title="Pengajuan sedang diverifikasi"
        description="Data sekolah sudah dikirim dan sedang menunggu persetujuan superadmin."
        icon="school"
      >
        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-amber-700 ring-1 ring-amber-100">
            <Icon name="clock" className="h-5 w-5" />
          </div>

          <h3 className="mt-4 text-2xl font-bold text-slate-950">
            Menunggu verifikasi
          </h3>

          <p className="mt-2 text-sm font-medium leading-7 text-amber-800">
            {schoolStatus.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Kembali ke dashboard
        </button>
      </PageCard>
    );
  }

  return (
    <PageCard
      eyebrow="Pengajuan Sekolah"
      title="Ajukan data sekolah"
      description="Isi data sekolah dengan benar. Setelah terkirim, superadmin akan melakukan verifikasi."
      icon="school"
    >
      {schoolStatus?.message ? (
        <div className="mb-6 rounded-2xl bg-sky-50 p-4 text-sm font-medium leading-6 text-sky-800 ring-1 ring-sky-100">
          {schoolStatus.message}
        </div>
      ) : null}

      <form onSubmit={onSubmit}>
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
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Jenis sekolah
            </span>
            <select
              value={schoolForm.jenis_sekolah}
              onChange={(event) => onUpdate("jenis_sekolah", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            >
              <option value="SMA">SMA</option>
              <option value="SMK">SMK</option>
            </select>
            {schoolTouched && schoolErrors.jenis_sekolah ? (
              <p className="mt-2 text-xs font-medium text-rose-600">
                {schoolErrors.jenis_sekolah}
              </p>
            ) : null}
          </label>

          <Field
            label="Nomor telepon sekolah"
            value={schoolForm.no_telp}
            placeholder="0354xxxxxx"
            error={schoolTouched ? schoolErrors.no_telp : ""}
            onChange={(value) => onUpdate("no_telp", value)}
          />

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Alamat sekolah
            </span>
            <textarea
              value={schoolForm.alamat}
              placeholder="Masukkan alamat lengkap sekolah"
              onChange={(event) => onUpdate("alamat", event.target.value)}
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
          </label>
        </div>

        <div className="mt-5">
          <StatusMessage message={schoolMessage} error={schoolError} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loadingSchool}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="rocket" className="h-4 w-4" />
            {loadingSchool ? "Mengirim..." : "Ajukan Sekolah"}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Kembali
          </button>
        </div>
      </form>
    </PageCard>
  );
}