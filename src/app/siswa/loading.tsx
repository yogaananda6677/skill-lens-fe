import { CardGridSkeleton, ListSkeleton, Skeleton } from "../../components/ui/LoadingSkeleton";

export default function SiswaLoading() {
  return (
    <main className="min-h-screen skilllens-blue-page px-3 py-5 sm:px-5 sm:py-8">
      <section className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
        <div className="overflow-hidden rounded-[1.45rem] border border-white/10 skilllens-hero-grid p-4 text-white shadow-2xl shadow-blue-950/20 sm:rounded-[2rem] sm:p-6 md:p-8">
          <div className="max-w-2xl space-y-3">
            <Skeleton className="h-3 w-36 bg-white/20" />
            <Skeleton className="h-8 w-full max-w-md bg-white/20 sm:h-11" />
            <Skeleton className="h-4 w-full max-w-xl bg-white/20" />
            <Skeleton className="h-4 w-4/5 max-w-lg bg-white/20" />
          </div>
          <div className="mt-5 grid gap-3 min-[420px]:flex">
            <Skeleton className="h-11 w-full rounded-full bg-white/20 min-[420px]:w-44" />
            <Skeleton className="h-11 w-full rounded-full bg-white/20 min-[420px]:w-44" />
          </div>
          <p className="mt-5 text-xs font-bold text-cyan-100/75">
            Memuat data siswa, tunggu sebentar...
          </p>
        </div>

        <CardGridSkeleton count={4} />
        <div className="rounded-[1.5rem] border border-sky-100 bg-white/85 p-4 shadow-sm shadow-sky-950/5 sm:rounded-[2rem] sm:p-5">
          <ListSkeleton count={3} />
        </div>
      </section>
    </main>
  );
}
