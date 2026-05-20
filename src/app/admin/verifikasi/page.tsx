"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav as navItems } from "@/config/navigation";
import { approveSchool, getSchoolVerifications, type VerificationRow } from "@/features/admin/api";
import { Icon } from "@/components/ui/icons";

function StatusBadge({ status }: { status: string }) {
  const isVerified = status === "approved";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isVerified
          ? "bg-green-100 text-green-700 ring-1 ring-green-200"
          : "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
      }`}
    >
      {isVerified ? "Terverifikasi" : "Menunggu"}
    </span>
  );
}

export default function AdminVerifikasiPage() {
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<VerificationRow | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const handleApprove = async (id: number, schoolName: string) => {
    if (processingId !== null) return;
    setProcessingId(id);
    setError("");
    setMessage("");
    try {
      await approveSchool(id);
      setMessage(`Sekolah "${schoolName}" berhasil diverifikasi.`);
      await refresh();
      setShowModal(false); // tutup modal setelah berhasil
      setSelectedSchool(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyetujui sekolah");
    } finally {
      setProcessingId(null);
    }
  };

  const openDetailModal = (school: VerificationRow) => {
    setSelectedSchool(school);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSchool(null);
  };

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
        {/* Header Card */}
        <div className="rounded-xl bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 p-5 shadow-md border border-blue-100/60">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
                  <Icon name="verify" className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Antrean Verifikasi</p>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-slate-800">Data dari endpoint admin</h2>
              <p className="mt-1 text-sm text-slate-500">
                Setiap baris diambil dari tabel sekolah lewat NestJS. Tombol setujui mengirim PUT ke backend.
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:shadow-lg"
            >
              <Icon name="chevronRight" className="h-4 w-4" />
              Kembali dashboard
            </Link>
          </div>
        </div>

        {/* Pesan sukses/error */}
        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Tabel Verifikasi Sekolah */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
          <div className="overflow-x-auto rounded-xl bg-white">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800 border-b border-blue-200">
                <tr>
                  <th className="px-5 py-3">No</th>
                  <th className="px-5 py-3">Nama Sekolah</th>
                  <th className="px-5 py-3">Alamat</th>
                  <th className="px-5 py-3">Kota</th>
                  <th className="px-5 py-3">Jenjang</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        <span className="ml-2">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                      <Icon name="verify" className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-2">Tidak ada sekolah yang menunggu verifikasi.</p>
                    </td>
                  </tr>
                ) : (
                  rows.map((item, idx) => (
                    <tr key={item.id} className="group hover:bg-slate-50/80 transition duration-150">
                      <td className="px-5 py-4 text-sm font-medium text-slate-500">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{item.school}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.address.length > 45 ? item.address.slice(0, 45) + "..." : item.address}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{item.city}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{item.level}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => openDetailModal(item)}
                            className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:from-blue-600 hover:to-blue-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            Show Data
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70 rounded-b-xl" />
        </div>
      </div>

      {/* Modal Detail Sekolah */}
      {showModal && selectedSchool && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Detail Sekolah</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Lengkapi verifikasi jika data sudah sesuai.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500">Nama Sekolah</label>
                  <p className="mt-1 text-sm font-medium text-slate-800">{selectedSchool.school}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Jenjang</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedSchool.level}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500">Alamat</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedSchool.address}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Kota</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedSchool.city}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Status</label>
                  <p className="mt-1">
                    <StatusBadge status={selectedSchool.status} />
                  </p>
                </div>
                {/* Tambahkan field lain jika ada (NPSN, No HP, Email) */}
                {/* Contoh jika ada property phone, email, npsn */}
                {(selectedSchool as any).phone && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500">No. Telepon</label>
                    <p className="mt-1 text-sm text-slate-700">{(selectedSchool as any).phone}</p>
                  </div>
                )}
                {(selectedSchool as any).email && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Email</label>
                    <p className="mt-1 text-sm text-slate-700">{(selectedSchool as any).email}</p>
                  </div>
                )}
                {(selectedSchool as any).npsn && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500">NPSN</label>
                    <p className="mt-1 text-sm text-slate-700">{(selectedSchool as any).npsn}</p>
                  </div>
                )}
              </div>

              {selectedSchool.status !== "approved" && (
                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                  <button
                    onClick={closeModal}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => handleApprove(selectedSchool.id, selectedSchool.school)}
                    disabled={processingId === selectedSchool.id}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
                  >
                    {processingId === selectedSchool.id ? "Memverifikasi..." : "Verifikasi Sekolah"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}