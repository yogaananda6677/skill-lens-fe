"use client";

import { useEffect, useMemo, useState } from "react";
import { getSiswaNilai } from "../../../features/siswa/api";
import type { StudentAcademicDetailResponse, StudentSemesterCategorySummary } from "../../../features/siswa/types";
import { Panel, SectionTitle } from "./StudentShared";

function displayScore(value?: number | null) {
  return value && Number.isFinite(value) && value > 0
    ? Number(value).toFixed(value % 1 === 0 ? 0 : 1)
    : "-";
}

function scorePercent(value?: number | null) {
  return Math.min(100, Math.max(0, Number(value || 0)));
}

function average(values: number[]) {
  const validValues = values.filter(
    (value) => Number.isFinite(value) && value > 0,
  );

  if (!validValues.length) return null;

  return Number(
    (
      validValues.reduce((total, value) => total + value, 0) /
      validValues.length
    ).toFixed(2),
  );
}

export function StudentAcademicPanel({
  averageScore,
  academicRows,
}: {
  averageScore: number;
  academicRows: readonly (readonly [string, number])[];
}) {
  const [detail, setDetail] = useState<StudentAcademicDetailResponse | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | "all">("all");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAcademicDetail() {
      setLoadingDetail(true);
      setDetailError("");

      try {
        const result = await getSiswaNilai();
        if (!active) return;

        const semesterOptions = Array.isArray(result?.semester_options)
          ? result.semester_options
          : [];

        setDetail(result);
        setSelectedSemester(
          semesterOptions.length ? semesterOptions[semesterOptions.length - 1] : "all",
        );
      } catch (err) {
        if (!active) return;
        setDetailError(
          err instanceof Error
            ? err.message
            : "Detail nilai akademik belum bisa dimuat.",
        );
      } finally {
        if (active) setLoadingDetail(false);
      }
    }

    loadAcademicDetail();

    return () => {
      active = false;
    };
  }, []);

  const semesterOptions = detail?.semester_options ?? [];
  const subjects = detail?.data ?? [];
  const filteredSubjects = useMemo(() => {
    if (selectedSemester === "all") return subjects;
    return subjects.filter((item) => item.semester === selectedSemester);
  }, [selectedSemester, subjects]);

  const activeSemesterSummary =
    selectedSemester === "all"
      ? null
      : detail?.per_semester?.find((item) => item.semester === selectedSemester) ?? null;

  const activeAverage =
    selectedSemester === "all"
      ? detail?.summary?.rata_rata ?? averageScore
      : activeSemesterSummary?.rata_rata ??
        average(filteredSubjects.map((item) => Number(item.nilai || 0))) ??
        0;

  const hasAverage = Boolean(activeAverage && Number.isFinite(activeAverage) && activeAverage > 0);

  const semesterCategoryValues = Object.values(
    (activeSemesterSummary?.kategori ?? {}) as Record<string, StudentSemesterCategorySummary>,
  );

  const categoryRows = selectedSemester === "all"
    ? academicRows
    : semesterCategoryValues
        .filter((item) => item.jumlah_mapel > 0)
        .map((item) => [item.label, item.rata_rata ?? 0] as const);

  return (
    <Panel id="akademik" className="overflow-hidden">
      <div className="relative">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 top-20 h-36 w-36 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              eyebrow="Akademik"
              title="Nilai akademik siswa"
              description="Selain ringkasan kategori, sekarang siswa bisa melihat nilai per mata pelajaran dan memfilter berdasarkan semester. Data ini tetap read-only karena berasal dari import nilai admin sekolah."
            />

            <div className="rounded-2xl border border-sky-100 bg-white/80 p-3 shadow-sm shadow-sky-950/5">
              <label className="block text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Filter Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedSemester(value === "all" ? "all" : Number(value));
                }}
                className="mt-2 w-full rounded-xl border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-bold text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              >
                <option value="all">Semua semester</option>
                {semesterOptions.map((semester) => (
                  <option key={semester} value={semester}>
                    Semester {semester}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)] p-6 text-white shadow-xl shadow-sky-700/20 skilllens-gradient-move">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80">
                  {selectedSemester === "all"
                    ? "Rata-rata akademik keseluruhan"
                    : `Rata-rata semester ${selectedSemester}`}
                </p>
                <p className="mt-3 text-5xl font-bold">
                  {hasAverage ? displayScore(activeAverage) : "-"}
                </p>
                <p className="mt-2 max-w-xl text-xs font-semibold leading-5 text-white/75">
                  Dipakai sebagai salah satu dasar rekomendasi, tetapi profil potensi,
                  pengalaman, dan prestasi tetap ikut menentukan hasil SPK.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-right">
                <div className="rounded-2xl bg-white/[0.13] p-4 ring-1 ring-white/15">
                  <p className="text-xs font-semibold text-white/60">Mapel</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {filteredSubjects.length || detail?.summary?.jumlah_mapel || "-"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/[0.13] p-4 ring-1 ring-white/15">
                  <p className="text-xs font-semibold text-white/60">Semester</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {selectedSemester === "all" ? semesterOptions.length || "-" : selectedSemester}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {detailError ? (
            <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
              {detailError}
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {categoryRows.map(([label, value]) => {
              const hasValue = Boolean(value && Number.isFinite(value) && value > 0);

              return (
                <div
                  key={label}
                  className={`rounded-2xl border p-4 skilllens-smooth hover:-translate-y-1 hover:shadow-md ${
                    hasValue
                      ? "border-sky-100 bg-white shadow-sm"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className={hasValue ? "text-slate-700" : "text-slate-400"}>{label}</span>
                    <span className={hasValue ? "text-slate-950" : "text-slate-400"}>{displayScore(value)}</span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    {hasValue ? (
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#08224f] via-[#0a54c7] to-[#39d9ff] transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                        style={{ width: `${scorePercent(value)}%` }}
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-[repeating-linear-gradient(90deg,#e2e8f0_0,#e2e8f0_8px,#f8fafc_8px,#f8fafc_16px)]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-[1.7rem] border border-sky-100 bg-white/80 p-4 shadow-sm shadow-sky-950/5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-extrabold text-slate-950">
                  Nilai per mata pelajaran
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {loadingDetail
                    ? "Memuat detail nilai..."
                    : selectedSemester === "all"
                      ? "Menampilkan semua nilai yang sudah diimport."
                      : `Menampilkan nilai semester ${selectedSemester}.`}
                </p>
              </div>

              <span className="w-fit rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
                {filteredSubjects.length} mapel
              </span>
            </div>

            {filteredSubjects.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-[0.14em] text-slate-400">
                      <th className="px-3 py-3 font-extrabold">Mapel</th>
                      <th className="px-3 py-3 font-extrabold">Semester</th>
                      <th className="px-3 py-3 font-extrabold">Kategori</th>
                      <th className="px-3 py-3 text-right font-extrabold">Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubjects.map((item) => (
                      <tr key={`${item.id_nilai}-${item.nama_mapel}`} className="border-b border-slate-50 last:border-0">
                        <td className="px-3 py-3 font-bold text-slate-800">{item.nama_mapel}</td>
                        <td className="px-3 py-3 font-semibold text-slate-500">Semester {item.semester || "-"}</td>
                        <td className="px-3 py-3">
                          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
                            {item.kategori_label || item.kategori}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right text-base font-extrabold text-slate-950">
                          {displayScore(Number(item.nilai))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                {loadingDetail
                  ? "Detail nilai sedang dimuat..."
                  : "Belum ada nilai per mata pelajaran untuk filter ini."}
              </div>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
