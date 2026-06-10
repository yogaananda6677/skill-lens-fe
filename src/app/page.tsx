import Link from "next/link";
import { Icon } from "../components/ui/icons";
import { PublicNavbar } from "../components/layout/PublicNavbar";

const HERO_IMAGE = "/images/skilllens-hero.png";

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
  "Admin sekolah mendaftar dan mengajukan sekolah",
  "Admin memverifikasi data sekolah",
  "Guru mengimpor nilai siswa (Excel)",
  "Siswa melengkapi profil minat & bakat",
  "Siswa menerima 3 rekomendasi karier",
  "Siswa menjalankan roadmap belajar & guru memantau",
];

const metrics = [
  { label: "Secara Mendalam", value: "Analisis Profil", icon: "profile", sub: "berdasarkan 7 aspek" },
  { label: "Karir", value: "3 Rekomendasi", icon: "target", sub: "berdasarkan hasil analisa" },
  { label: "Menuju karir impian", value: "Roadmap", icon: "roadmap", sub: "sesuai progres" },
  { label: "Per progress", value: "Catatan Bimbingan", icon: "dashboard", sub: "dari guru" },
];

const recommendations = [
  { rank: 1, title: "Data Analyst", score: 92, match: "Sangat Tinggi" },
  { rank: 2, title: "Software Engineer", score: 89, match: "Tinggi" },
  { rank: 3, title: "UI/UX Designer", score: 82, match: "Tinggi" },
];

