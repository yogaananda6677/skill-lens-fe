import Link from "next/link";

type IconProps = {
  className?: string;
};

const LensIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="21" cy="21" r="12" stroke="currentColor" strokeWidth="3.5" />
    <path
      d="M30.5 30.5L41 41"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M15 22.5C16.3 17.8 19.2 15.4 24 15"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  </svg>
);

const ProfileIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="8" y="7" width="32" height="34" rx="8" stroke="currentColor" strokeWidth="3.2" />
    <circle cx="24" cy="19" r="5" stroke="currentColor" strokeWidth="3.2" />
    <path
      d="M16 32C18 27.8 30 27.8 32 32"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  </svg>
);

const DecisionIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24 7V15"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <rect x="16" y="15" width="16" height="10" rx="4" stroke="currentColor" strokeWidth="3.2" />
    <path
      d="M24 25V31M24 31H14M24 31H34"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <rect x="7" y="31" width="14" height="10" rx="4" stroke="currentColor" strokeWidth="3.2" />
    <rect x="27" y="31" width="14" height="10" rx="4" stroke="currentColor" strokeWidth="3.2" />
  </svg>
);

const RouteIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11 37C18 27 29 31 37 11"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
    />
    <circle cx="11" cy="37" r="5" stroke="currentColor" strokeWidth="3.2" />
    <circle cx="37" cy="11" r="5" stroke="currentColor" strokeWidth="3.2" />
    <path
      d="M17 15H27M17 21H24"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  </svg>
);

const TeacherIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="18" cy="17" r="6" stroke="currentColor" strokeWidth="3.2" />
    <path
      d="M8 35C9.6 28.5 26.4 28.5 28 35"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <path
      d="M31 13H40M31 21H40M33 29H40"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  </svg>
);

const ChartIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 39H40"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <rect x="12" y="23" width="6" height="12" rx="2" stroke="currentColor" strokeWidth="3.2" />
    <rect x="23" y="15" width="6" height="20" rx="2" stroke="currentColor" strokeWidth="3.2" />
    <rect x="34" y="9" width="6" height="26" rx="2" stroke="currentColor" strokeWidth="3.2" />
  </svg>
);

const features = [
  {
    title: "Profiling Siswa",
    desc: "Data minat, bakat, nilai akademik, prestasi, dan preferensi siswa dikumpulkan menjadi profil yang siap dianalisis.",
    icon: ProfileIcon,
  },
  {
    title: "Rekomendasi Berbasis DSS",
    desc: "Sistem membantu menentukan arah pilihan dengan pendekatan SAW, Decision Tree, dan Rule-Based System.",
    icon: DecisionIcon,
  },
  {
    title: "Peta Arah Setelah Lulus",
    desc: "Hasil rekomendasi tidak berhenti pada satu pilihan, tetapi menampilkan jalur kuliah, pelatihan, dan kerja.",
    icon: RouteIcon,
  },
  {
    title: "Pendampingan Guru BK",
    desc: "Guru BK dapat menggunakan hasil analisis sebagai bahan bimbingan yang lebih objektif dan personal.",
    icon: TeacherIcon,
  },
];

const methods = [
  "Student Profiling",
  "Content-Based Recommendation",
  "Simple Additive Weighting",
  "Decision Tree",
  "Rule-Based System",
];

const outputs = [
  "Jurusan kuliah yang sesuai",
  "Bidang karier yang relevan",
  "Pelatihan keterampilan",
  "Jalur kerja berdasarkan profil siswa",
];

