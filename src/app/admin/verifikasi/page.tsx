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
import { Icon } from "@/components/ui/icons";

type VerificationId = VerificationRow["id"];

function StatusBadge({ status }: { status: string }) {
  const isVerified = status === "approved";
  const isRejected = status === "rejected";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${
        isVerified
          ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
          : isRejected
            ? "bg-rose-100 text-rose-700 ring-rose-200"
            : "bg-amber-100 text-amber-700 ring-amber-200"
      }`}
    >
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
    <div className="group relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/70 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.11)]">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-sky-700">
            {title}
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
            {desc}
          </p>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
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

  const itemsPerPage = 10;

  async function refresh() {
    try {
      setLoading(true);
      const data = await getSchoolVerifications();
      setRows(data);
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

  const approvedCount = useMemo(
    () => rows.filter((item) => item.status === "approved").length,
    [rows],
  );

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
      subtitle="Setujui data sekolah agar guru dapat menggunakan ruang kerja import nilai dan bimbingan."
      userName="Admin Pusat"
      userLabel="Administrator"
      schoolName="Platform SkillLens"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Pengajuan"
            value={loading ? "..." : rows.length}
            desc="Data sekolah dari endpoint admin"
            icon="school"
          />
          <StatCard
            title="Menunggu"
            value={loading ? "..." : pendingCount}
            desc="Pengajuan perlu diverifikasi"
            icon="clock"
          />
          <StatCard
            title="Terverifikasi"
            value={loading ? "..." : approvedCount}
            desc="Sekolah sudah disetujui"
            icon="verify"
          />
          <StatCard
            title="Ditolak"
            value={loading ? "..." : rejectedCount}
            desc="Pengajuan dikembalikan dengan alasan"
            icon="x"
          />
        </div>

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

        <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
            <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                  Antrean Verifikasi
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                  Data Pengajuan Sekolah
                </h2>
                <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Setiap baris diambil dari tabel sekolah lewat NestJS. Tombol detail
                  dipakai untuk meninjau data sebelum sekolah diverifikasi.
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
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 sm:w-64"
                  />
                </div>

                <span className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20">
                  {filteredRows.length} Data
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-sky-100 via-white to-blue-100 text-xs font-black uppercase tracking-[0.14em] text-sky-800">
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
                      <td colSpan={7} className="px-5 py-12 text-center text-sm font-semibold text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                          Memuat data verifikasi...
                        </div>
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
                            : "Tidak ada sekolah yang menunggu verifikasi."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((item, idx) => {
                      const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;

                      return (
                        <tr key={String(item.id)} className="group transition hover:bg-sky-50/50">
                          <td className="px-5 py-4 text-sm font-bold text-slate-500">
                            {globalIdx}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sm font-black text-sky-700 ring-1 ring-sky-200/70">
                                {item.school.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-bold text-slate-900">
                                  {item.school}
                                </p>
                                <p className="text-xs font-medium text-slate-500">
                                  {item.level}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm font-medium text-slate-600">
                            <span title={item.address}>
                              {item.address.length > 45
                                ? item.address.slice(0, 45) + "..."
                                : item.address}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm font-medium text-slate-600">
                            {item.city}
                          </td>
                          <td className="px-5 py-4 text-sm font-bold text-slate-700">
                            {item.level}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => openDetailModal(item)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-100 hover:shadow-sm"
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

                  <span className="inline-flex w-[72px] justify-center rounded-xl bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100">
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-2xl shadow-slate-950/20">
            <div className="relative overflow-hidden bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-6 py-5 text-white">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Detail Sekolah</h2>
                  <p className="mt-1 text-sm font-medium text-sky-100/90">
                    Lengkapi verifikasi jika data sekolah sudah sesuai.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="grid h-9 w-9 place-items-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Tutup modal"
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Nama Sekolah
                  </label>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {selectedSchool.school}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Jenjang
                  </label>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {selectedSchool.level}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 sm:col-span-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Alamat
                  </label>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                    {selectedSchool.address}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Kota
                  </label>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {selectedSchool.city}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Status
                  </label>
                  <p className="mt-2">
                    <StatusBadge status={selectedSchool.status} />
                  </p>
                </div>

                {selectedPhone && (
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      No. Telepon
                    </label>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {selectedPhone}
                    </p>
                  </div>
                )}

                {selectedEmail && (
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Email
                    </label>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {selectedEmail}
                    </p>
                  </div>
                )}

                {selectedNpsn && (
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      NPSN
                    </label>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {selectedNpsn}
                    </p>
                  </div>
                )}
              </div>

              {selectedSchool.status !== "approved" && (
                <label className="block rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-100">
                  <span className="block text-xs font-extrabold uppercase tracking-wide text-rose-700">Alasan penolakan</span>
                  <textarea
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    placeholder="Tuliskan alasan jika pengajuan perlu ditolak..."
                    className="mt-2 min-h-24 w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
                  />
                </label>
              )}

              {selectedSchool.rejection_reason && (
                <div className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
                  <p className="font-extrabold">Alasan penolakan sebelumnya</p>
                  <p className="mt-1">{selectedSchool.rejection_reason}</p>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Kembali
                </button>

                {selectedSchool.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => handleReject(selectedSchool.id, selectedSchool.school)}
                    disabled={processingId === selectedSchool.id}
                    className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-rose-600/20 transition hover:-translate-y-0.5 disabled:opacity-60"
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
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    <Icon name="verify" className="h-4 w-4" />
                    {processingId === selectedSchool.id
                      ? "Memverifikasi..."
                      : "Verifikasi Sekolah"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