function IconBox({ icon }: { icon: string }) {
  return (
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700 shadow-sm shadow-sky-100/70">
      <Icon name={icon as any} className="h-5 w-5" />
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  center = true,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className={`mt-3 text-sm font-semibold leading-7 text-slate-500 ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

function SoftCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100/60 transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300 opacity-80" />
      <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-cyan-200/25 blur-2xl transition group-hover:bg-cyan-200/40" />
      <div className="relative">{children}</div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <PublicNavbar />

      <section className="relative overflow-hidden pt-20 text-white sm:pt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f2a] via-[#0d1b3e] to-[#0a2a4a]" />
        <div className="absolute top-[-20%] left-[-40%] h-[45%] w-[70%] rounded-full bg-cyan-600 opacity-25 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-30%] right-[-15%] h-[80%] w-[80%] rounded-full bg-blue-600 opacity-30 blur-[150px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-[40%] right-[20%] h-[40%] w-[40%] rounded-full bg-indigo-100 opacity-20 blur-[100px] animate-pulse-slow animation-delay-4000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,0.11)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.11)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0f2a] to-transparent" />

        <div className="relative z-10 mx-auto grid w-[min(1220px,calc(100%-24px))] gap-7 pb-14 pt-7 sm:w-[min(1220px,calc(100%-32px))] sm:gap-10 sm:pb-20 sm:pt-10 lg:grid-cols-2 lg:gap-12 lg:pb-28 lg:pt-16">
          <div className="animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-white/10 px-3 py-1 text-sm font-semibold text-cyan-100 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-cyan-300"></span>
              Untuk SMA/SMK
            </div>

            <h1 className="max-w-2xl text-[2rem] font-bold leading-[1.14] tracking-tight text-white sm:text-4xl md:text-6xl lg:text-7xl">
              Arahkan Masa Depan{" "}
              <span className="text-cyan-300">Siswa</span> Lebih Jelas
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 sm:mt-5 sm:text-base sm:leading-7 md:text-lg">
              SkillLens adalah sistem pendukung keputusan karier yang memadukan
              nilai akademik dan profil pribadi siswa. <br />
              Hasilnya: rekomendasi
              jurusan/karier yang tepat dan roadmap belajar terukur, dengan
              monitoring penuh dari guru.
            </p>

            <div className="mt-7 grid gap-3 min-[420px]:flex min-[420px]:flex-wrap sm:mt-8">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950 shadow-md transition hover:-translate-y-0.5 hover:bg-white"
              >
                Mulai Sekarang
                <Icon name="chevronRight" className="h-4 w-4" />
              </Link>

              <Link
                href="#alur"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-medium backdrop-blur-sm transition hover:bg-white hover:text-slate-950"
              >
                Lihat Alur
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-cyan-100/80 sm:mt-8 sm:text-xs">
              <span className="flex items-center gap-1">
                <Icon name="check" className="h-3 w-3" /> Mudah diakses
              </span>
              <span className="flex items-center gap-1">
                <Icon name="check" className="h-3 w-3" /> Gratis untuk sekolah
              </span>
              <span className="flex items-center gap-1">
                <Icon name="check" className="h-3 w-3" /> Support 24/7
              </span>
            </div>
          </div>

          <div className="relative flex animate-fade-up items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] px-1 pt-4 shadow-2xl shadow-blue-950/20 sm:overflow-visible sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none lg:w-full">
            <img
              src={HERO_IMAGE}
              alt="Preview tampilan SkillLens"
              loading="eager"
              decoding="async"
              className="h-auto w-full max-w-[36rem] object-contain sm:max-w-[42rem] lg:w-[135%] lg:max-w-none lg:-translate-x-[8%]"
            />
          </div>
        </div>
      </section>

      <section className="relative -mt-5 z-20 mx-auto w-[min(1220px,calc(100%-24px))] sm:-mt-8 sm:w-[min(1220px,calc(100%-32px))]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((item) => (
            <SoftCard key={item.label} className="bg-white/95 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-4 pt-1">
                <IconBox icon={item.icon} />
                <div className="min-w-0">
                  <p className="text-xl font-black leading-tight text-slate-950">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {item.label}
                  </p>
                  <p className="text-xs font-semibold text-slate-400">
                    {item.sub}
                  </p>
                </div>
              </div>
            </SoftCard>
          ))}
        </div>
      </section>

      <section id="tentang" className="scroll-mt-24 mx-auto w-[min(1220px,calc(100%-24px))] py-14 sm:w-[min(1220px,calc(100%-32px))] sm:py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <SectionHeader
              center={false}
              eyebrow="Tentang SkillLens"
              title={<>Platform <span className="text-cyan-600">Pendukung Keputusan Karier</span></>}
            />
            <p className="mt-4 leading-relaxed text-slate-500">
              SkillLens adalah aplikasi berbasis web yang dirancang untuk membantu siswa SMA/SMK menemukan arah karier yang paling sesuai dengan potensi mereka. 
              Dengan menggabungkan data nilai akademik (rapor), minat, bakat, hobi, prestasi, dan tujuan pribadi, sistem kami memberikan rekomendasi jurusan atau profesi yang akurat.
              Selain itu, setiap siswa mendapatkan roadmap belajar personal yang dilengkapi tautan materi belajar. Guru dapat memantau progres secara real-time dan memberikan bimbingan yang lebih terarah.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700">
                <Icon name="school" className="h-4 w-4" /> Untuk SMA & SMK
              </div>
              <div className="flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700">
                <Icon name="users" className="h-4 w-4" /> Guru & Siswa
              </div>
              <div className="flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700">
                <Icon name="rocket" className="h-4 w-4" /> Gratis
              </div>
            </div>
          </div>

          <SoftCard className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <IconBox icon="spark" />
              <h3 className="font-black text-slate-800">Siapa yang Menggunakan?</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm leading-6 text-slate-600">
                <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                <span><strong>Guru</strong> – Memantau profil siswa, memberikan rekomendasi, dan konsultasi karier.</span>
              </li>
              <li className="flex gap-3 text-sm leading-6 text-slate-600">
                <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                <span><strong>Siswa</strong> – Mengisi profil minat bakat, melihat rekomendasi, dan menjalankan roadmap belajar.</span>
              </li>
              <li className="flex gap-3 text-sm leading-6 text-slate-600">
                <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                <span><strong>Admin Sekolah</strong> – Mengelola data sekolah dan verifikasi akun guru.</span>
              </li>
            </ul>
          </SoftCard>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-24 bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="mx-auto w-[min(1220px,calc(100%-32px))]">
          <SectionHeader
            eyebrow="Fitur Unggulan"
            title={<>Semua yang Dibutuhkan <span className="text-cyan-600">Sekolah & Siswa</span></>}
            description="Dari input nilai, eksplorasi minat, rekomendasi cerdas, hingga monitoring progres – semuanya terintegrasi dalam satu platform."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {features.map((feat) => (
              <SoftCard key={feat.title} className="p-6">
                <IconBox icon={feat.icon} />
                <h3 className="mt-4 text-lg font-bold text-slate-950">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{feat.text}</p>
              </SoftCard>
            ))}
          </div>
        </div>
      </section>

      <section id="kelebihan" className="scroll-mt-24 mx-auto w-[min(1220px,calc(100%-24px))] py-14 sm:w-[min(1220px,calc(100%-32px))] sm:py-20">
        <SectionHeader
          eyebrow="Keunggulan"
          title={<>Mengapa <span className="text-cyan-600">SkillLens</span> Lebih Unggul?</>}
          description="Dibandingkan dengan bimbingan karier konvensional, SkillLens menawarkan berbagai kelebihan."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Akurat & Personal", desc: "Rekomendasi berdasarkan data nyata (nilai + minat + bakat + prestasi + tujuan), bukan sekadar tes minat biasa.", icon: "target" },
            { title: "Efisien untuk Guru", desc: "Tidak perlu input nilai satu per satu. Cukup upload file Excel, sistem langsung memproses.", icon: "upload" },
            { title: "Roadmap Konkret", desc: "Setiap rekomendasi disertai langkah belajar dan tautan materi (video, artikel, kursus) yang sesuai progres.", icon: "roadmap" },
            { title: "Monitoring Real-time", desc: "Guru bisa melihat siapa saja yang sudah mengisi profil, sudah mendapat rekomendasi, dan progres roadmap siswa.", icon: "dashboard" },
            { title: "Gratis Sepenuhnya", desc: "Tidak ada biaya untuk sekolah. Kami percaya perencanaan karier harus dapat diakses semua.", icon: "spark" },
            { title: "Berbasis Web", desc: "Akses dari laptop, tablet, atau HP dengan browser. Tidak perlu instalasi aplikasi.", icon: "rocket" },
          ].map((item) => (
            <SoftCard key={item.title}>
              <div className="flex items-start gap-3">
                <IconBox icon={item.icon} />
                <div>
                  <h3 className="font-bold text-slate-800">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.desc}</p>
                </div>
              </div>
            </SoftCard>
          ))}
        </div>
      </section>

      <section id="peran" className="scroll-mt-24 bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="mx-auto w-[min(1220px,calc(100%-32px))]">
          <SectionHeader
            eyebrow="Untuk Siapa?"
            title={<>Kolaborasi <span className="text-cyan-600">Guru & Siswa</span></>}
          />
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <SoftCard className="p-6">
              <div className="flex items-center gap-3">
                <IconBox icon="users" />
                <h3 className="text-xl font-black text-slate-950">Untuk Guru</h3>
              </div>
              <ul className="mt-5 space-y-3">
                <li className="flex gap-3 text-sm text-slate-600"><Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> Upload nilai siswa via Excel (sekali klik)</li>
                <li className="flex gap-3 text-sm text-slate-600"><Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> Pantau kelengkapan profil dan progres roadmap siswa</li>
                <li className="flex gap-3 text-sm text-slate-600"><Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> Akses rekomendasi karier setiap siswa untuk konsultasi</li>
                <li className="flex gap-3 text-sm text-slate-600"><Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> Laporan perkembangan kelas secara real-time</li>
              </ul>
            </SoftCard>

            <SoftCard className="p-6">
              <div className="flex items-center gap-3">
                <IconBox icon="guidance" />
                <h3 className="text-xl font-black text-slate-950">Untuk Siswa</h3>
              </div>
              <ul className="mt-5 space-y-3">
                <li className="flex gap-3 text-sm text-slate-600"><Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> Eksplorasi minat, bakat, dan tujuan masa depan</li>
                <li className="flex gap-3 text-sm text-slate-600"><Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> Dapatkan 3 rekomendasi jurusan/karier terbaik</li>
                <li className="flex gap-3 text-sm text-slate-600"><Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> Ikuti roadmap belajar dengan link materi relevan</li>
                <li className="flex gap-3 text-sm text-slate-600"><Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> Pantau progres sendiri dan diskusi dengan guru</li>
              </ul>
            </SoftCard>
          </div>
        </div>
      </section>

      <section id="keamanan" className="scroll-mt-24 mx-auto w-[min(1220px,calc(100%-24px))] py-14 sm:w-[min(1220px,calc(100%-32px))] sm:py-20">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <SectionHeader
              center={false}
              eyebrow="Keamanan & Privasi"
              title={<>Data <span className="text-cyan-600">Terjaga</span> dengan Sistem Autentikasi</>}
            />
            <p className="mt-4 text-slate-500">
              SkillLens mengutamakan keamanan data pengguna. Setiap akun dilindungi dengan autentikasi yang aman, dan data hanya dapat diakses 
              oleh pihak yang memiliki otoritas (guru untuk data kelasnya, siswa untuk datanya sendiri, admin untuk verifikasi sekolah). 
              Kami tidak pernah membagikan data pribadi ke pihak ketiga.
            </p>
          </div>
          <SoftCard className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <IconBox icon="shield" />
              <h3 className="font-black text-slate-800">Keamanan Data</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3"><Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> Enkripsi data nilai dan profil siswa.</li>
              <li className="flex gap-3"><Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> Hanya pengguna yang berwenang (guru, siswa, admin) yang dapat mengakses data sesuai perannya.</li>
              <li className="flex gap-3"><Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> Autentikasi menggunakan email dan password yang di-hash.</li>
              <li className="flex gap-3"><Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> Server aman dengan backup berkala.</li>
            </ul>
          </SoftCard>
        </div>
      </section>

      <section id="alur" className="scroll-mt-24 bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="mx-auto w-[min(1220px,calc(100%-32px))]">
          <SectionHeader
            eyebrow="Alur Kerja"
            title="Proses Sederhana & Cepat"
            description="Enam langkah mudah menuju karier yang terencana."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, idx) => (
              <SoftCard key={idx}>
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 font-black text-sky-700 shadow-sm">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <p className="text-sm font-semibold leading-6 text-slate-700">{step}</p>
                </div>
              </SoftCard>
            ))}
          </div>
        </div>
      </section>

      <section id="metode" className="scroll-mt-24 bg-slate-900 py-20 text-white">
        <div className="mx-auto grid w-[min(1220px,calc(100%-32px))] items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">Metode Terbaru!</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Gabungkan Data Akademik & Profil Pribadi</h2>
            <p className="mt-4 text-slate-300">SkillLens menggunakan metode Fuzzy-assisted & TOPSIS serta pendekatan holistik: nilai akademik dipadukan dengan minat, bakat, prestasi, dan tujuan siswa untuk menghasilkan rekomendasi yang personal dan akurat.</p>
            <div className="mt-8 space-y-3">
              <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur">
                <span className="font-bold text-cyan-300">01</span>
                <div><h4 className="font-bold">Input</h4><p className="text-sm text-slate-300">Nilai akademik + minat, bakat, hobi, prestasi, tujuan setelah lulus</p></div>
              </div>
              <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur">
                <span className="font-bold text-cyan-300">02</span>
                <div><h4 className="font-bold">Proses</h4><p className="text-sm text-slate-300">Normalisasi data & pencocokan dengan database jurusan/profesi</p></div>
              </div>
              <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur">
                <span className="font-bold text-cyan-300">03</span>
                <div><h4 className="font-bold">Output</h4><p className="text-sm text-slate-300">3 rekomendasi prioritas + roadmap belajar terukur</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[min(1220px,calc(100%-24px))] py-14 sm:w-[min(1220px,calc(100%-32px))] sm:py-20">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-[#0f2a5f] to-[#1e3a8a] p-8 text-white shadow-xl md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-200">Siap membawa sekolahmu lebih maju?</p>
              <h3 className="text-2xl font-bold md:text-3xl">Mulai gunakan SkillLens sekarang</h3>
              <p className="mt-1 text-slate-200">Daftar sebagai admin sekolah dan bantu siswa menemukan arah karier terbaik mereka.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register" className="rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 shadow-md transition hover:-translate-y-0.5 hover:bg-white">
                Daftar Admin Sekolah
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
