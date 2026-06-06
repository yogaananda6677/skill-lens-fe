import type { ReactNode } from "react";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <span className={`skilllens-skeleton block rounded-2xl ${className}`} />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={index === lines - 1 ? "h-3 w-2/3" : "h-3 w-full"}
        />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-[1.4rem] border border-sky-100/80 bg-white/85 p-5 shadow-sm shadow-sky-950/5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="w-full space-y-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-12 w-12 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-[1.35rem] border border-sky-100/80 bg-white/90 p-4 shadow-sm shadow-sky-950/5"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
            <div className="w-full space-y-3">
              <Skeleton className="h-4 w-52 max-w-full" />
              <SkeletonText lines={2} />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-[1.45rem] border border-sky-100 bg-white/90 shadow-sm shadow-sky-950/5">
      <div className="grid gap-3 border-b border-sky-50 bg-sky-50/70 p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-24" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="grid gap-3 border-b border-sky-50 p-4 last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, column) => (
            <Skeleton key={column} className={column === 0 ? "h-4 w-12" : "h-4 w-28 max-w-full"} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="rounded-[1.6rem] border border-sky-100 bg-white/90 p-5 shadow-sm shadow-sky-950/5">
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function PageSkeleton({ title = true, stats = true, children }: { title?: boolean; stats?: boolean; children?: ReactNode }) {
  return (
    <div className="skilllens-page-enter mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {title ? (
        <div className="rounded-[1.7rem] border border-sky-100 bg-white/90 p-6 shadow-sm shadow-sky-950/5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3 h-9 w-80 max-w-full" />
          <Skeleton className="mt-3 h-4 w-[34rem] max-w-full" />
        </div>
      ) : null}
      {stats ? <CardGridSkeleton /> : null}
      {children ?? <ListSkeleton count={3} />}
    </div>
  );
}
