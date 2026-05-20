"use client";

import { Panel, SectionTitle } from "./StudentShared";

export function StudentAcademicPanel({
  averageScore,
  academicRows,
}: {
  averageScore: number;
  academicRows: readonly (readonly [string, number])[];
}) {
  return (
    <Panel id="akademik">
      <SectionTitle
        eyebrow="Akademik"
        title="Ringkasan nilai"
        description="Nilai akademik ini diambil dari data yang sudah diimport oleh sekolah."
      />

      <div className="mt-5 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 p-6 text-white">
        <p className="text-sm font-semibold text-sky-100">
          Rata-rata akademik
        </p>
        <p className="mt-3 text-5xl font-bold">{averageScore}</p>
        <p className="mt-2 text-xs font-medium text-sky-100">
          Digunakan sebagai salah satu dasar rekomendasi.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {academicRows.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-slate-700">{label}</span>
              <span className="text-slate-950">{Math.round(value || 0)}</span>
            </div>

            <div className="mt-3 h-2 rounded-full bg-white">
              <div
                className="h-full rounded-full bg-sky-500"
                style={{
                  width: `${Math.min(100, Math.max(0, value || 0))}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}