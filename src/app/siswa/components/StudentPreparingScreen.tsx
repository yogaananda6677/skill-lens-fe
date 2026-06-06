"use client";

import { CardGridSkeleton, ListSkeleton, Skeleton } from "../../../components/ui/LoadingSkeleton";

export function StudentPreparingScreen() {
  return (
    <main className="min-h-screen skilllens-blue-page px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="rounded-[2rem] border border-sky-100 bg-white/90 p-6 shadow-sm shadow-sky-950/5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="w-full max-w-xl space-y-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-80 max-w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-14 w-44 rounded-full" />
          </div>
        </div>
        <CardGridSkeleton count={4} />
        <div className="rounded-[2rem] border border-sky-100 bg-white/80 p-5 shadow-sm shadow-sky-950/5">
          <ListSkeleton count={3} />
        </div>
      </div>
    </main>
  );
}