const steps = [
  {
    label: "Isi Profil",
    text: "Siswa memasukkan data minat, bakat, nilai akademik, prestasi, dan preferensi setelah lulus.",
  },
  {
    label: "Analisis Sistem",
    text: "SkillLens mengolah data dengan metode rekomendasi dan pendukung keputusan.",
  },
  {
    label: "Lihat Rekomendasi",
    text: "Siswa mendapatkan arah kuliah, pelatihan, bidang karier, atau jalur kerja yang sesuai.",
  },
  {
    label: "Arahan Guru BK",
    text: "Guru BK dapat menggunakan hasil rekomendasi sebagai dasar bimbingan karier.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f3f7fb] text-slate-950">
      <section className="relative bg-[#071526] text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-cyan-400 blur-[110px]" />
          <div className="absolute bottom-[-160px] right-[-80px] h-[420px] w-[420px] rounded-full bg-blue-600 blur-[130px]" />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />

        <nav className="relative z-10 mx-auto flex w-[min(1180px,calc(100%-32px))] items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-blue-700">
              <LensIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">SkillLens</p>
              <p className="text-xs font-medium text-cyan-100/70">
                Career Planning System
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold text-white/70 md:flex">
            <a href="#masalah" className="hover:text-white">
              Permasalahan
            </a>
            <a href="#fitur" className="hover:text-white">
              Fitur
            </a>
            <a href="#metode" className="hover:text-white">
              Metode
            </a>
            <a href="#alur" className="hover:text-white">
              Alur
            </a>
          </div>

          <Link
            href="/siswa"
            className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_0_30px_rgba(103,232,249,0.35)] transition hover:-translate-y-0.5 hover:bg-white"
          >
            Mulai Tes
          </Link>
        </nav>

        <div className="relative z-10 mx-auto grid w-[min(1180px,calc(100%-32px))] gap-12 pb-20 pt-12 lg:grid-cols-[1fr_520px] lg:pb-28 lg:pt-20">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-cyan-200/20 bg-white/8 px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
              Untuk siswa kelas akhir SMA/SMK
            </div>

            <h1 className="text-[44px] font-black leading-[0.98] tracking-[-0.06em] text-white md:text-7xl lg:text-[86px]">
              Lihat potensi.
              <br />
              Pilih arah.
              <br />
              <span className="text-cyan-300">Rancang masa depan.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              SkillLens adalah sistem informasi perencanaan karier berbasis
              Decision Support System untuk membantu siswa menentukan arah
              setelah lulus berdasarkan profil, minat, kemampuan akademik,
              prestasi, dan preferensi karier.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/siswa"
                className="rounded-full bg-white px-7 py-4 text-sm font-black text-slate-950 transition hover:-translate-y-1 hover:bg-cyan-200"
              >
                Mulai Perencanaan
              </Link>
              <a
                href="#fitur"
                className="rounded-full border border-white/15 px-7 py-4 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-white/10"
              >
                Lihat Sistem
              </a>
            </div>
          </div>

          <div className="relative min-h-[520px]">
            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/20" />
            <div className="absolute left-1/2 top-1/2 h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/20" />
            <div className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/20" />

            <div className="absolute left-1/2 top-1/2 grid h-44 w-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2.25rem] bg-cyan-300 text-slate-950 shadow-[0_0_80px_rgba(103,232,249,0.35)]">
              <LensIcon className="h-20 w-20" />
            </div>

            <div className="absolute left-3 top-20 w-52 rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <ProfileIcon className="mb-4 h-9 w-9 text-cyan-300" />
              <p className="text-sm font-black">Profil Siswa</p>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Minat, bakat, nilai, prestasi
              </p>
            </div>

            <div className="absolute right-0 top-8 w-52 rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <DecisionIcon className="mb-4 h-9 w-9 text-cyan-300" />
              <p className="text-sm font-black">Analisis DSS</p>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                SAW, Decision Tree, rule system
              </p>
            </div>

            <div className="absolute bottom-20 right-8 w-52 rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <RouteIcon className="mb-4 h-9 w-9 text-cyan-300" />
              <p className="text-sm font-black">Arah Setelah Lulus</p>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Kuliah, pelatihan, kerja
              </p>
            </div>

            <div className="absolute bottom-7 left-10 w-52 rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <TeacherIcon className="mb-4 h-9 w-9 text-cyan-300" />
              <p className="text-sm font-black">Guru BK</p>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Arahan lebih personal
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="masalah"
        className="relative mx-auto w-[min(1180px,calc(100%-32px))] py-24"
      >
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-blue-700">
              Realita Siswa
            </p>
            <h2 className="text-4xl font-black tracking-[-0.05em] text-slate-950 md:text-6xl">
              Banyak pilihan, tapi arahnya belum tentu jelas.
            </h2>
          </div>

          <p className="text-lg leading-9 text-slate-600">
            Siswa kelas akhir SMA/SMK sering berada di titik penting setelah
            lulus. Mereka harus memilih kuliah, pelatihan keterampilan, atau
            langsung bekerja, tetapi keputusan tersebut sering belum didukung
            oleh pemahaman potensi diri dan data yang terstruktur.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-slate-900/5">
            <span className="mb-8 block h-1.5 w-16 rounded-full bg-blue-700" />
            <h3 className="text-2xl font-black tracking-tight">
              Belum mengenali potensi diri
            </h3>
            <p className="mt-4 leading-8 text-slate-600">
              Minat, bakat, kemampuan akademik, dan prestasi belum sepenuhnya
              menjadi dasar dalam menentukan pilihan.
            </p>
          </div>

          <div className="rounded-[2rem] bg-[#10213a] p-7 text-white shadow-xl shadow-blue-950/20 md:-translate-y-6">
            <span className="mb-8 block h-1.5 w-16 rounded-full bg-cyan-300" />
            <h3 className="text-2xl font-black tracking-tight">
              Terpengaruh tren dan lingkungan
            </h3>
            <p className="mt-4 leading-8 text-slate-300">
              Pilihan jurusan atau pekerjaan sering dipengaruhi teman, tren,
              tekanan lingkungan, atau informasi yang kurang lengkap.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-slate-900/5">
            <span className="mb-8 block h-1.5 w-16 rounded-full bg-blue-700" />
            <h3 className="text-2xl font-black tracking-tight">
              Pilihan berisiko tidak sesuai
            </h3>
            <p className="mt-4 leading-8 text-slate-600">
              Siswa dapat memilih jalur yang kurang sesuai dengan kemampuan,
              minat, dan kesiapan menghadapi pendidikan lanjutan atau kerja.
            </p>
          </div>
        </div>
      </section>

      <section
        id="fitur"
        className="bg-white py-24"
      >
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-blue-700">
                Fitur Utama
              </p>
              <h2 className="text-4xl font-black tracking-[-0.05em] text-slate-950 md:text-6xl">
                Bukan sekadar tes minat biasa.
              </h2>
            </div>

            <p className="max-w-md leading-8 text-slate-600">
              SkillLens dirancang sebagai sistem yang menghubungkan data siswa,
              metode rekomendasi, dan kebutuhan bimbingan karier di sekolah.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className={`group rounded-[2rem] border border-slate-200 bg-[#f8fbff] p-7 transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/10 ${
                    index === 1 || index === 3 ? "lg:mt-10" : ""
                  }`}
                >
                  <div className="mb-10 grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-cyan-300 transition group-hover:rotate-6 group-hover:bg-blue-700 group-hover:text-white">
                    <Icon className="h-8 w-8" />
                  </div>

                  <h3 className="text-xl font-black tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="metode"
        className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-6 py-24 lg:grid-cols-[0.95fr_1.05fr]"
      >
        <div className="rounded-[2.5rem] bg-[#071526] p-8 text-white md:p-10">
          <ChartIcon className="mb-10 h-14 w-14 text-cyan-300" />
          <p className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
            Metode Sistem
          </p>
          <h2 className="text-4xl font-black tracking-[-0.05em] md:text-6xl">
            Rekomendasi dibuat lebih terukur.
          </h2>
          <p className="mt-6 leading-8 text-slate-300">
            Sistem menggunakan beberapa pendekatan agar rekomendasi tidak hanya
            berdasarkan jawaban umum, tetapi juga mempertimbangkan kecocokan
            profil siswa dengan pilihan setelah lulus.
          </p>
        </div>

        <div className="grid gap-4">
          {methods.map((method, index) => (
            <div
              key={method}
              className="flex items-center gap-5 rounded-[1.75rem] bg-white p-5 shadow-lg shadow-slate-900/5"
            >
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blue-50 text-lg font-black text-blue-700">
                0{index + 1}
              </div>
              <div>
                <h3 className="text-lg font-black">{method}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Digunakan untuk membantu proses analisis dan rekomendasi arah
                  karier siswa.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="alur"
        className="bg-[#edf4fb] py-24"
      >
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-blue-700">
              Alur Penggunaan
            </p>
            <h2 className="text-4xl font-black tracking-[-0.05em] text-slate-950 md:text-6xl">
              Dari data siswa menjadi arah keputusan.
            </h2>
          </div>

          <div className="relative mt-16 grid gap-6 lg:grid-cols-4">
            <div className="absolute left-0 top-12 hidden h-px w-full bg-slate-300 lg:block" />

            {steps.map((step, index) => (
              <div key={step.label} className="relative">
                <div className="relative z-10 mb-6 grid h-24 w-24 place-items-center rounded-[2rem] bg-white shadow-xl shadow-slate-900/10">
                  <span className="text-2xl font-black text-blue-700">
                    {index + 1}
                  </span>
                </div>

                <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-slate-900/5">
                  <h3 className="text-xl font-black">{step.label}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-6 py-24 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-900/5 md:p-10">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-blue-700">
            Hasil Rekomendasi
          </p>
          <h2 className="text-4xl font-black tracking-[-0.05em] text-slate-950 md:text-6xl">
            Output yang langsung bisa dipahami siswa.
          </h2>
          <p className="mt-6 max-w-2xl leading-8 text-slate-600">
            SkillLens menampilkan rekomendasi arah setelah lulus agar siswa
            dapat mengurangi kebingungan dan memiliki gambaran pilihan yang
            lebih sesuai dengan profil dirinya.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {outputs.map((output) => (
              <div
                key={output}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-700"
              >
                {output}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-blue-700 p-8 text-white shadow-xl shadow-blue-900/20 md:p-10">
          <TeacherIcon className="mb-10 h-14 w-14 text-cyan-200" />
          <h3 className="text-3xl font-black tracking-tight">
            Membantu guru BK memberi arahan yang lebih tepat.
          </h3>
          <p className="mt-5 leading-8 text-blue-50">
            Hasil rekomendasi dapat menjadi bahan pendukung dalam proses
            bimbingan karier, sehingga arahan yang diberikan tidak hanya
            berdasarkan perkiraan, tetapi juga berdasarkan data siswa.
          </p>
        </div>
      </section>

      <section className="mx-auto mb-16 w-[min(1180px,calc(100%-32px))] rounded-[2.5rem] bg-[#071526] p-8 text-white md:p-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
              SkillLens
            </p>
            <h2 className="max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-6xl">
              Siap bantu siswa menentukan arah setelah lulus.
            </h2>
            <p className="mt-5 max-w-2xl leading-8 text-slate-300">
              Mulai dari mengenali potensi diri, membaca kecocokan pilihan,
              sampai mendapatkan rekomendasi karier yang lebih terstruktur.
            </p>
          </div>

          <Link
            href="/siswa"
            className="inline-flex rounded-full bg-cyan-300 px-8 py-4 text-sm font-black text-slate-950 transition hover:-translate-y-1 hover:bg-white"
          >
            Mulai Sekarang
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col gap-4 border-t border-slate-200 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-cyan-300">
            <LensIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-black text-slate-950">SkillLens</p>
            <p>Sistem Informasi Perencanaan Karier Berbasis Web</p>
          </div>
        </div>

        <p>© 2026 SkillLens</p>
      </footer>
    </main>
  );
}