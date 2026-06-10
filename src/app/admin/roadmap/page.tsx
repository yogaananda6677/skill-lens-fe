"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { AdminConfirmModal, AdminFullScreenModal } from "@/components/ui/AdminFullScreenModal";
import { Icon } from "@/components/ui/icons";
import { CardGridSkeleton, ListSkeleton } from "@/components/ui/LoadingSkeleton";
import { adminNav as navItems } from "@/config/navigation";
import {
  createRoadmapMaster,
  deleteRoadmapMaster,
  getRoadmapMasters,
  updateRoadmapMaster,
  type RoadmapMasterPayload,
  type RoadmapMasterRow,
  type RoadmapTargetType,
} from "@/features/admin/api";
import { notifyAppAlert } from "@/lib/app-alert-events";

type RoadmapForm = {
  title: string;
  description: string;
  category: string;
  target_type: RoadmapTargetType;
  recommended_for: string;
};

type TargetFilter = "all" | RoadmapTargetType;

type ConfirmAction = {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
};

const emptyRoadmapForm: RoadmapForm = {
  title: "",
  description: "",
  category: "teknologi",
  target_type: "umum",
  recommended_for: "",
};

const roadmapCategoryOptions = [
  { value: "teknologi", label: "Teknologi" },
  { value: "akademik", label: "Akademik" },
  { value: "karier", label: "Karier" },
  { value: "praktik", label: "Praktik" },
  { value: "bisnis", label: "Bisnis" },
  { value: "kreatif", label: "Kreatif" },
] as const;

type RoadmapCategoryValue = (typeof roadmapCategoryOptions)[number]["value"];

function findRoadmapCategory(value?: string | null) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return roadmapCategoryOptions.find((option) => option.value === normalized || option.label.toLowerCase() === normalized) ?? null;
}

function normalizeRoadmapCategory(value?: string | null): RoadmapCategoryValue {
  return findRoadmapCategory(value)?.value ?? "teknologi";
}

function roadmapCategoryLabel(value?: string | null) {
  return findRoadmapCategory(value)?.label ?? "Belum diatur";
}

const targetFilters: Array<{ value: TargetFilter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "kuliah", label: "Kuliah" },
  { value: "kerja", label: "Kerja" },
  { value: "wirausaha", label: "Wirausaha" },
];

function targetLabel(type?: string | null) {
  if (type === "kuliah") return "Kuliah";
  if (type === "kerja") return "Kerja";
  if (type === "wirausaha") return "Wirausaha";
  return "Umum";
}

function targetBadgeClass(type?: string | null) {
  if (type === "kuliah") return "bg-indigo-50 text-indigo-700 ring-indigo-100";
  if (type === "kerja") return "bg-sky-50 text-sky-700 ring-sky-100";
  if (type === "wirausaha") return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function getActiveSteps(roadmap?: RoadmapMasterRow | null) {
  return (roadmap?.steps ?? [])
    .filter((step) => step.is_active !== 0 && step.is_active !== false)
    .sort((a, b) => Number(a.step_order ?? 0) - Number(b.step_order ?? 0));
}

function getActiveDetailsCount(roadmap: RoadmapMasterRow) {
  return getActiveSteps(roadmap).reduce(
    (sum, step) => sum + (step.details ?? []).filter((detail) => detail.is_active !== 0 && detail.is_active !== false).length,
    0,
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <textarea
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: RoadmapTargetType;
  onChange: (value: RoadmapTargetType) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as RoadmapTargetType)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
      >
        <option value="kuliah">Kuliah</option>
        <option value="kerja">Kerja</option>
        <option value="wirausaha">Wirausaha</option>
      </select>
    </label>
  );
}

