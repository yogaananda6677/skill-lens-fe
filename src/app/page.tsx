import Link from "next/link";
import { Icon } from "../components/ui/icons";

const features = [
  {
    title: "Profil siswa lebih rapi",
    text: "Minat, bakat, hobi, prestasi, dan tujuan belajar tersusun dalam satu alur yang mudah diisi.",
    icon: "profile",
  },
  {
    title: "Data akademik terintegrasi",
    text: "Guru cukup unggah data nilai. Siswa tidak perlu memasukkan nilai manual lagi.",
    icon: "academic",
  },
  {
    title: "Hasil rekomendasi terukur",
    text: "Sistem membantu menampilkan pilihan karier prioritas berdasarkan data sekolah dan profil siswa.",
    icon: "result",
  },
  {
    title: "Roadmap tindak lanjut",
    text: "Setelah memilih arah karier, siswa mendapat langkah belajar yang bisa dipantau progresnya.",
    icon: "roadmap",
  },
] as const;

const steps = [
  ["01", "Guru daftar", "Guru membuat akun dan mengajukan sekolah."],
  ["02", "Admin verifikasi", "Admin meninjau data sekolah yang masuk."],
  ["03", "Import nilai", "Nilai siswa diunggah dari template sekolah."],
  ["04", "Lengkapi profil", "Siswa mengisi minat, bakat, dan tujuan."],
  ["05", "Lihat hasil", "Sistem menampilkan rekomendasi arah karier."],
  ["06", "Jalankan roadmap", "Siswa mengikuti langkah pengembangan diri."],
] as const;

const metrics = [
  ["5", "semester nilai"],
  ["3", "rekomendasi utama"],
  ["1", "profil terpusat"],
  ["24/7", "akses dashboard"],
] as const;

