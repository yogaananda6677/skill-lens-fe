"use client";

import { Icon } from "../../../components/ui/icons";
import type { Recommendation } from "../../../features/siswa/types";
import { Panel, SectionTitle } from "./StudentShared";
import { StudentRecommendationCard } from "./StudentRecommendationCard";

function recommendationRoadmapId(item: Recommendation | null) {
  if (!item) return null;
  // Roadmap harus eksplisit. Jangan memakai alternativeId/id sebagai fallback.
  const raw = item.roadmapId;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function StudentRecommendationPanel({
  recommendations,
  selectedRecommendation,
  activeRoadmapId,
  generatedRoadmapId,
  generatingRoadmap,
  onSelectRecommendation,
  onGenerateRoadmap,
}: {
  recommendations: Recommendation[];
  selectedRecommendation: Recommendation | null;
  activeRoadmapId?: number | null;
  generatedRoadmapId?: number | null;
  generatingRoadmap: boolean;
  onSelectRecommendation: (item: Recommendation) => void;
  onGenerateRoadmap: () => void;
}) {
  const selectedRoadmapId = recommendationRoadmapId(selectedRecommendation);
  const selectedAlreadyActive = Boolean(
    selectedRoadmapId && (selectedRoadmapId === activeRoadmapId || selectedRoadmapId === generatedRoadmapId),
  );
  const activeRecommendation = recommendations.find((item) => {
    const id = recommendationRoadmapId(item);
    return Boolean(id && (id === activeRoadmapId || id === generatedRoadmapId));
  });

  return (
    <Panel id="hasil" className="mt-6 relative overflow-hidden">
      <div className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            eyebrow="Hasil Rekomendasi"
            title="Pilihan terbaik berdasarkan SPK"
            description="Klik salah satu rekomendasi, lalu buat roadmap untuk mulai mengikuti langkahnya. Kartu yang sudah dipakai akan diberi warna berbeda."
          />

          {recommendations.length ? (
            <button
              type="button"
              onClick={onGenerateRoadmap}
              disabled={generatingRoadmap || !recommendationRoadmapId(selectedRecommendation)}
              className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 skilllens-button-primary"
            >
              <Icon name={selectedAlreadyActive ? "roadmap" : "rocket"} className="mr-2 h-4 w-4" />
              {generatingRoadmap
                ? "Membuat roadmap..."
                : selectedAlreadyActive
                  ? "Buka Roadmap"
                  : "Generate Roadmap"}
            </button>
          ) : null}
        </div>

        {activeRecommendation ? (
          <div className="mt-5 rounded-2xl border border-cyan-200 bg-[#07142f] p-4 text-sm font-semibold text-cyan-50 shadow-sm skilllens-fade-slide">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Roadmap aktif saat ini: <span className="font-extrabold text-white">{activeRecommendation.title}</span>
              </span>
              <a href="/siswa/roadmap" className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-xs font-extrabold text-[#07142f]">
                Lihat roadmap
                <Icon name="chevronRight" className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ) : selectedRecommendation ? (
          <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm font-semibold text-sky-800 skilllens-fade-slide">
            Dipilih untuk dibuat roadmap: <span className="font-bold">{selectedRecommendation.title}</span>
          </div>
        ) : recommendations.length ? (
          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-800 skilllens-fade-slide">
            Pilih salah satu rekomendasi terlebih dahulu sebelum generate roadmap.
          </div>
        ) : null}

        {recommendations.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {recommendations.map((item) => {
              const roadmapId = recommendationRoadmapId(item);
              const roadmapActive = Boolean(roadmapId && (roadmapId === activeRoadmapId || roadmapId === generatedRoadmapId));

              return (
                <StudentRecommendationCard
                  key={item.id}
                  item={item}
                  selected={selectedRecommendation?.id === item.id}
                  roadmapActive={roadmapActive}
                  onSelect={() => onSelectRecommendation(item)}
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-sky-100 bg-white/[0.72] p-8 text-center text-sm font-semibold text-slate-500">
            Belum ada rekomendasi. Lengkapi profil lalu tekan tombol Proses Rekomendasi.
          </div>
        )}
      </div>
    </Panel>
  );
}
