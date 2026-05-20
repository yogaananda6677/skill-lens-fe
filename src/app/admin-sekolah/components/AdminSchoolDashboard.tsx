import { Icon } from "../../../components/ui/icons";
import type {
  AdminSchoolPageKey,
  AdminSchoolStatus,
} from "../types";

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
      desc: "Lihat status pengajuan sekolah.",
      icon: "school",
      action: "Cek sekolah",
    },
    {
      key: "guru",
      title: "Data Guru",
      desc: "Tambahkan akun guru sekolah.",
      icon: "users",
      action: "Kelola guru",
    },
    {
      key: "jurusan",
      title: "Data Jurusan",
      desc: "Kelola jurusan untuk siswa.",
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

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-xl shadow-sky-950/5">
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-700 to-slate-950 p-7 text-white md:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />

          <div className="relative">
            <p className="text-sm font-semibold text-cyan-100">
              Panel Admin Sekolah
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
              Kelola data sekolah dengan alur yang rapi.
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-sky-50/80">
              Data guru, jurusan, import siswa, dan data siswa aktif setelah
              sekolah disetujui superadmin.
            </p>
          </div>
        </div>

        <div className="border-b border-sky-100 bg-sky-50/70 px-6 py-4 text-sm font-medium text-slate-600 md:px-8">
          <span className="font-semibold text-sky-700">Status sekolah: </span>
          {loadingStatus ? "Memuat status..." : schoolStatus?.message}
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5 md:p-8">
          {cards.map((item) => {
            const locked = isLockedFeature(item.key);

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={`group rounded-[1.7rem] border p-5 text-left shadow-sm transition ${
                  locked
                    ? "border-amber-100 bg-amber-50/70 hover:bg-amber-50"
                    : "border-slate-200 bg-white hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-950/10"
                }`}
              >
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 transition ${
                    locked
                      ? "bg-amber-100 text-amber-700 ring-amber-200"
                      : "bg-sky-50 text-sky-700 ring-sky-100 group-hover:bg-sky-600 group-hover:text-white"
                  }`}
                >
                  <Icon name={item.icon as any} className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                  {item.desc}
                </p>

                {locked ? (
                  <span className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Terkunci
                  </span>
                ) : null}

                <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-sky-700">
                  {locked ? "Cek status sekolah" : item.action}
                  <Icon name="chevronRight" className="h-4 w-4" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          {
            label: "Status sekolah",
            value: isSchoolApproved
              ? "Terverifikasi"
              : schoolStatus?.school_status === "pending"
                ? "Menunggu verifikasi"
                : "Belum diajukan",
            icon: "verify",
          },
          {
            label: "Total guru",
            value: `${teacherCount} guru`,
            icon: "users",
          },
          {
            label: "Data siswa",
            value: isSchoolApproved ? `${siswaCount} siswa` : "Terkunci",
            icon: "upload",
          },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-[1.7rem] border border-sky-100 bg-white p-5 shadow-lg shadow-sky-950/5"
          >
            <div className="flex items-center gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-700">
                <Icon name={item.icon as any} className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-bold text-slate-950">
                  {item.value}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}