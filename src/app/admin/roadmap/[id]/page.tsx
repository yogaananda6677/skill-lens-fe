"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { AdminConfirmModal, AdminFullScreenModal } from "@/components/ui/AdminFullScreenModal";
import { Icon } from "@/components/ui/icons";
import { ListSkeleton } from "@/components/ui/LoadingSkeleton";
import { adminNav as navItems } from "@/config/navigation";
import {
  createRoadmapMaster,
  createRoadmapStep,
  createRoadmapStepDetail,
  deleteRoadmapMaster,
  deleteRoadmapStep,
  deleteRoadmapStepDetail,
  getRoadmapMasters,
  updateRoadmapMaster,
  updateRoadmapStep,
  updateRoadmapStepDetail,
  type RoadmapMasterPayload,
  type RoadmapMasterRow,
  type RoadmapStepDetailPayload,
  type RoadmapStepDetailRow,
  type RoadmapStepPayload,
  type RoadmapStepRow,
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

type StepForm = {
  title: string;
  description: string;
  step_order: string;
  estimated_duration: string;
  output_target: string;
};

type DetailForm = {
  title: string;
  description: string;
  detail_order: string;
  reference_type: string;
  reference_link: string;
};

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

const emptyStepForm: StepForm = {
  title: "",
  description: "",
  step_order: "1",
  estimated_duration: "",
  output_target: "",
};

const emptyDetailForm: DetailForm = {
  title: "",
  description: "",
  detail_order: "1",
  reference_type: "",
  reference_link: "",
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

function targetLabel(type?: string | null) {
  if (type === "kuliah") return "Kuliah";
  if (type === "kerja") return "Kerja";
  if (type === "wirausaha") return "Wirausaha";
  return "Umum";
}

function getActiveSteps(roadmap?: RoadmapMasterRow | null) {
  return (roadmap?.steps ?? [])
    .filter((step) => step.is_active !== 0 && step.is_active !== false)
    .sort((a, b) => Number(a.step_order ?? 0) - Number(b.step_order ?? 0));
}

function getActiveDetails(step?: RoadmapStepRow | null) {
  return (step?.details ?? [])
    .filter((detail) => detail.is_active !== 0 && detail.is_active !== false)
    .sort((a, b) => Number(a.detail_order ?? 0) - Number(b.detail_order ?? 0));
}

function numberOrDefault(value: string, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
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
        <option value="umum">Umum</option>
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
    primary: "bg-gradient-to-r from-[#0b2450] to-sky-600 text-white shadow-lg shadow-sky-600/20 hover:-translate-y-0.5 hover:shadow-xl",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
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

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="grid min-h-[180px] place-items-center rounded-3xl border border-dashed border-sky-200 bg-sky-50/50 p-6 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-sky-700 ring-1 ring-sky-100">
          <Icon name="roadmap" className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-base font-black text-slate-950">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

export default function AdminRoadmapDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const roadmapId = Number(Array.isArray(params?.id) ? params.id[0] : params?.id);

  const [roadmap, setRoadmap] = useState<RoadmapMasterRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [roadmapModal, setRoadmapModal] = useState<{ mode: "create" | "edit"; roadmap?: RoadmapMasterRow } | null>(null);
  const [roadmapForm, setRoadmapForm] = useState<RoadmapForm>(emptyRoadmapForm);

  const [stepModal, setStepModal] = useState<{ mode: "create" | "edit"; step?: RoadmapStepRow } | null>(null);
  const [stepForm, setStepForm] = useState<StepForm>(emptyStepForm);

  const [detailModal, setDetailModal] = useState<{ mode: "create" | "edit"; step: RoadmapStepRow; detail?: RoadmapStepDetailRow } | null>(null);
  const [detailForm, setDetailForm] = useState<DetailForm>(emptyDetailForm);

  const itemsPerPage = 5;
  const steps = useMemo(() => getActiveSteps(roadmap), [roadmap]);
  const totalPages = Math.max(1, Math.ceil(steps.length / itemsPerPage));
  const paginatedSteps = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return steps.slice(start, start + itemsPerPage);
  }, [steps, currentPage]);
  const totalDetails = useMemo(() => steps.reduce((sum, step) => sum + getActiveDetails(step).length, 0), [steps]);

  async function refresh() {
    try {
      const rows = await getRoadmapMasters();
      const selected = rows.find((item) => item.id_roadmap === roadmapId) ?? null;
      setRoadmap(selected);
      setError(selected ? "" : "Roadmap tidak ditemukan atau sudah tidak aktif.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat detail roadmap.");
    }
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const rows = await getRoadmapMasters();
        if (!alive) return;
        const selected = rows.find((item) => item.id_roadmap === roadmapId) ?? null;
        setRoadmap(selected);
        setError(selected ? "" : "Roadmap tidak ditemukan atau sudah tidak aktif.");
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Gagal memuat detail roadmap.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [roadmapId]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  function openEditRoadmap(selected: RoadmapMasterRow) {
    setRoadmapForm({
      title: selected.title ?? "",
      description: selected.description ?? "",
      category: normalizeRoadmapCategory(selected.category),
      target_type: selected.target_type ?? "umum",
      recommended_for: selected.recommended_for ?? "",
    });
    setRoadmapModal({ mode: "edit", roadmap: selected });
  }

  function openCreateStep() {
    if (!roadmap) return;
    setStepForm({ ...emptyStepForm, step_order: String(steps.length + 1) });
    setStepModal({ mode: "create" });
  }

  function openEditStep(step: RoadmapStepRow) {
    setStepForm({
      title: step.title ?? "",
      description: step.description ?? "",
      step_order: String(step.step_order ?? 1),
      estimated_duration: step.estimated_duration ?? "",
      output_target: step.output_target ?? "",
    });
    setStepModal({ mode: "edit", step });
  }

  function openCreateDetail(step: RoadmapStepRow) {
    setDetailForm({ ...emptyDetailForm, detail_order: String(getActiveDetails(step).length + 1) });
    setDetailModal({ mode: "create", step });
  }

  function openEditDetail(step: RoadmapStepRow, detail: RoadmapStepDetailRow) {
    setDetailForm({
      title: detail.title ?? "",
      description: detail.description ?? "",
      detail_order: String(detail.detail_order ?? 1),
      reference_type: detail.reference_type ?? "",
      reference_link: detail.reference_link ?? "",
    });
    setDetailModal({ mode: "edit", step, detail });
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
      const saved = roadmapModal?.mode === "edit" && roadmapModal.roadmap
        ? await updateRoadmapMaster(roadmapModal.roadmap.id_roadmap, payload)
        : await createRoadmapMaster(payload);

      setRoadmapModal(null);
      notifyAppAlert({ type: "success", title: roadmapModal?.mode === "edit" ? "Roadmap diperbarui" : "Roadmap ditambahkan" });
      if (roadmapModal?.mode === "create") router.push(`/admin/roadmap/${saved.id_roadmap}`);
      else await refresh();
    } catch (err) {
      notifyAppAlert({ type: "error", title: "Gagal menyimpan roadmap", description: err instanceof Error ? err.message : "Terjadi kesalahan." });
    } finally {
      setSaving(false);
    }
  }

  async function saveStep() {
    if (!roadmap || !stepForm.title.trim()) {
      notifyAppAlert({ type: "error", title: "Judul tahap/step wajib diisi." });
      return;
    }

    const payload: RoadmapStepPayload = {
      id_roadmap: roadmap.id_roadmap,
      title: stepForm.title.trim(),
      description: stepForm.description.trim() || null,
      step_order: numberOrDefault(stepForm.step_order, steps.length + 1),
      estimated_duration: stepForm.estimated_duration.trim() || null,
      output_target: stepForm.output_target.trim() || null,
      is_active: true,
    };

    setSaving(true);
    try {
      await (stepModal?.mode === "edit" && stepModal.step
        ? updateRoadmapStep(stepModal.step.id_roadmap_step, payload)
        : createRoadmapStep(payload));

      await refresh();
      setStepModal(null);
      notifyAppAlert({ type: "success", title: stepModal?.mode === "edit" ? "Tahap/step diperbarui" : "Tahap/step ditambahkan" });
    } catch (err) {
      notifyAppAlert({ type: "error", title: "Gagal menyimpan tahap/step", description: err instanceof Error ? err.message : "Terjadi kesalahan." });
    } finally {
      setSaving(false);
    }
  }

  async function saveDetail() {
    if (!detailModal || !detailForm.title.trim()) {
      notifyAppAlert({ type: "error", title: "Judul detail wajib diisi." });
      return;
    }

    const payload: RoadmapStepDetailPayload = {
      id_roadmap_step: detailModal.step.id_roadmap_step,
      title: detailForm.title.trim(),
      description: detailForm.description.trim() || null,
      detail_order: numberOrDefault(detailForm.detail_order, getActiveDetails(detailModal.step).length + 1),
      reference_type: detailForm.reference_type.trim() || null,
      reference_link: detailForm.reference_link.trim() || null,
      is_active: true,
    };

    setSaving(true);
    try {
      await (detailModal.mode === "edit" && detailModal.detail
        ? updateRoadmapStepDetail(detailModal.detail.id_roadmap_step_detail, payload)
        : createRoadmapStepDetail(payload));

      await refresh();
      setDetailModal(null);
      notifyAppAlert({ type: "success", title: detailModal.mode === "edit" ? "Detail diperbarui" : "Detail ditambahkan" });
    } catch (err) {
      notifyAppAlert({ type: "error", title: "Gagal menyimpan detail", description: err instanceof Error ? err.message : "Terjadi kesalahan." });
    } finally {
      setSaving(false);
    }
  }

  function requestDeleteRoadmap(selected: RoadmapMasterRow) {
    setConfirmAction({
      title: "Hapus roadmap?",
      description: (
        <>
          Roadmap <span className="font-extrabold text-slate-800">{selected.title}</span> akan disembunyikan dari daftar master agar tidak dipilih oleh siswa baru.
        </>
      ),
      confirmLabel: "Hapus Roadmap",
      onConfirm: async () => {
        await deleteRoadmapMaster(selected.id_roadmap);
        notifyAppAlert({ type: "success", title: "Roadmap dihapus" });
        router.push("/admin/roadmap");
      },
    });
  }

  function requestDeleteStep(step: RoadmapStepRow) {
    setConfirmAction({
      title: "Hapus tahap/step?",
      description: (
        <>
          Tahap <span className="font-extrabold text-slate-800">{step.title}</span> akan disembunyikan dari roadmap master ini.
        </>
      ),
      confirmLabel: "Hapus Tahap",
      onConfirm: async () => {
        await deleteRoadmapStep(step.id_roadmap_step);
        await refresh();
        notifyAppAlert({ type: "success", title: "Tahap/step dihapus" });
      },
    });
  }

  function requestDeleteDetail(detail: RoadmapStepDetailRow) {
    setConfirmAction({
      title: "Hapus detail aktivitas?",
      description: (
        <>
          Detail <span className="font-extrabold text-slate-800">{detail.title}</span> akan disembunyikan dari step ini.
        </>
      ),
      confirmLabel: "Hapus Detail",
      onConfirm: async () => {
        await deleteRoadmapStepDetail(detail.id_roadmap_step_detail);
        await refresh();
        notifyAppAlert({ type: "success", title: "Detail dihapus" });
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
      title="Detail Roadmap"
      subtitle="Kelola tahap/step dan detail aktivitas pada roadmap yang dipilih."
      userName="Admin Pusat"
      userLabel="Administrator"
      schoolName="Platform SkillLens"
    >
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => router.push("/admin/roadmap")}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
        >
          <Icon name="arrowLeft" className="h-4 w-4" />
          Kembali ke daftar roadmap
        </button>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm">{error}</div>}

        {loading ? (
          <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm">
            <ListSkeleton count={4} />
          </div>
        ) : !roadmap ? (
          <EmptyState title="Roadmap tidak ditemukan" desc="Data roadmap mungkin sudah dihapus atau tidak aktif. Kembali ke daftar utama untuk memilih roadmap lain." />
        ) : (
          <>
            <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
              <div className="border-b border-sky-100 bg-gradient-to-r from-[#0b2450] via-[#0f3a69] to-sky-600 px-5 py-5 text-white">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-cyan-100 ring-1 ring-white/20">{targetLabel(roadmap.target_type)}</span>
                      {roadmap.category && <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white ring-1 ring-white/15">{roadmapCategoryLabel(roadmap.category)}</span>}
                    </div>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-white">{roadmap.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-sky-100">{roadmap.description || "Belum ada deskripsi roadmap."}</p>
                    {roadmap.recommended_for && <p className="mt-2 text-xs font-bold text-cyan-100">Target rekomendasi: {roadmap.recommended_for}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <ActionButton tone="secondary" onClick={() => openEditRoadmap(roadmap)}>Edit Master</ActionButton>
                    <ActionButton tone="danger" onClick={() => requestDeleteRoadmap(roadmap)}>Hapus</ActionButton>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 border-b border-sky-100 p-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-3xl bg-sky-50 p-4 ring-1 ring-sky-100">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700">Total Step</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{steps.length}</p>
                </div>
                <div className="rounded-3xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Total Detail</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{totalDetails}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Halaman Step</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{currentPage} / {totalPages}</p>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-600">Tahap / Step</p>
                    <h3 className="mt-1 text-lg font-black text-slate-950">Isi roadmap</h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">Step memakai warna biru, sedangkan detail aktivitas memakai warna hijau agar mudah dibedakan.</p>
                  </div>
                  <ActionButton onClick={openCreateStep}>
                    <Icon name="spark" className="h-4 w-4" />
                    Tambah Tahap
                  </ActionButton>
                </div>

                {steps.length === 0 ? (
                  <EmptyState title="Belum ada tahap/step" desc="Tambahkan tahap pertama agar roadmap bisa dipakai sebagai panduan siswa." />
                ) : (
                  <div className="space-y-4">
                    {paginatedSteps.map((step) => {
                      const details = getActiveDetails(step);

                      return (
                        <article key={step.id_roadmap_step} className="overflow-hidden rounded-3xl border border-sky-100 bg-sky-50/30 shadow-sm">
                          <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 p-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-4">
                              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-600 text-sm font-black text-white shadow-md shadow-sky-600/20">{step.step_order}</div>
                              <div>
                                <h4 className="text-base font-black text-slate-950">{step.title}</h4>
                                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{step.description || "Belum ada deskripsi tahap."}</p>
                                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-wide">
                                  {step.estimated_duration && <span className="rounded-full bg-white px-3 py-1 text-sky-700 ring-1 ring-sky-100">{step.estimated_duration}</span>}
                                  {step.output_target && <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">Output: {step.output_target}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <ActionButton tone="secondary" onClick={() => openEditStep(step)}>Edit Step</ActionButton>
                              <ActionButton tone="secondary" onClick={() => openCreateDetail(step)}>Tambah Detail</ActionButton>
                              <ActionButton tone="danger" onClick={() => requestDeleteStep(step)}>Hapus</ActionButton>
                            </div>
                          </div>

                          <div className="space-y-3 p-5">
                            {details.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-4 py-5 text-center text-sm font-semibold text-slate-500">Belum ada detail aktivitas untuk step ini.</div>
                            ) : (
                              details.map((detail) => (
                                <div key={detail.id_roadmap_step_detail} className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
                                  <div className="flex gap-3">
                                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">{detail.detail_order}</div>
                                    <div>
                                      <p className="text-sm font-black text-slate-950">{detail.title}</p>
                                      <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{detail.description || "Belum ada deskripsi detail."}</p>
                                      {(detail.reference_type || detail.reference_link) && <p className="mt-2 text-[11px] font-bold text-emerald-700">{detail.reference_type || "Referensi"}{detail.reference_link ? ` · ${detail.reference_link}` : ""}</p>}
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 gap-2">
                                    <button type="button" onClick={() => openEditDetail(step, detail)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50">Edit</button>
                                    <button type="button" onClick={() => requestDeleteDetail(detail)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100">Hapus</button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              {!loading && steps.length > itemsPerPage && (
                <div className="flex flex-col items-center gap-3 border-t border-sky-100 px-5 py-4 sm:flex-row sm:justify-between">
                  <div className="text-xs font-medium text-slate-500 sm:text-sm">
                    Menampilkan step {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, steps.length)} dari {steps.length} step
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="inline-flex w-[106px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Sebelumnya</button>
                    <span className="inline-flex min-w-[76px] justify-center rounded-xl bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">{currentPage} / {totalPages}</span>
                    <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="inline-flex w-[106px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Berikutnya</button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {roadmapModal && (
        <AdminFullScreenModal
          eyebrow="Master Roadmap"
          title={roadmapModal.mode === "edit" ? "Edit Roadmap" : "Tambah Roadmap"}
          desc="Ubah data utama roadmap. Step dan detail tetap dikelola dari halaman detail ini."
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

      {stepModal && roadmap && (
        <AdminFullScreenModal
          eyebrow="Tahap / Step"
          title={stepModal.mode === "edit" ? "Edit Tahap / Step" : "Tambah Tahap / Step"}
          desc={`Roadmap: ${roadmap.title}`}
          onClose={() => setStepModal(null)}
          footer={
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <ActionButton tone="secondary" onClick={() => setStepModal(null)}>Batal</ActionButton>
              <ActionButton disabled={saving} onClick={saveStep}>{saving ? "Menyimpan..." : "Simpan Tahap"}</ActionButton>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Urutan" type="number" value={stepForm.step_order} placeholder="1" onChange={(value) => setStepForm((current) => ({ ...current, step_order: value }))} />
            <Field label="Durasi estimasi" value={stepForm.estimated_duration} placeholder="Contoh: 1 minggu" onChange={(value) => setStepForm((current) => ({ ...current, estimated_duration: value }))} />
            <div className="md:col-span-2">
              <Field label="Judul tahap/step" value={stepForm.title} placeholder="Contoh: Kuasai dasar HTML dan CSS" onChange={(value) => setStepForm((current) => ({ ...current, title: value }))} />
            </div>
            <div className="md:col-span-2">
              <Field label="Output target" value={stepForm.output_target} placeholder="Contoh: Landing page sederhana" onChange={(value) => setStepForm((current) => ({ ...current, output_target: value }))} />
            </div>
            <div className="md:col-span-2">
              <TextArea label="Deskripsi" value={stepForm.description} placeholder="Jelaskan aktivitas utama pada tahap ini." onChange={(value) => setStepForm((current) => ({ ...current, description: value }))} />
            </div>
          </div>
        </AdminFullScreenModal>
      )}

      {detailModal && (
        <AdminFullScreenModal
          eyebrow="Detail Step"
          title={detailModal.mode === "edit" ? "Edit Detail Step" : "Tambah Detail Step"}
          desc={`Tahap/step: ${detailModal.step.title}`}
          onClose={() => setDetailModal(null)}
          footer={
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <ActionButton tone="secondary" onClick={() => setDetailModal(null)}>Batal</ActionButton>
              <ActionButton disabled={saving} onClick={saveDetail}>{saving ? "Menyimpan..." : "Simpan Detail"}</ActionButton>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Urutan" type="number" value={detailForm.detail_order} placeholder="1" onChange={(value) => setDetailForm((current) => ({ ...current, detail_order: value }))} />
            <Field label="Tipe referensi" value={detailForm.reference_type} placeholder="Video / Artikel / Modul" onChange={(value) => setDetailForm((current) => ({ ...current, reference_type: value }))} />
            <div className="md:col-span-2">
              <Field label="Judul detail" value={detailForm.title} placeholder="Contoh: Tonton materi dasar HTML" onChange={(value) => setDetailForm((current) => ({ ...current, title: value }))} />
            </div>
            <div className="md:col-span-2">
              <Field label="Link referensi" value={detailForm.reference_link} placeholder="https://..." onChange={(value) => setDetailForm((current) => ({ ...current, reference_link: value }))} />
            </div>
            <div className="md:col-span-2">
              <TextArea label="Deskripsi" value={detailForm.description} placeholder="Jelaskan instruksi detail yang harus dilakukan siswa." onChange={(value) => setDetailForm((current) => ({ ...current, description: value }))} />
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
