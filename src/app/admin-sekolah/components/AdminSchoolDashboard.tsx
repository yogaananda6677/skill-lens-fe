import { Icon } from "../../../components/ui/icons";
import type { AdminSchoolPageKey, AdminSchoolStatus } from "../types";

export function AdminSchoolDashboard({
  schoolStatus,
  loadingStatus,
  isSchoolApproved,
  teacherCount,
  siswaCount,
  onNavigate,
  isLockedFeature,
}: {
  schoolStatus: AdminSchoolStatus | null;
  loadingStatus: boolean;
  isSchoolApproved: boolean;
  teacherCount: number;
  siswaCount: number;
  onNavigate: (key: AdminSchoolPageKey) => void;
  isLockedFeature: (key: string) => boolean;
}) {
  const cards: {
    key: AdminSchoolPageKey;
    title: string;
    desc: string;
    icon: string;
    action: string;
  }[] = [
    {
      key: "sekolah",
      title: "Data Sekolah",
      desc: "Lihat status pengajuan dan verifikasi sekolah.",
      icon: "school",
      action: "Cek sekolah",
    },
    {
      key: "guru",
      title: "Data Guru",
      desc: "Tambahkan dan kelola akun guru sekolah.",
      icon: "users",
      action: "Kelola guru",
    },
    {
      key: "jurusan",
      title: "Data Jurusan",
      desc: "Kelola jurusan yang digunakan oleh siswa.",
      icon: "graduation",
      action: "Kelola jurusan",
    },
    {
      key: "import-siswa",
      title: "Import Siswa",
      desc: "Upload Excel siswa berdasarkan jurusan dan tahun ajaran.",
      icon: "upload",
      action: "Import siswa",
    },
    {
      key: "siswa",
      title: "Data Siswa",
      desc: "Lihat data siswa dengan filter dan pagination.",
      icon: "profile",
      action: "Lihat siswa",
    },
  ];

  const schoolStatusText = loadingStatus
    ? "Memuat status..."
    : schoolStatus?.message || "Sekolah belum diajukan.";

  const statusValue = isSchoolApproved
    ? "Terverifikasi"
    : schoolStatus?.school_status === "pending"
      ? "Menunggu verifikasi"
      : schoolStatus?.school_status === "rejected"
        ? "Ditolak"
        : "Belum diajukan";

  const statusBadgeClass =
    "border-sky-100 bg-gradient-to-r from-white via-cyan-50/70 to-sky-50/70 shadow-sm";

  const statusTextClass = isSchoolApproved
    ? "text-sky-700"
    : schoolStatus?.school_status === "pending"
      ? "text-amber-700"
      : schoolStatus?.school_status === "rejected"
        ? "text-rose-700"
        : "text-slate-600";

  return (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
      <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-7 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
              <Icon name="dashboard" className="h-3.5 w-3.5" />
              Dashboard Admin Sekolah
            </p>

            <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Ringkasan Admin Sekolah
            </h3>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Pantau status sekolah, akses menu utama, dan lihat ringkasan data guru
              maupun siswa dalam satu panel.
            </p>
          </div>

          <div className="flex shrink-0 lg:justify-end">
            <div
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold ${statusBadgeClass} ${statusTextClass}`}
            >
              <span className="h-2 w-2 rounded-full bg-current opacity-70" />
              <span>Status:</span>
              <span>{statusValue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 md:p-6">
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 p-5 shadow-sm shadow-sky-100/50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                <Icon
                  name={isSchoolApproved ? "check" : "clock"}
                  className="h-5 w-5"
                />
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-600">
                  Status Sekolah
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                  {schoolStatusText}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("sekolah")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-bold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md"
            >
              Lihat Data Sekolah
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {cards.map((item) => {
            const locked = isLockedFeature(item.key);

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={`group relative overflow-hidden rounded-3xl border p-5 text-left shadow-sm transition duration-300 ${
                  locked
                    ? "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white hover:border-amber-300 hover:shadow-md"
                    : "border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/70 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/70"
                }`}
              >
                <div
                  className={`absolute left-0 top-0 h-1 w-full ${
                    locked
                      ? "bg-gradient-to-r from-amber-300 to-orange-300"
                      : "bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300"
                  }`}
                />

                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 transition ${
                      locked
                        ? "bg-amber-100 text-amber-700 ring-amber-200"
                        : "bg-sky-100 text-sky-700 ring-sky-200/70 group-hover:bg-sky-600 group-hover:text-white"
                    }`}
                  >
                    <Icon name={item.icon as any} className="h-5 w-5" />
                  </div>

                  {locked && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                      Terkunci
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-base font-black tracking-tight text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 min-h-[42px] text-xs font-medium leading-6 text-slate-500">
                  {item.desc}
                </p>

                <div
                  className={`mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold ${
                    locked ? "text-amber-700" : "text-sky-700"
                  }`}
                >
                  {locked ? "Cek status sekolah" : item.action}
                  <Icon
                    name="chevronRight"
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              label: "Status Sekolah",
              value: statusValue,
              icon: "verify",
              desc: "Status pengajuan sekolah",
            },
            {
              label: "Total Guru",
              value: `${teacherCount} guru`,
              icon: "users",
              desc: "Akun guru terdaftar",
            },
            {
              label: "Data Siswa",
              value: isSchoolApproved ? `${siswaCount} siswa` : "Terkunci",
              icon: "upload",
              desc: "Data siswa sekolah",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/70 p-5 shadow-sm shadow-sky-100/60 transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
            >
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-sky-700">
                    {item.label}
                  </p>

                  <p className="mt-2 text-xl font-black tracking-tight text-slate-950">
                    {item.value}
                  </p>

                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                    {item.desc}
                  </p>
                </div>

                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                  <Icon name={item.icon as any} className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
