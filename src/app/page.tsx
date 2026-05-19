import Link from "next/link";
import { Icon } from "../components/ui/icons";

// ========== DATA ==========
const features = [
  {
    title: "Integrasi Nilai Akademik",
    text: "Guru dapat mengunggah nilai siswa melalui file Excel dengan mudah. Siswa dapat melihat perkembangan nilai mereka secara real-time dan mengetahui posisi akademiknya.",
    icon: "academic",
  },
  {
    title: "Profil Siswa Terpadu",
    text: "Siswa bebas mengeksplorasi minat, bakat, hobi, prestasi, dan tujuan masa depan mereka. Semua data tersimpan rapi dalam satu profil yang dapat diakses kapan saja.",
    icon: "profile",
  },
  {
    title: "Rekomendasi Karier Terukur",
    text: "Sistem menganalisis nilai akademik, minat, bakat, prestasi, dan tujuan siswa untuk memberikan 3 rekomendasi jurusan/karier terbaik yang paling sesuai.",
    icon: "result",
  },
  {
    title: "Roadmap Belajar Personal",
    text: "Setiap siswa mendapatkan langkah-langkah belajar yang terstruktur berdasarkan rekomendasi kariernya. Dilengkapi link materi dan sumber belajar yang relevan dengan progresnya.",
    icon: "roadmap",
  },
  {
    title: "Monitoring Guru & Konsultasi",
    text: "Guru dapat memantau perkembangan setiap siswa, melihat hasil rekomendasi mereka, serta melakukan konsultasi karir secara lebih efektif dan terarah.",
    icon: "chart",
  },
];

const steps = [
  "Guru mendaftar dan mengajukan sekolah",
  "Admin memverifikasi data sekolah",
  "Guru mengimpor nilai siswa (Excel)",
  "Siswa melengkapi profil minat & bakat",
  "Siswa menerima 3 rekomendasi karier",
  "Siswa menjalankan roadmap belajar & guru memantau",
];

const metrics = [
  { label: "Analisis Profil", value: "Mendalam", icon: "profile", sub: "berdasarkan 7 aspek" },
  { label: "Rekomendasi Karier", value: "3", icon: "target", sub: "prioritas utama" },
  { label: "Roadmap", value: "Personal", icon: "roadmap", sub: "sesuai progres" },
  { label: "Monitoring Progres", value: "Real-time", icon: "dashboard", sub: "untuk guru" },
];

const recommendations = [
  { rank: 1, title: "Data Analyst", score: 92, match: "Sangat Tinggi" },
  { rank: 2, title: "Software Engineer", score: 89, match: "Tinggi" },
  { rank: 3, title: "UI/UX Designer", score: 82, match: "Tinggi" },
];

