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
      {/* Header utama dengan gradasi biru gelap */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0a0f2a] via-[#0d1b3e] to-[#0a2a4a] p-6 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
            Panel Admin Sekolah
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            Kelola data sekolah dengan alur yang rapi.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-cyan-100/80">
            Data guru, jurusan, import siswa, dan data siswa aktif setelah
            sekolah disetujui superadmin.
          </p>
        </div>
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      {/* Status bar */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-5 py-3 text-sm text-slate-700">
        <span className="font-semibold text-blue-700">Status sekolah: </span>
        {loadingStatus ? "Memuat status..." : schoolStatus?.message}
      </div>

      {/* Grid kartu aksi */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((item) => {
          const locked = isLockedFeature(item.key);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`group relative overflow-hidden rounded-xl p-5 text-left transition-all duration-200 ${
                locked
                  ? "bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-sm"
                  : "bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 border border-blue-100/60 shadow-md hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              <div
                className={`grid h-11 w-11 place-items-center rounded-xl transition ${
                  locked
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                }`}
              >
                <Icon name={item.icon as any} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-800">
                {item.title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p>
              {locked && (
                <span className="mt-3 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  Terkunci
                </span>
              )}
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600">
                {locked ? "Cek status sekolah" : item.action}
                <Icon name="chevronRight" className="h-3 w-3" />
              </div>
              {!locked && (
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300 group-hover:w-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Ringkasan statistik */}
      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            label: "Status sekolah",
            value: isSchoolApproved
              ? "Terverifikasi"
              : schoolStatus?.school_status === "pending"
                ? "Menunggu verifikasi"
                : "Belum diajukan",
            icon: "verify",
            color: isSchoolApproved ? "emerald" : "amber",
          },
          {
            label: "Total guru",
            value: `${teacherCount} guru`,
            icon: "users",
            color: "blue",
          },
          {
            label: "Data siswa",
            value: isSchoolApproved ? `${siswaCount} siswa` : "Terkunci",
            icon: "upload",
            color: "purple",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/50 to-blue-100/20 p-4 shadow-md border border-blue-100/60"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                <Icon name={item.icon as any} className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                <p className="text-base font-bold text-slate-800">{item.value}</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
}