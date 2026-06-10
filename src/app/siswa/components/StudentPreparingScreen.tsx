"use client";

import { CardGridSkeleton, ListSkeleton, Skeleton } from "../../../components/ui/LoadingSkeleton";

export function StudentPreparingScreen() {
  return (
    <main className="min-h-screen skilllens-blue-page px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
        <div className="overflow-hidden rounded-[1.45rem] border border-sky-100 bg-white/90 p-4 shadow-sm shadow-sky-950/5 sm:rounded-[2rem] sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="w-full max-w-xl space-y-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-80 max-w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="w-full space-y-2 md:w-auto">
              <Skeleton className="h-12 w-full rounded-full md:h-14 md:w-44" />
              <p className="text-center text-xs font-bold text-slate-400 md:text-right">
                Memuat data siswa...
              </p>
            </div>
          </div>
        </div>
        <CardGridSkeleton count={4} />
        <div className="rounded-[1.45rem] border border-sky-100 bg-white/80 p-4 shadow-sm shadow-sky-950/5 sm:rounded-[2rem] sm:p-5">
          <ListSkeleton count={3} />
        </div>
      </div>
    </main>
  );
}