const chartBars = [60, 72, 66, 81, 77, 86, 84];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-transparent text-slate-950">
      <section className="relative text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#081225_0%,#0d1e40_45%,#13376e_100%)]" />
        <div className="absolute inset-0 opacity-50">
          <div className="absolute left-[-110px] top-[-160px] h-[340px] w-[340px] rounded-full bg-cyan-400 blur-[110px]" />
          <div className="absolute bottom-[-170px] right-[-90px] h-[420px] w-[420px] rounded-full bg-sky-500 blur-[130px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />

        <nav className="relative z-10 mx-auto flex w-[min(1220px,calc(100%-32px))] items-center justify-between gap-4 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950 shadow-lg shadow-black/10">
              <Icon name="spark" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">SkillLens</p>
              <p className="text-xs font-medium text-cyan-100/70">Career Decision Support</p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold text-white/70 md:flex">
            <a href="#fitur" className="hover:text-white">Fitur</a>
            <a href="#alur" className="hover:text-white">Alur</a>
            <a href="#metode" className="hover:text-white">Metode</a>
            <a href="#kontak" className="hover:text-white">Bantuan</a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white hover:text-slate-950 sm:inline-flex">
              Masuk
            </Link>
            <Link href="/auth/register" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(103,232,249,0.35)] transition hover:-translate-y-0.5 hover:bg-white">
              Daftar Guru
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid w-[min(1220px,calc(100%-32px))] gap-12 pb-20 pt-10 lg:grid-cols-[1fr_520px] lg:pb-28 lg:pt-16">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-200/20 bg-white/8 px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
              Untuk sekolah SMA dan SMK
            </div>
            <h1 className="text-[38px] font-semibold leading-[0.98] tracking-[-0.065em] text-white md:text-7xl lg:text-[76px]">
              Arah karier siswa yang lebih jelas, rapi, dan mudah dipantau.
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-8 text-slate-200 md:text-lg">
              SkillLens membantu sekolah menggabungkan nilai akademik dan profil siswa untuk menghasilkan rekomendasi karier serta roadmap pengembangan diri dalam satu dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/login" className="rounded-full bg-cyan-300 px-7 py-4 text-center text-sm font-medium text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-white">
                Masuk ke aplikasi
              </Link>
              <Link href="/auth/register" className="rounded-full border border-white/15 bg-white/10 px-7 py-4 text-center text-sm font-medium text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950">
                Buat akun guru
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
              {[
                ["Upload nilai lebih cepat", "Data akademik dibaca dari file sekolah yang sudah disiapkan."],
                ["Hasil mudah dipahami", "Rekomendasi dan roadmap tampil lebih ringkas untuk guru dan siswa."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="font-medium text-white">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-3 shadow-2xl shadow-black/20 backdrop-blur md:p-4">
            <div className="overflow-hidden rounded-[1.5rem] bg-white text-slate-950 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between bg-gradient-to-r from-[#0f2a5f] to-[#1d4ed8] px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#0f2a5f]">
                    <Icon name="dashboard" className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dashboard Karier</p>
                    <p className="text-xs text-white/70">Ringkasan siswa dan rekomendasi</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Live</span>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-3">
                {[
                  ["248", "Siswa"],
                  ["92%", "Data valid"],
                  ["3", "Pilihan utama"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-2xl font-semibold text-slate-950">{value}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{label}</p>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-5">
                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#0f2a5f]">Progress siswa</p>
                      <h2 className="mt-1 text-xl font-semibold">Kesiapan profil dan hasil</h2>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Naik 18%</span>
                  </div>
                  <div className="mt-6 flex h-40 items-end gap-3">
                    {chartBars.map((value, index) => (
                      <div key={index} className="flex flex-1 flex-col items-center gap-2">
                        <div className="w-full rounded-t-2xl bg-gradient-to-t from-[#0f2a5f] to-cyan-300" style={{ height: `${value}%` }} />
                        <span className="text-[10px] font-medium text-slate-400">S{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    ["Data Analyst", "92"],
                    ["Software Engineer", "89"],
                    ["UI/UX Designer", "82"],
                  ].map(([title, score], index) => (
                    <div key={title} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Peringkat {index + 1}</p>
                        <p className="mt-1 text-sm font-medium text-slate-950">{title}</p>
                      </div>
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 font-medium text-cyan-300">{score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-[min(1220px,calc(100%-32px))] gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([value, label]) => (
          <div key={label} className="rounded-[1.5rem] border border-white/70 bg-white/80 p-6 text-center shadow-xl shadow-slate-900/5 backdrop-blur">
            <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
            <p className="mt-2 text-sm font-medium text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section id="fitur" className="mx-auto w-[min(1220px,calc(100%-32px))] py-10 md:py-14">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#0f2a5f]">Fitur utama</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">Antarmuka lebih bersih dan mudah dipakai.</h2>
          <p className="mt-4 text-base leading-8 text-slate-500">Setiap tampilan dirancang supaya informasi penting lebih cepat terlihat di layar laptop maupun ponsel.</p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((item) => (
            <article key={item.title} className="rounded-[1.9rem] border border-slate-100 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef5ff] text-[#0f2a5f]">
                <Icon name={item.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="alur" className="mx-auto w-[min(1220px,calc(100%-32px))] py-10 md:py-14">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/10 md:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-200">Alur singkat</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Proses kerja lebih jelas dari awal sampai tindak lanjut.</h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {steps.map(([num, title, text]) => (
              <article key={num} className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">Langkah {num}</p>
                <h3 className="mt-2 text-xl font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="metode" className="mx-auto grid w-[min(1220px,calc(100%-32px))] gap-6 py-10 md:grid-cols-[1fr_0.9fr] md:py-14">
        <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#0f2a5f]">Metode</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Data akademik dan profil siswa dipadukan dalam satu proses.</h2>
          <p className="mt-4 text-base leading-8 text-slate-500">Halaman ini dibuat lebih ringkas agar pengguna langsung paham fungsi sistem tanpa dibebani kalimat yang terlalu panjang.</p>
        </article>

        <article className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-8">
          <div className="space-y-4">
            {[
              ["Input", "Nilai akademik, minat, bakat, hobi, dan tujuan siswa."],
              ["Proses", "Pengolahan data untuk membantu menyusun prioritas rekomendasi."],
              ["Output", "Pilihan karier dan roadmap tindak lanjut yang lebih mudah dibaca."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[1.25rem] bg-slate-50 p-4">
                <p className="font-medium text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section id="kontak" className="mx-auto w-[min(1220px,calc(100%-32px))] pb-16 pt-8 md:pb-24">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#0f2a5f]">Mulai sekarang</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">Tampilan lebih ringan, konsisten, dan siap dipakai di project Next.js.</h2>
              <p className="mt-4 text-base leading-8 text-slate-500">Masuk untuk mengelola dashboard, atau buat akun guru jika belum terdaftar.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/login" className="rounded-full bg-slate-950 px-6 py-4 text-center text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#0f2a5f]">Masuk</Link>
              <Link href="/auth/register" className="rounded-full border border-slate-200 bg-white px-6 py-4 text-center text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950">Daftar Guru</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
