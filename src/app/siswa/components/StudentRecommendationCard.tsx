"use client";

import { Icon } from "../../../components/ui/icons";
import type { Recommendation } from "../../../features/siswa/types";

function cardAccent(index: number) {
  const accents = [
    "from-[#07142f] to-[#0a54c7]",
    "from-[#0a54c7] to-[#38bdf8]",
    "from-[#0b2554] to-[#0ea5e9]",
    "from-[#12306b] to-[#38bdf8]",
    "from-[#07142f] to-[#0ea5e9]",
  ];

  return accents[Math.max(0, index - 1) % accents.length];
}

export function StudentRecommendationCard({
  item,
  selected,
  roadmapActive,
  onSelect,
}: {
  item: Recommendation;
  selected: boolean;
  roadmapActive?: boolean;
  onSelect: () => void;
}) {
  const accent = cardAccent(item.topsisRank || 1);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full overflow-hidden rounded-[1.55rem] border p-5 text-left transition duration-200 ${
        roadmapActive
          ? "border-cyan-300 bg-[linear-gradient(135deg,#07142f_0%,#0b2554_58%,#0a54c7_100%)] text-white shadow-xl shadow-sky-900/18 ring-2 ring-cyan-100"
          : selected
            ? "border-sky-400 bg-sky-50/90 shadow-md shadow-sky-700/10 ring-2 ring-sky-100"
            : "border-slate-100 bg-white/[0.92] shadow-sm shadow-slate-950/5 hover:border-sky-200 hover:bg-sky-50/40"
      }`}
    >
      {roadmapActive && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-cyan-300 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#07142f] shadow-sm">
          <Icon name="check" className="h-3.5 w-3.5" />
          Roadmap aktif
        </span>
      )}

      <span
        className={`absolute inset-y-4 left-0 w-1 rounded-r-full bg-gradient-to-b ${
          roadmapActive ? "from-cyan-300 to-white" : selected ? accent : "from-slate-200 to-slate-100"
        }`}
      />

      <div className="relative flex items-start justify-between gap-4 pr-2">
        <div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              roadmapActive
                ? "bg-white/12 text-cyan-100 ring-1 ring-white/15"
                : selected
                  ? `bg-gradient-to-r ${accent} text-white`
                  : "bg-sky-50 text-sky-700"
            }`}
          >
            Peringkat {item.topsisRank}
          </span>

          <h3 className={`mt-4 text-lg font-bold leading-tight ${roadmapActive ? "text-white" : "text-slate-950"}`}>
            {item.title}
          </h3>

          <p className={`mt-1 text-sm capitalize ${roadmapActive ? "text-cyan-100/78" : "text-slate-500"}`}>
            {item.category}
          </p>
        </div>

        <div
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-bold transition ${
            roadmapActive
              ? "bg-white text-[#07142f] shadow-sm"
              : selected
                ? `bg-gradient-to-br ${accent} text-white shadow-sm`
                : "bg-slate-100 text-slate-800"
          }`}
        >
          {Math.round(item.score || 0)}
        </div>
      </div>

      <p className={`relative mt-4 text-sm leading-7 ${roadmapActive ? "text-sky-50/88" : "text-slate-600"}`}>
        {item.summary}
      </p>

      {!!item.dominantFactors?.length && (
        <div className="relative mt-4 flex flex-wrap gap-2">
          {item.dominantFactors.map((factor) => (
            <span
              key={factor}
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                roadmapActive ? "bg-white/10 text-cyan-100 ring-white/15" : "bg-white text-sky-700 ring-sky-100"
              }`}
            >
              {factor}
            </span>
          ))}
        </div>
      )}

      <div className={`relative mt-5 flex items-center justify-between gap-3 border-t pt-4 ${roadmapActive ? "border-white/10" : "border-slate-100"}`}>
        <span className={`text-xs font-semibold ${roadmapActive ? "text-cyan-100/80" : "text-slate-400"}`}>
          {roadmapActive
            ? "Sedang dipakai sebagai roadmap kamu"
            : item.roadmapId
              ? "Roadmap tersedia"
              : "Roadmap belum tersedia"}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            roadmapActive
              ? "bg-cyan-300 text-[#07142f]"
              : selected
                ? "bg-[#07142f] text-white"
                : "bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-700"
          }`}
        >
          {roadmapActive ? "Buka roadmap" : selected ? "Dipilih" : "Pilih"}
        </span>
      </div>
    </button>
  );
}
