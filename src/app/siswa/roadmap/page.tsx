"use client";

import dynamic from "next/dynamic";
import { ListSkeleton, Skeleton } from "../../../components/ui/LoadingSkeleton";

function RoadmapRouteLoading() {
  return (
    <main className="min-h-screen skilllens-blue-page px-3 py-5 sm:px-5 sm:py-8">
      <section className="mx-auto max-w-7xl space-y-5">
        <div className="overflow-hidden rounded-[1.45rem] border border-white/10 skilllens-hero-grid p-4 text-white shadow-2xl shadow-blue-950/20 sm:rounded-[2rem] sm:p-6 md:p-8">
          <Skeleton className="h-3 w-36 bg-white/20" />
          <Skeleton className="mt-3 h-9 w-full max-w-xl bg-white/20" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl bg-white/20" />
          <p className="mt-5 text-xs font-bold text-cyan-100/75">
            Memuat resource roadmap...
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-sky-100 bg-white/90 p-4 shadow-sm shadow-sky-950/5">
          <ListSkeleton count={4} />
        </div>
      </section>
    </main>
  );
}

const RoadmapClient = dynamic(() => import("./RoadmapClient"), {
  ssr: false,
  loading: () => <RoadmapRouteLoading />,
});

export default function RoadmapPage() {
  return <RoadmapClient />;
}
