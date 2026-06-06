"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav as navItems } from "@/config/navigation";
import {
  approveSchool,
  rejectSchool,
  getSchoolVerifications,
  type VerificationRow,
} from "@/features/admin/api";
import { AdminFullScreenModal } from "@/components/ui/AdminFullScreenModal";
import { Icon } from "@/components/ui/icons";
import { CardGridSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";

type VerificationId = VerificationRow["id"];

const ITEMS_PER_PAGE = 10;

function safeText(value?: string | null, fallback = "-") {
  const text = String(value ?? "").trim();
  return text.length ? text : fallback;
}

function shortText(value?: string | null, max = 48) {
  const text = safeText(value);
  if (text === "-") return text;
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function StatusBadge({ status }: { status: string }) {
  const isVerified = status === "approved";
  const isRejected = status === "rejected";

  const style = isVerified
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : isRejected
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  const dotStyle = isVerified
    ? "bg-emerald-500"
    : isRejected
      ? "bg-rose-500"
      : "bg-amber-500";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wide ${style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyle}`} />
      {isVerified ? "Terverifikasi" : isRejected ? "Ditolak" : "Menunggu"}
    </span>
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
    <div className="group relative overflow-hidden rounded-[1.6rem] border border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 p-5 shadow-sm shadow-sky-100/60 transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-200/25 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4 pt-2">
        <div className="min-w-0">
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

function DetailIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function getOptionalValue(row: VerificationRow, key: string) {
  const value = (row as unknown as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : null;
}

export default function AdminVerifikasiPage() {
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<VerificationId | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<VerificationRow | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = ITEMS_PER_PAGE;

  async function refresh() {
    try {
      setLoading(true);
      const data = await getSchoolVerifications();
      setRows(data.filter((item) => item.status !== "approved"));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil verifikasi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const pendingCount = useMemo(
    () => rows.filter((item) => item.status === "pending").length,
    [rows],
  );

  const rejectedCount = useMemo(
    () => rows.filter((item) => item.status === "rejected").length,
    [rows],
  );

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;

    const query = searchQuery.toLowerCase();

    return rows.filter((item) => {
      const school = item.school?.toLowerCase() ?? "";
      const address = item.address?.toLowerCase() ?? "";
      const city = item.city?.toLowerCase() ?? "";
      const level = item.level?.toLowerCase() ?? "";
      const status = item.status?.toLowerCase() ?? "";

      return (
        school.includes(query) ||
        address.includes(query) ||
        city.includes(query) ||
        level.includes(query) ||
        status.includes(query)
      );
    });
  }, [rows, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  async function handleApprove(id: VerificationId, schoolName: string) {
    if (processingId !== null) return;

    setProcessingId(id);
    setError("");
    setMessage("");

    try {
      await approveSchool(Number(id) as never);
      setMessage(`Sekolah "${schoolName}" berhasil diverifikasi.`);
      await refresh();
      setShowModal(false);
      setSelectedSchool(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyetujui sekolah");
    } finally {
      setProcessingId(null);
    }
  }



  async function handleReject(id: VerificationId, schoolName: string) {
    if (processingId !== null) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }

    setProcessingId(id);
    setError("");
    setMessage("");

    try {
      await rejectSchool(Number(id), reason);
      setMessage(`Pengajuan sekolah "${schoolName}" berhasil ditolak.`);
      await refresh();
      setShowModal(false);
      setSelectedSchool(null);
      setRejectReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menolak sekolah");
    } finally {
      setProcessingId(null);
    }
  }

  function openDetailModal(school: VerificationRow) {
    setSelectedSchool(school);
    setRejectReason("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedSchool(null);
  }

  const selectedPhone = selectedSchool ? getOptionalValue(selectedSchool, "phone") : null;
  const selectedEmail = selectedSchool ? getOptionalValue(selectedSchool, "email") : null;
  const selectedNpsn = selectedSchool ? getOptionalValue(selectedSchool, "npsn") : null;

  return (
    <DashboardShell
      requiredRole={["admin", "superadmin"]}
      activeKey="verifikasi"
      navItems={navItems}
      title="Verifikasi Sekolah"
      subtitle="Tinjau dan validasi pengajuan sekolah agar ruang kerja guru, import nilai, dan bimbingan dapat digunakan."
      userName="Admin Pusat"
      userLabel="Administrator"
      schoolName="Platform SkillLens"
    >
      <div className="space-y-6">
        {loading ? (
          <CardGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard title="Total Antrean" value={rows.length} desc="Pengajuan yang perlu ditinjau" icon="school" />
            <StatCard title="Menunggu" value={pendingCount} desc="Pengajuan perlu ditinjau admin" icon="clock" />
            <StatCard title="Ditolak" value={rejectedCount} desc="Pengajuan dikembalikan dengan alasan" icon="x" />
          </div>
        )}

        {!loading && pendingCount > 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 p-5 shadow-sm shadow-sky-100/60">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
            <div className="relative flex flex-col gap-3 pt-1 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-white text-sky-700 shadow-sm shadow-sky-100/70">
                  <Icon name="clipboard" className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                    {pendingCount}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950">Ada pengajuan sekolah baru</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                    {rows.filter((item) => item.status === "pending").slice(0, 3).map((item) => item.school).join(", ")}
                    {pendingCount > 3 ? ` +${pendingCount - 3} lainnya` : ""}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center justify-center rounded-2xl border border-sky-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-sky-700 shadow-sm">
                Perlu persetujuan
              </span>
            </div>
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-[1.7rem] border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
            <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-5 py-5">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                  Antrean Verifikasi
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                  Data Pengajuan Sekolah
                </h2>
                <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Tinjau detail sekolah terlebih dahulu sebelum pengajuan disetujui atau ditolak.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon name="search" className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari sekolah..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full rounded-2xl border border-sky-100 bg-white py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-700 outline-none shadow-sm transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 sm:w-64"
                  />
                </div>

                <span className="inline-flex items-center justify-center rounded-2xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-black text-sky-700 shadow-sm shadow-sky-100/70">
                  {filteredRows.length} Data
                </span>
              </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead className="border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 text-xs font-black uppercase tracking-[0.14em] text-sky-800">
                  <tr>
                    <th className="px-5 py-4">No</th>
                    <th className="px-5 py-4">Nama Sekolah</th>
                    <th className="px-5 py-4">Alamat</th>
                    <th className="px-5 py-4">Kota</th>
                    <th className="px-5 py-4">Jenjang</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-5">
                        <TableSkeleton rows={5} columns={7} />
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                          <Icon name="verify" className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-slate-700">
                          {searchQuery
                            ? "Tidak ada pengajuan yang cocok."
                            : "Tidak ada pengajuan sekolah yang perlu diverifikasi."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((item, idx) => {
                      const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;

                      return (
                        <tr key={String(item.id)} className="group transition hover:bg-cyan-50/40">
                          <td className="px-5 py-4 text-sm font-bold text-slate-500">
                            {globalIdx}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-white text-sm font-black text-sky-700 shadow-sm shadow-sky-100/70">
                                {safeText(item.school, "SL").slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-bold text-slate-900">
                                  {safeText(item.school, "Sekolah")}
                                </p>
                                <p className="text-xs font-medium text-slate-500">
                                  {safeText(item.level)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm font-medium text-slate-600">
                            <span title={safeText(item.address)}>
                              {shortText(item.address, 46)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm font-medium text-slate-600">
                            {safeText(item.city)}
                          </td>
                          <td className="px-5 py-4 text-sm font-bold text-slate-700">
                            {safeText(item.level)}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => openDetailModal(item)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white px-3 py-2 text-xs font-black text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md"
                              >
                                <DetailIcon />
                                Detail
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filteredRows.length > itemsPerPage && (
              <div className="flex flex-col items-center gap-3 border-t border-sky-100 px-5 py-4 sm:flex-row sm:justify-between">
                <div className="text-xs font-medium text-slate-500 sm:text-sm">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1}–
                  {Math.min(currentPage * itemsPerPage, filteredRows.length)} dari {filteredRows.length} pengajuan
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex w-[104px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>

                  <span className="inline-flex w-[72px] justify-center rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-sm font-black text-sky-700 shadow-sm">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex w-[104px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
        </section>
      </div>

      {showModal && selectedSchool && (
        <AdminFullScreenModal
          eyebrow="Verifikasi Sekolah"
          title="Detail Sekolah"
          desc="Lengkapi verifikasi jika data sekolah sudah sesuai."
          onClose={closeModal}
          maxWidthClass="max-w-5xl"
          zIndexClass="z-[80]"
          footer={
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Kembali
              </button>

              {selectedSchool.status !== "approved" && (
                <button
                  type="button"
                  onClick={() => handleReject(selectedSchool.id, selectedSchool.school)}
                  disabled={processingId === selectedSchool.id}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-rose-600/20 transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  <Icon name="x" className="h-4 w-4" />
                  {processingId === selectedSchool.id ? "Memproses..." : "Tolak Pengajuan"}
                </button>
              )}

              {selectedSchool.status !== "approved" && (
                <button
                  type="button"
                  onClick={() => handleApprove(selectedSchool.id, selectedSchool.school)}
                  disabled={processingId === selectedSchool.id}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  <Icon name="verify" className="h-4 w-4" />
                  {processingId === selectedSchool.id ? "Memverifikasi..." : "Verifikasi Sekolah"}
                </button>
              )}
            </div>
          }
        >
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-sky-100 bg-gradient-to-br from-white via-cyan-50/35 to-sky-50/70 p-5 shadow-sm shadow-sky-100/60">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />

              <div className="relative">
                <div className="mb-5 flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-white text-sky-700 shadow-sm shadow-sky-100/70">
                    <Icon name="school" className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700">
                      Data Sekolah
                    </p>
                    <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                      Informasi Pengajuan
                    </h3>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                      Periksa data sekolah sebelum pengajuan disetujui atau ditolak.
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white/85 shadow-sm">
                  <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">
                    <div className="space-y-5 p-5">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-700">
                          Nama Sekolah
                        </p>
                        <p className="mt-2 text-base font-black text-slate-950">
                          {selectedSchool.school}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-700">
                          Jenjang
                        </p>
                        <p className="mt-2 text-sm font-bold text-slate-800">
                          {selectedSchool.level}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-700">
                          Status
                        </p>
                        <div className="mt-2">
                          <StatusBadge status={selectedSchool.status} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5 p-5">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-700">
                          Kota
                        </p>
                        <p className="mt-2 text-sm font-bold text-slate-800">
                          {selectedSchool.city}
                        </p>
                      </div>

                      {selectedPhone && (
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-700">
                            No. Telepon
                          </p>
                          <p className="mt-2 text-sm font-bold text-slate-800">
                            {selectedPhone}
                          </p>
                        </div>
                      )}

                      {selectedNpsn && (
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-700">
                            NPSN
                          </p>
                          <p className="mt-2 text-sm font-bold text-slate-800">
                            {selectedNpsn}
                          </p>
                        </div>
                      )}

                      {selectedEmail && (
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-700">
                            Email
                          </p>
                          <p className="mt-2 text-sm font-bold text-slate-800">
                            {selectedEmail}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 p-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-700">
                      Alamat
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                      {selectedSchool.address}
                    </p>
                  </div>

                  {selectedSchool.status !== "approved" && (
                    <div className="border-t border-rose-100 bg-rose-50/55 p-5">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-rose-700">
                        Alasan Penolakan
                      </p>

                      <textarea
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                        placeholder="Tuliskan alasan jika pengajuan perlu ditolak..."
                        className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
                      />
                    </div>
                  )}

                  {selectedSchool.rejection_reason && (
                    <div className="border-t border-rose-100 bg-rose-50/80 p-5">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-rose-700">
                        Alasan Penolakan Sebelumnya
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-rose-700">
                        {selectedSchool.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </AdminFullScreenModal>
      )}

    </DashboardShell>
  );
}
