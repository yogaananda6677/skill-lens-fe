"use client";

import { Icon } from "../../../components/ui/icons";
import type { Recommendation } from "../../../features/siswa/types";
import { Panel, SectionTitle } from "./StudentShared";
import { StudentRecommendationCard } from "./StudentRecommendationCard";

export function StudentRecommendationPanel({
  recommendations,
  selectedRecommendation,
  generatingRoadmap,
  onSelectRecommendation,
  onGenerateRoadmap,
}: {
  recommendations: Recommendation[];
  selectedRecommendation: Recommendation | null;
  generatingRoadmap: boolean;
  onSelectRecommendation: (item: Recommendation) => void;
  onGenerateRoadmap: () => void;
}) {
  return (
    <Panel id="hasil" className="mt-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionTitle
          eyebrow="Hasil Rekomendasi"
          title="Pilihan terbaik berdasarkan SPK"
          description="Klik salah satu rekomendasi, lalu buat roadmap untuk mulai mengikuti langkahnya."
        />

        {recommendations.length ? (
          <button
            type="button"
            onClick={onGenerateRoadmap}
            disabled={generatingRoadmap || !selectedRecommendation?.roadmapId}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="rocket" className="mr-2 h-4 w-4" />
            {generatingRoadmap ? "Membuat roadmap..." : "Generate Roadmap"}
          </button>
        ) : null}
      </div>

      {selectedRecommendation ? (
        <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm font-semibold text-sky-800">
          Roadmap yang dipilih:{" "}
          <span className="font-bold">{selectedRecommendation.title}</span>
        </div>
      ) : recommendations.length ? (
        <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Pilih salah satu rekomendasi terlebih dahulu sebelum generate roadmap.
        </div>
      ) : null}

      {recommendations.length ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {recommendations.map((item) => (
            <StudentRecommendationCard
              key={item.id}
              item={item}
              selected={selectedRecommendation?.id === item.id}
              onSelect={() => onSelectRecommendation(item)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
          Belum ada rekomendasi. Lengkapi profil lalu tekan tombol Proses
          Rekomendasi.
        </div>
      )}
    </Panel>
  );
}