export default function Home() {
  return (
  <main className="min-h-screen overflow-x-hidden bg-transparent text-slate-950">
    {/* ========== NAVBAR FIXED ========== */}
    <nav className="fixed left-0 right-0 top-0 z-[999] border-b border-white/10 bg-[#0a0f2a]/80 backdrop-blur-xl">
      <div className="mx-auto flex w-[min(1220px,calc(100%-32px))] items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950 shadow-lg">
            <Icon name="spark" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              SkillLens
            </p>
            <p className="text-xs font-medium text-cyan-100/80">
              Career Decision Support
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-white/80 md:flex">
          <a href="#tentang" className="transition hover:text-cyan-300">
            Tentang
          </a>
          <a href="#fitur" className="transition hover:text-cyan-300">
            Fitur
          </a>
          <a href="#kelebihan" className="transition hover:text-cyan-300">
            Kelebihan
          </a>
          <a href="#peran" className="transition hover:text-cyan-300">
            Peran
          </a>
          <a href="#keamanan" className="transition hover:text-cyan-300">
            Keamanan
          </a>
          <a href="#alur" className="transition hover:text-cyan-300">
            Alur
          </a>
          <a href="#metode" className="transition hover:text-cyan-300">
            Metode
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white hover:text-slate-950 sm:inline-block"
          >
            Masuk
          </Link>

          <Link
            href="/auth/register"
            className="rounded-full bg-gradient-to-r from-cyan-300 to-sky-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:shadow-cyan-400/30"
          >
            Daftar Guru
          </Link>
        </div>
      </div>
    </nav>

    {/* ========== HERO SECTION ========== */}
    <section className="relative overflow-hidden pt-24 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f2a] via-[#0d1b3e] to-[#0a2a4a]" />
      <div className="absolute top-[-20%] left-[-40%] h-[45%] w-[70%] rounded-full bg-cyan-600 opacity-25 blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-30%] right-[-15%] h-[80%] w-[80%] rounded-full bg-blue-600 opacity-30 blur-[150px] animate-pulse-slow animation-delay-2000" />
      <div className="absolute top-[40%] right-[20%] h-[40%] w-[40%] rounded-full bg-indigo-100 opacity-20 blur-[100px] animate-pulse-slow animation-delay-4000" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,0.11)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.11)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0f2a] to-transparent" />

      <div className="relative z-10 mx-auto grid w-[min(1220px,calc(100%-32px))] gap-12 pb-24 pt-10 lg:grid-cols-2 lg:pb-32 lg:pt-16">
        <div className="animate-fade-up">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-white/10 px-3 py-1 text-sm font-semibold text-cyan-100 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-300"></span>
            Untuk SMA dan SMK
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            Arahkan Masa Depan{" "}
            <span className="text-cyan-300">Siswa</span> Lebih Jelas
          </h1>

          <p className="mt-5 max-w-xl text-base text-slate-200 md:text-lg">
            SkillLens adalah sistem pendukung keputusan karier yang memadukan
            nilai akademik dan profil pribadi siswa. Hasilnya: rekomendasi
            jurusan/karier yang tepat dan roadmap belajar terukur, dengan
            monitoring penuh dari guru.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950 shadow-md transition hover:-translate-y-0.5 hover:bg-white"
            >
              Mulai Sekarang
              <Icon name="chevronRight" className="h-4 w-4" />
            </Link>

            <Link
              href="#alur"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-medium backdrop-blur-sm transition hover:bg-white hover:text-slate-950"
            >
              Lihat Alur
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-xs text-cyan-100/80">
            <span className="flex items-center gap-1">
              <Icon name="check" className="h-3 w-3" /> Tanpa instalasi
            </span>
            <span className="flex items-center gap-1">
              <Icon name="check" className="h-3 w-3" /> Gratis untuk sekolah
            </span>
            <span className="flex items-center gap-1">
              <Icon name="check" className="h-3 w-3" /> Support 24/7
            </span>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="animate-fade-up rounded-2xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-md">
          <div className="overflow-hidden rounded-xl bg-white text-slate-950 shadow-lg">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#0f2a5f] to-[#1e3a8a] px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/20">
                  <Icon name="dashboard" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">Dashboard Guru</p>
                  <p className="text-xs text-white/70">
                    Monitoring & Rekomendasi
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                Live
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-4">
              <div className="rounded-lg bg-slate-50 p-2 text-center">
                <Icon name="users" className="mx-auto h-5 w-5 text-[#0f2a5f]" />
                <p className="text-xl font-bold">248</p>
                <p className="text-[10px] font-medium text-slate-400">
                  Siswa Aktif
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-2 text-center">
                <Icon
                  name="profile"
                  className="mx-auto h-5 w-5 text-[#0f2a5f]"
                />
                <p className="text-xl font-bold">92%</p>
                <p className="text-[10px] font-medium text-slate-400">
                  Profil Lengkap
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-2 text-center">
                <Icon name="target" className="mx-auto h-5 w-5 text-[#0f2a5f]" />
                <p className="text-xl font-bold">3.2</p>
                <p className="text-[10px] font-medium text-slate-400">
                  Rekomendasi/Siswa
                </p>
              </div>
            </div>

            <div className="px-4 pb-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase text-[#0f2a5f]">
                    Aktivitas Siswa & Guru
                  </p>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-600">
                    Live
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      student: "Anisa R.",
                      progress: "Profil 100%",
                      status: "Roadmap aktif",
                      guru: "Review nilai",
                      icon: "user",
                    },
                    {
                      student: "Bima S.",
                      progress: "Profil 80%",
                      status: "Minat diisi",
                      guru: "Ingatkan isi",
                      icon: "user",
                    },
                    {
                      student: "Citra D.",
                      progress: "Profil 100%",
                      status: "Rekomendasi dilihat",
                      guru: "Diskusi lanjut",
                      icon: "users",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs last:border-0"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f2a5f]/10">
                        <Icon
                          name={item.icon as any}
                          className="h-3 w-3 text-[#0f2a5f]"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">
                          {item.student}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {item.progress} • {item.status}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-medium shadow-sm">
                          📌 {item.guru}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 pt-1 text-center">
                  <p className="text-[9px] text-slate-400">
                    ↑ 3 siswa perlu bimbingan guru
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4 pt-2">
              {recommendations.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-2"
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400">
                      Peringkat {item.rank}
                    </p>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-[10px] text-emerald-600">
                      {item.match}
                    </p>
                  </div>

                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#0f2a5f] text-sm font-bold text-cyan-300">
                    {item.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ========== METRICS STRIP ========== */}
    <section className="relative -mt-8 z-20 mx-auto w-[min(1220px,calc(100%-32px))]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item) => (
          <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-md backdrop-blur-sm">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#eef5ff] text-[#0f2a5f]">
              <Icon name={item.icon as any} className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-950">{item.value}</p>
              <p className="text-sm font-semibold text-slate-700">{item.label}</p>
              <p className="text-xs text-slate-400">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ========== 1. TENTANG SKILLLENS & PENGGUNA ========== */}
    <section id="tentang" className="scroll-mt-24 mx-auto w-[min(1220px,calc(100%-32px))] py-20">
      <div className="grid gap-12 md:grid-cols-2 items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#0f2a5f]">Tentang SkillLens</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Platform <span className="text-cyan-600">Pendukung Keputusan Karier</span>
          </h2>
          <p className="mt-4 text-slate-500 leading-relaxed">
            SkillLens adalah aplikasi berbasis web yang dirancang untuk membantu siswa SMA/SMK menemukan arah karier yang paling sesuai dengan potensi mereka. 
            Dengan menggabungkan data nilai akademik (rapor), minat, bakat, hobi, prestasi, dan tujuan pribadi, sistem kami memberikan rekomendasi jurusan atau profesi yang akurat.
            Selain itu, setiap siswa mendapatkan roadmap belajar personal yang dilengkapi tautan materi belajar. Guru dapat memantau progres secara real-time dan memberikan bimbingan yang lebih terarah.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 flex items-center gap-2">
              <Icon name="school" className="h-4 w-4" /> Untuk SMA & SMK
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 flex items-center gap-2">
              <Icon name="users" className="h-4 w-4" /> Guru & Siswa
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 flex items-center gap-2">
              <Icon name="rocket" className="h-4 w-4" /> Gratis
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-white p-6 shadow-md border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="spark" className="h-6 w-6 text-cyan-500" />
            <h3 className="font-bold text-slate-800">Siapa yang Menggunakan?</h3>
          </div>
          <ul className="space-y-2">
            <li className="flex gap-2"><Icon name="check" className="h-4 w-4 text-emerald-500 mt-0.5" /> <span><strong>Guru BK / Wali Kelas</strong> – Memantau profil siswa, memberikan rekomendasi, dan konsultasi karier.</span></li>
            <li className="flex gap-2"><Icon name="check" className="h-4 w-4 text-emerald-500 mt-0.5" /> <span><strong>Siswa</strong> – Mengisi profil minat bakat, melihat rekomendasi, dan menjalankan roadmap belajar.</span></li>
            <li className="flex gap-2"><Icon name="check" className="h-4 w-4 text-emerald-500 mt-0.5" /> <span><strong>Admin Sekolah</strong> – Mengelola data sekolah dan verifikasi akun guru.</span></li>
          </ul>
        </div>
      </div>
    </section>

    {/* ========== 2. FITUR UNGGULAN ========== */}
    <section id="fitur" className="scroll-mt-24 bg-gradient-to-b from-slate-50 to-white py-20">
      <div className="mx-auto w-[min(1220px,calc(100%-32px))]">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-[#0f2a5f]">Fitur Unggulan</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Semua yang Dibutuhkan <span className="text-cyan-600">Sekolah & Siswa</span>
          </h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            Dari input nilai, eksplorasi minat, rekomendasi cerdas, hingga monitoring progres – semuanya terintegrasi dalam satu platform.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {features.map((feat) => (
            <div key={feat.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#0f2a5f] to-[#1e3a8a] text-white">
                <Icon name={feat.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-950">{feat.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{feat.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ========== 3. KELEBIHAN SKILLLENS ========== */}
    <section id="kelebihan" className="scroll-mt-24 mx-auto w-[min(1220px,calc(100%-32px))] py-20">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-[#0f2a5f]">Keunggulan</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
          Mengapa <span className="text-cyan-600">SkillLens</span> Lebih Unggul?
        </h2>
        <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
          Dibandingkan dengan bimbingan karier konvensional, SkillLens menawarkan berbagai kelebihan.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Akurat & Personal", desc: "Rekomendasi berdasarkan data nyata (nilai + minat + bakat + prestasi + tujuan), bukan sekadar tes minat biasa.", icon: "target" },
          { title: "Efisien untuk Guru", desc: "Tidak perlu input nilai satu per satu. Cukup upload file Excel, sistem langsung memproses.", icon: "upload" },
          { title: "Roadmap Konkret", desc: "Setiap rekomendasi disertai langkah belajar dan tautan materi (video, artikel, kursus) yang sesuai progres.", icon: "roadmap" },
          { title: "Monitoring Real-time", desc: "Guru bisa melihat siapa saja yang sudah mengisi profil, sudah mendapat rekomendasi, dan progres roadmap siswa.", icon: "dashboard" },
          { title: "Gratis Sepenuhnya", desc: "Tidak ada biaya untuk sekolah. Kami percaya perencanaan karier harus dapat diakses semua.", icon: "spark" },
          { title: "Berbasis Web", desc: "Akses dari laptop, tablet, atau HP dengan browser. Tidak perlu instalasi aplikasi.", icon: "rocket" },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#eef5ff] text-[#0f2a5f]">
                <Icon name={item.icon as any} className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ========== 4. PERAN GURU & SISWA ========== */}
    <section id="peran" className="scroll-mt-24 bg-gradient-to-b from-slate-50 to-white py-20">
      <div className="mx-auto w-[min(1220px,calc(100%-32px))]">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-[#0f2a5f]">Untuk Siapa?</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Kolaborasi <span className="text-cyan-600">Guru & Siswa</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#0f2a5f] text-white">
                <Icon name="users" className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-950">Untuk Guru</h3>
            </div>
            <ul className="mt-5 space-y-2">
              <li className="flex gap-2 text-sm"><Icon name="check" className="h-4 w-4 text-emerald-500" /> Upload nilai siswa via Excel (sekali klik)</li>
              <li className="flex gap-2 text-sm"><Icon name="check" className="h-4 w-4 text-emerald-500" /> Pantau kelengkapan profil dan progres roadmap siswa</li>
              <li className="flex gap-2 text-sm"><Icon name="check" className="h-4 w-4 text-emerald-500" /> Akses rekomendasi karier setiap siswa untuk konsultasi</li>
              <li className="flex gap-2 text-sm"><Icon name="check" className="h-4 w-4 text-emerald-500" /> Laporan perkembangan kelas secara real-time</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-white p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-600 text-white">
                <Icon name="guidance" className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-950">Untuk Siswa</h3>
            </div>
            <ul className="mt-5 space-y-2">
              <li className="flex gap-2 text-sm"><Icon name="check" className="h-4 w-4 text-emerald-500" /> Eksplorasi minat, bakat, dan tujuan masa depan</li>
              <li className="flex gap-2 text-sm"><Icon name="check" className="h-4 w-4 text-emerald-500" /> Dapatkan 3 rekomendasi jurusan/karier terbaik</li>
              <li className="flex gap-2 text-sm"><Icon name="check" className="h-4 w-4 text-emerald-500" /> Ikuti roadmap belajar dengan link materi relevan</li>
              <li className="flex gap-2 text-sm"><Icon name="check" className="h-4 w-4 text-emerald-500" /> Pantau progres sendiri dan diskusi dengan guru</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* ========== 5. KEAMANAN & AUTENTIKASI ========== */}
    <section id="keamanan" className="scroll-mt-24 mx-auto w-[min(1220px,calc(100%-32px))] py-20">
      <div className="grid gap-8 md:grid-cols-2 items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#0f2a5f]">Keamanan & Privasi</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Data <span className="text-cyan-600">Terjaga</span> dengan Sistem Autentikasi
          </h2>
          <p className="mt-4 text-slate-500">
            SkillLens mengutamakan keamanan data pengguna. Setiap akun dilindungi dengan autentikasi yang aman, dan data hanya dapat diakses 
            oleh pihak yang memiliki otoritas (guru untuk data kelasnya, siswa untuk datanya sendiri, admin untuk verifikasi sekolah). 
            Kami tidak pernah membagikan data pribadi ke pihak ketiga.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="shield" className="h-6 w-6 text-emerald-600" />
            <h3 className="font-bold text-slate-800">Keamanan Data</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2"><Icon name="check" className="h-4 w-4 text-emerald-500" /> Enkripsi data nilai dan profil siswa.</li>
            <li className="flex gap-2"><Icon name="check" className="h-4 w-4 text-emerald-500" /> Hanya pengguna yang berwenang (guru, siswa, admin) yang dapat mengakses data sesuai perannya.</li>
            <li className="flex gap-2"><Icon name="check" className="h-4 w-4 text-emerald-500" /> Autentikasi menggunakan email dan password yang di-hash.</li>
            <li className="flex gap-2"><Icon name="check" className="h-4 w-4 text-emerald-500" /> Server aman dengan backup berkala.</li>
          </ul>
        </div>
      </div>
    </section>

    {/* ========== 6. ALUR KERJA ========== */}
    <section id="alur" className="scroll-mt-24 bg-gradient-to-b from-slate-50 to-white py-20">
      <div className="mx-auto w-[min(1220px,calc(100%-32px))]">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-[#0f2a5f]">Alur Kerja</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Proses Sederhana & Cepat</h2>
          <p className="mt-3 text-slate-500">Enam langkah mudah menuju karier yang terencana.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4 rounded-xl bg-white p-5 shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eef5ff] font-bold text-[#0f2a5f]">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <p className="text-sm font-medium text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ========== 7. METODE ========== */}
    <section id="metode" className="scroll-mt-24 bg-slate-900 py-20 text-white">
      <div className="mx-auto w-[min(1220px,calc(100%-32px))] grid gap-12 md:grid-cols-2 items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">Metode Cerdas</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Gabungkan Data Akademik & Profil Pribadi</h2>
          <p className="mt-4 text-slate-300">SkillLens menggunakan pendekatan holistik: nilai rapor dipadukan dengan minat, bakat, prestasi, dan tujuan siswa untuk menghasilkan rekomendasi yang personal dan akurat.</p>
          <div className="mt-8 space-y-3">
            <div className="flex gap-3 rounded-xl bg-white/10 p-4">
              <span className="font-bold text-cyan-300">01</span>
              <div><h4 className="font-bold">Input</h4><p className="text-sm text-slate-300">Nilai akademik (rapor) + minat, bakat, hobi, prestasi, tujuan karier</p></div>
            </div>
            <div className="flex gap-3 rounded-xl bg-white/10 p-4">
              <span className="font-bold text-cyan-300">02</span>
              <div><h4 className="font-bold">Proses</h4><p className="text-sm text-slate-300">Normalisasi data & pencocokan dengan database jurusan/profesi</p></div>
            </div>
            <div className="flex gap-3 rounded-xl bg-white/10 p-4">
              <span className="font-bold text-cyan-300">03</span>
              <div><h4 className="font-bold">Output</h4><p className="text-sm text-slate-300">3 rekomendasi prioritas + roadmap belajar terukur</p></div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 backdrop-blur border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="chart" className="h-8 w-8 text-cyan-300" />
            <h3 className="text-xl font-bold">Akurasi Rekomendasi</h3>
          </div>
          <p className="text-sm text-slate-300">Semakin banyak data (nilai + profil) semakin akurat rekomendasi yang dihasilkan.</p>
          <div className="mt-6 h-2 w-full rounded-full bg-slate-700 overflow-hidden">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"></div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Tingkat kesesuaian: 87% (uji coba terbatas)</p>
        </div>
      </div>
    </section>

    {/* ========== CTA ========== */}
    <section className="mx-auto w-[min(1220px,calc(100%-32px))] py-20">
      <div className="rounded-2xl bg-gradient-to-r from-[#0f2a5f] to-[#1e3a8a] p-8 text-white shadow-xl md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-cyan-200">Siap membawa sekolahmu lebih maju?</p>
            <h3 className="text-2xl font-bold md:text-3xl">Mulai gunakan SkillLens sekarang</h3>
            <p className="mt-1 text-slate-200">Daftar sebagai guru dan bantu siswa menemukan arah karier terbaik mereka.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/register" className="rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 shadow-md transition hover:-translate-y-0.5 hover:bg-white">
              Daftar Gratis
            </Link>
            <Link href="/auth/login" className="rounded-full border border-white/30 bg-white/10 px-6 py-3 font-medium backdrop-blur-sm transition hover:bg-white hover:text-slate-950">
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </section>

    <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
      © {new Date().getFullYear()} SkillLens - Sistem Pendukung Keputusan Karier untuk SMA/SMK
    </footer>
  </main>
  );
}