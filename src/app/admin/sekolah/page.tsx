"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav as navItems } from "@/config/navigation";
import { getAdminSchools, deleteSchool, type AdminSchoolRow } from "@/features/admin/api";
import { Icon } from "@/components/ui/icons";

type SchoolRow = {
  id: string;
  name: string;
  npsn: string;
  address: string;
  phone: string;
  level: string;
  status: string;
};

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

export default function AdminSchoolPage() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminSchools()
      .then((data) => {
        setSchools(data as unknown as SchoolRow[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err instanceof Error ? err.message : "Gagal memuat data sekolah.");
        setLoading(false);
        // Data dummy sementara (opsional, hapus saat backend siap)
        setSchools([
          { id: "1", name: "SMA Negeri 1 Bandung", npsn: "20223456", address: "Jl. Belitung No.8, Bandung", phone: "022-4234567", level: "SMA", status: "approved" },
          { id: "2", name: "SMK Negeri 2 Surabaya", npsn: "20327890", address: "Jl. Raya ITS, Surabaya", phone: "031-5678901", level: "SMK", status: "pending" },
          { id: "3", name: "MA Al-Ikhsan", npsn: "20451234", address: "Jl. Magelang Km.7, Magelang", phone: "0293-123456", level: "MA", status: "pending" },
        ]);
      });
  }, []);

  const handleEdit = (school: SchoolRow) => {
    alert(`Edit sekolah: ${school.name}`);
    // Implementasi edit (modal atau redirect)
  };

  const handleDelete = async (school: SchoolRow) => {
    if (!confirm(`Hapus sekolah ${school.name}?`)) return;
    try {
      await deleteSchool(Number(school.id));
      // Hapus dari state setelah sukses
      setSchools((prev) => prev.filter((s) => s.id !== school.id));
      alert("Sekolah berhasil dihapus");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal menghapus sekolah");
    }
  };

  return (
    <DashboardShell
      requiredRole={["admin", "superadmin"]}
      activeKey="sekolah"
      navItems={navItems}
      title="Data Sekolah"
      subtitle="Daftar sekolah yang terdaftar di sistem. Pengelolaan jurusan dilakukan oleh guru pada ruang kerja sekolahnya."
      userName="Admin Pusat"
      userLabel="Administrator"
      schoolName="Platform SkillLens"
    >
      <div className="space-y-6">
        {/* Header Card (sama seperti di verifikasi) */}
        <div className="rounded-xl bg-gradient-to-br from-white via-blue-50/50 to-blue-100/30 p-5 shadow-md border border-blue-100/60">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
                  <Icon name="school" className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Sekolah</p>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-slate-800">Data status sekolah</h2>
              <p className="mt-1 text-sm text-slate-500">Kelola daftar sekolah, verifikasi, dan data kontak</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm">
                {schools.length} Total Sekolah
              </span>
            </div>
          </div>
        </div>

        {/* Pesan error */}
        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Tabel Data Sekolah (sama gaya dengan verifikasi) */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
          <div className="overflow-x-auto rounded-xl bg-white">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800 border-b border-blue-200">
                <tr>
                  <th className="px-5 py-3">No</th>
                  <th className="px-5 py-3">Nama Sekolah</th>
                  <th className="px-5 py-3">NPSN</th>
                  <th className="px-5 py-3">Alamat</th>
                  <th className="px-5 py-3">No HP</th>
                  <th className="px-5 py-3">Jenis Sekolah</th>
                  <th className="px-5 py-3">Status Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        <span className="ml-2">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : schools.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                      <Icon name="school" className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-2">Belum ada sekolah terdaftar.</p>
                    </td>
                  </tr>
                ) : (
                  schools.map((school, idx) => (
                    <tr key={school.id} className="group hover:bg-slate-50/80 transition duration-150">
                      <td className="px-5 py-4 text-sm font-medium text-slate-500">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{school.name}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{school.npsn}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {school.address.length > 45 ? school.address.slice(0, 45) + "..." : school.address}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{school.phone || "-"}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{school.level}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={school.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(school)}
                            className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:from-blue-600 hover:to-blue-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(school)}
                            className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:from-red-600 hover:to-red-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-red-400"
                          >
                            Hapus
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
    </DashboardShell>
  );
}