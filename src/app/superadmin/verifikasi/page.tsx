"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { superadminNav as navItems } from "@/config/navigation";
import { apiFetch } from "@/lib/axios";

type School = {
  id: string;
  nama: string;
  npsn: string;
  alamat: string;
  no_telp: string;
  email: string;
  status: "pending" | "verified";
  created_at: string;
};

export default function VerifikasiPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "verified">("pending");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<School[]>("/superadmin/sekolah");
      setSchools(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const pendingSchools = schools.filter((s) => s.status === "pending");
  const verifiedSchools = schools.filter((s) => s.status === "verified");
  const displayedSchools = activeTab === "pending" ? pendingSchools : verifiedSchools;

  const openDetailModal = (school: School) => {
    setSelectedSchool(school);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSchool(null);
  };

  const handleVerify = async () => {
    if (!selectedSchool) return;
    setVerifying(true);
    try {
      await apiFetch(`/superadmin/sekolah/${selectedSchool.id}/verify`, { method: "PATCH" });
      setSchools((prev) =>
        prev.map((s) =>
          s.id === selectedSchool.id ? { ...s, status: "verified" } : s
        )
      );
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Gagal verifikasi sekolah");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <DashboardShell
      requiredRole="superadmin"
      activeKey="verifikasi"
      navItems={navItems}
      title="Verifikasi Sekolah"
      subtitle="Tinjau dan verifikasi sekolah yang diajukan guru."
      userName="Admin Pusat"
      userLabel="Super Administrator"
      schoolName="Platform SkillLens"
    >
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === "pending"
                ? "border-b-2 border-blue-600 text-blue-700"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Menunggu Verifikasi ({pendingSchools.length})
          </button>
          <button
            onClick={() => setActiveTab("verified")}
            className={`px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === "verified"
                ? "border-b-2 border-blue-600 text-blue-700"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Terverifikasi ({verifiedSchools.length})
          </button>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
          <div className="overflow-x-auto rounded-xl bg-white">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800 border-b border-blue-200">
                <tr>
                  <th className="px-5 py-3">No</th>
                  <th className="px-5 py-3">Nama Sekolah</th>
                  <th className="px-5 py-3">NPSN</th>
                  <th className="px-5 py-3">Alamat</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                      Memuat data sekolah...
                    </td>
                  </tr>
                ) : displayedSchools.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                      {activeTab === "pending"
                        ? "Tidak ada sekolah yang menunggu verifikasi."
                        : "Belum ada sekolah yang terverifikasi."}
                    </td>
                  </tr>
                ) : (
                  displayedSchools.map((school, idx) => (
                    <tr key={school.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3 text-sm text-slate-600">{idx + 1}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">{school.nama}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{school.npsn}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">
                        {school.alamat.length > 40 ? school.alamat.slice(0, 40) + "..." : school.alamat}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            school.status === "verified"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {school.status === "verified" ? "Terverifikasi" : "Menunggu"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => openDetailModal(school)}
                          className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:shadow"
                        >
                          {school.status === "pending" ? "Verifikasi" : "Lihat Detail"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-60 rounded-b-xl" />
        </div>
      </div>

      {showModal && selectedSchool && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Detail Sekolah</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedSchool.status === "pending"
                    ? "Lakukan verifikasi jika data sudah sesuai."
                    : "Informasi lengkap sekolah yang sudah terverifikasi."}
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
                  <p className="mt-1 text-sm font-medium text-slate-800">{selectedSchool.nama}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">NPSN</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedSchool.npsn}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500">Alamat</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedSchool.alamat}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">No. Telepon</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedSchool.no_telp}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Email</label>
                  <p className="mt-1 text-sm text-slate-700">{selectedSchool.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Tanggal Pendaftaran</label>
                  <p className="mt-1 text-sm text-slate-700">
                    {new Date(selectedSchool.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              {selectedSchool.status === "pending" && (
                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                  <button
                    onClick={closeModal}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
                  >
                    {verifying ? "Memverifikasi..." : "Verifikasi Sekolah"}
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