function CategorySelectField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: RoadmapCategoryValue) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <select
        value={normalizeRoadmapCategory(value)}
        onChange={(event) => onChange(event.target.value as RoadmapCategoryValue)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
      >
        {roadmapCategoryOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActionButton({
  children,
  onClick,
  tone = "primary",
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const styles = {
    primary:
      "bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 text-white shadow-lg shadow-sky-600/20 hover:-translate-y-0.5 hover:shadow-xl",
    secondary:
      "border border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md",
    danger:
      "border border-rose-200 bg-rose-50 text-rose-700 shadow-sm hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-md",
  }[tone];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles}`}
    >
      {children}
    </button>
  );
}

function StatCard({
  title,
  value,
  desc,
  icon,
}: {
  title: string;
  value: string | number;
  desc: string;
  icon: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.6rem] border border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 p-5 shadow-sm shadow-sky-100/60 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-200/25 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4 pt-2">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            {desc}
          </p>
        </div>

        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-white text-sky-700 shadow-sm shadow-sky-100/70">
          <Icon name={icon as any} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="grid min-h-[240px] place-items-center rounded-3xl border border-dashed border-sky-200 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 p-6 text-center shadow-sm shadow-sky-100/60">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-sky-700 shadow-sm ring-1 ring-sky-100">
          <Icon name="roadmap" className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-black text-slate-950">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function AdminRoadmapPage() {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<RoadmapMasterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState<TargetFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [roadmapModal, setRoadmapModal] = useState<{ mode: "create" | "edit"; roadmap?: RoadmapMasterRow } | null>(null);
  const [roadmapForm, setRoadmapForm] = useState<RoadmapForm>(emptyRoadmapForm);

  const itemsPerPage = 8;

  const filteredRoadmaps = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return roadmaps.filter((roadmap) => {
      const matchTarget = targetFilter === "all" || roadmap.target_type === targetFilter;
      if (!matchTarget) return false;
      if (!keyword) return true;

      const text = [roadmap.title, roadmap.description, roadmapCategoryLabel(roadmap.category), roadmap.recommended_for, roadmap.target_type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return text.includes(keyword);
    });
  }, [roadmaps, search, targetFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRoadmaps.length / itemsPerPage));
  const paginatedRoadmaps = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRoadmaps.slice(start, start + itemsPerPage);
  }, [filteredRoadmaps, currentPage]);

  const totalSteps = useMemo(() => roadmaps.reduce((total, roadmap) => total + getActiveSteps(roadmap).length, 0), [roadmaps]);
  const totalDetails = useMemo(() => roadmaps.reduce((total, roadmap) => total + getActiveDetailsCount(roadmap), 0), [roadmaps]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const rows = await getRoadmapMasters();
        if (!alive) return;
        setRoadmaps(rows);
        setError("");
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Gagal memuat roadmap.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, targetFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  async function refresh() {
    try {
      const rows = await getRoadmapMasters();
      setRoadmaps(rows);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat roadmap.");
    }
  }

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  function openCreateRoadmap() {
    setRoadmapForm(emptyRoadmapForm);
    setRoadmapModal({ mode: "create" });
  }

  function openEditRoadmap(roadmap: RoadmapMasterRow) {
    setRoadmapForm({
      title: roadmap.title ?? "",
      description: roadmap.description ?? "",
      category: normalizeRoadmapCategory(roadmap.category),
      target_type: roadmap.target_type ?? "umum",
      recommended_for: roadmap.recommended_for ?? "",
    });
    setRoadmapModal({ mode: "edit", roadmap });
  }

  async function saveRoadmap() {
    if (!roadmapForm.title.trim()) {
      notifyAppAlert({ type: "error", title: "Judul roadmap wajib diisi." });
      return;
    }

    const payload: RoadmapMasterPayload = {
      title: roadmapForm.title.trim(),
      description: roadmapForm.description.trim() || null,
      category: normalizeRoadmapCategory(roadmapForm.category),
      target_type: roadmapForm.target_type,
      recommended_for: roadmapForm.recommended_for.trim() || null,
      is_active: true,
    };

    setSaving(true);
    try {
      await (roadmapModal?.mode === "edit" && roadmapModal.roadmap
        ? updateRoadmapMaster(roadmapModal.roadmap.id_roadmap, payload)
        : createRoadmapMaster(payload));

      await refresh();
      setRoadmapModal(null);
      notifyAppAlert({ type: "success", title: roadmapModal?.mode === "edit" ? "Roadmap diperbarui" : "Roadmap ditambahkan" });
    } catch (err) {
      notifyAppAlert({ type: "error", title: "Gagal menyimpan roadmap", description: err instanceof Error ? err.message : "Terjadi kesalahan." });
    } finally {
      setSaving(false);
    }
  }

  function requestDeleteRoadmap(roadmap: RoadmapMasterRow) {
    setConfirmAction({
      title: "Hapus roadmap?",
      description: (
        <>
          Roadmap <span className="font-extrabold text-slate-800">{roadmap.title}</span> akan disembunyikan dari daftar master agar tidak dipilih oleh siswa baru.
        </>
      ),
      confirmLabel: "Hapus Roadmap",
      onConfirm: async () => {
        await deleteRoadmapMaster(roadmap.id_roadmap);
        await refresh();
        notifyAppAlert({ type: "success", title: "Roadmap dihapus" });
      },
    });
  }

  async function runConfirmAction() {
    if (!confirmAction) return;
    setConfirmLoading(true);
    try {
      await confirmAction.onConfirm();
      setConfirmAction(null);
    } catch (err) {
      notifyAppAlert({ type: "error", title: "Gagal menghapus data", description: err instanceof Error ? err.message : "Terjadi kesalahan." });
    } finally {
      setConfirmLoading(false);
    }
  }

  return (
    <DashboardShell
      requiredRole={["admin", "superadmin"]}
      activeKey="roadmap"
      navItems={navItems}
      title="Kelola Roadmap"
      subtitle="Atur master roadmap pada daftar utama. Klik Kelola untuk masuk ke halaman detail tahap/step dan aktivitas."
      userName="Admin Pusat"
      userLabel="Administrator"
      schoolName="Platform SkillLens"
    >
      <div className="space-y-6">
        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm">{error}</div>}

        {loading ? (
          <CardGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard title="Total Roadmap" value={roadmaps.length} desc="Master aktif tersedia" icon="roadmap" />
            <StatCard title="Total Tahap" value={totalSteps} desc="Tahap/step aktif" icon="progress" />
            <StatCard title="Total Detail" value={totalDetails} desc="Aktivitas di dalam step" icon="clipboard" />
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
          <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-5 py-5">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />

            <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
                  <Icon name="roadmap" className="h-3.5 w-3.5" />
                  Roadmap Utama
                </p>
                <h2 className="mt-4 text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                  Daftar master roadmap
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                  Bagian ini hanya menampilkan roadmap utama. Isi tahap/step dibuka di halaman detail supaya tidak menumpuk di bawah daftar.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Icon name="search" className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari roadmap..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 sm:w-72"
                />
              </div>
                <ActionButton onClick={openCreateRoadmap}>
                  <Icon name="spark" className="h-4 w-4" />
                  Tambah Roadmap
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="border-b border-sky-100 bg-white px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {targetFilters.map((filter) => {
                const active = targetFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setTargetFilter(filter.value)}
                    className={`rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-wide ring-1 transition ${
                      active
                        ? "bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 text-white ring-sky-600 shadow-md shadow-sky-600/20"
                        : "bg-white text-slate-600 ring-slate-200 hover:bg-sky-50 hover:text-sky-700 hover:ring-sky-100"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5">
            {loading ? (
              <ListSkeleton count={4} />
            ) : filteredRoadmaps.length === 0 ? (
              <EmptyState title="Roadmap belum ditemukan" desc="Coba ubah kata kunci/filter, atau tambahkan roadmap utama baru." />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {paginatedRoadmaps.map((roadmap) => {
                  const stepCount = getActiveSteps(roadmap).length;
                  const detailCount = getActiveDetailsCount(roadmap);

                  return (
                    <article
                      key={roadmap.id_roadmap}
                      className="group relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-cyan-50/25 to-sky-50/40 p-5 shadow-sm shadow-sky-100/50 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-100/70"
                    >
                      <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-cyan-200/20 blur-3xl" />
                      <div className="relative">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ${targetBadgeClass(roadmap.target_type)}`}>
                              {targetLabel(roadmap.target_type)}
                            </span>
                            {roadmap.category && <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600 ring-1 ring-slate-200">{roadmapCategoryLabel(roadmap.category)}</span>}
                          </div>
                          <h3 className="mt-3 text-lg font-black tracking-tight text-slate-950">{roadmap.title}</h3>
                          <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
                            {roadmap.description || roadmap.recommended_for || "Belum ada deskripsi roadmap."}
                          </p>
                          {roadmap.recommended_for && <p className="mt-2 text-xs font-bold text-sky-700">Target: {roadmap.recommended_for}</p>}
                        </div>

                        <div className="grid min-w-[132px] grid-cols-2 gap-2 text-center">
                          <div className="rounded-2xl bg-sky-50 px-3 py-2 ring-1 ring-sky-100">
                            <p className="text-lg font-black text-sky-700">{stepCount}</p>
                            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Step</p>
                          </div>
                          <div className="rounded-2xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">
                            <p className="text-lg font-black text-emerald-700">{detailCount}</p>
                            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Detail</p>
                          </div>
                        </div>
                      </div>

                        <div className="mt-5 flex flex-wrap gap-2 border-t border-sky-100/70 pt-4">
                          <ActionButton onClick={() => router.push(`/admin/roadmap/detail?id=${roadmap.id_roadmap}`)}>
                            <Icon name="eye" className="h-4 w-4" />
                            Kelola
                          </ActionButton>
                          <ActionButton tone="secondary" onClick={() => openEditRoadmap(roadmap)}>
                            <Icon name="pencil" className="h-4 w-4" />
                            Edit
                          </ActionButton>
                          <ActionButton tone="danger" onClick={() => requestDeleteRoadmap(roadmap)}>
                            <Icon name="trash" className="h-4 w-4" />
                            Hapus
                          </ActionButton>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {!loading && filteredRoadmaps.length > itemsPerPage && (
            <div className="flex flex-col items-center gap-3 border-t border-sky-100 px-5 py-4 sm:flex-row sm:justify-between">
              <div className="text-xs font-medium text-slate-500 sm:text-sm">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredRoadmaps.length)} dari {filteredRoadmaps.length} roadmap
              </div>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="inline-flex w-[106px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                  Sebelumnya
                </button>
                <span className="inline-flex min-w-[76px] justify-center rounded-xl bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">
                  {currentPage} / {totalPages}
                </span>
                <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="inline-flex w-[106px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {roadmapModal && (
        <AdminFullScreenModal
          eyebrow="Master Roadmap"
          title={roadmapModal.mode === "edit" ? "Edit Roadmap" : "Tambah Roadmap"}
          desc="Isi data utama roadmap. Tahap/step dan detail dikelola pada halaman Kelola roadmap."
          onClose={() => setRoadmapModal(null)}
          maxWidthClass="max-w-3xl"
          footer={
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <ActionButton tone="secondary" onClick={() => setRoadmapModal(null)}>Batal</ActionButton>
              <ActionButton disabled={saving} onClick={saveRoadmap}>{saving ? "Menyimpan..." : "Simpan Roadmap"}</ActionButton>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Judul" value={roadmapForm.title} placeholder="Contoh: Roadmap Full Stack Developer" onChange={(value) => setRoadmapForm((current) => ({ ...current, title: value }))} />
            <CategorySelectField label="Kategori" value={roadmapForm.category} onChange={(value) => setRoadmapForm((current) => ({ ...current, category: value }))} />
            <SelectField label="Jalur Target" value={roadmapForm.target_type} onChange={(value) => setRoadmapForm((current) => ({ ...current, target_type: value }))} />
            <Field label="Direkomendasikan untuk" value={roadmapForm.recommended_for} placeholder="Contoh: Siswa minat programming" onChange={(value) => setRoadmapForm((current) => ({ ...current, recommended_for: value }))} />
            <div className="md:col-span-2">
              <TextArea label="Deskripsi" value={roadmapForm.description} placeholder="Jelaskan tujuan roadmap ini secara singkat." onChange={(value) => setRoadmapForm((current) => ({ ...current, description: value }))} />
            </div>
          </div>
        </AdminFullScreenModal>
      )}

      {confirmAction && (
        <AdminConfirmModal
          title={confirmAction.title}
          desc={confirmAction.description}
          confirmLabel={confirmAction.confirmLabel}
          loading={confirmLoading}
          onCancel={() => setConfirmAction(null)}
          onConfirm={runConfirmAction}
        />
      )}
    </DashboardShell>
  );
}
