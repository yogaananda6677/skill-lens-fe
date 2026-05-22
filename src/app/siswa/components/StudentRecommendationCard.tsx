"use client";

import type { Recommendation } from "../../../features/siswa/types";

export function StudentRecommendationCard({
  item,
  selected,
  onSelect,
}: {
  item: Recommendation;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full rounded-[1.7rem] border bg-white p-5 text-left shadow-lg transition hover:-translate-y-1 ${
        selected
          ? "border-sky-400 shadow-sky-600/15 ring-4 ring-sky-100"
          : "border-slate-100 shadow-slate-950/5 hover:border-sky-200 hover:shadow-sky-950/10"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              selected ? "bg-sky-600 text-white" : "bg-sky-50 text-sky-700"
            }`}
          >
            Peringkat {item.topsisRank}
          </span>

          <h3 className="mt-4 text-lg font-bold leading-tight text-slate-950">
            {item.title}
          </h3>

          <p className="mt-1 text-sm font-semibold capitalize text-slate-500">
            {item.category}
          </p>
        </div>

        <div
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-bold ${
            selected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-800"
          }`}
        >
          {Math.round(item.score || 0)}
        </div>
      </div>

      <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
        {item.summary}
      </p>

      {!!item.dominantFactors?.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.dominantFactors.map((factor) => (
            <span
              key={factor}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
            >
              {factor}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-400">
          {(item.roadmapId ?? item.alternativeId ?? item.id) ? "Roadmap tersedia" : "Roadmap belum tersedia"}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            selected
              ? "bg-sky-100 text-sky-700"
              : "bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-700"
          }`}
        >
          {selected ? "Dipilih" : "Pilih"}
        </span>
      </div>
    </button>
  );
}