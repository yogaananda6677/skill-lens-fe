"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav as navItems } from "@/config/navigation";
import { getAdminSchools, deleteSchool } from "@/features/admin/api";
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
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${
        isVerified
          ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
          : "bg-amber-100 text-amber-700 ring-amber-200"
      }`}
    >
      {isVerified ? "Terverifikasi" : "Menunggu"}
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
    <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/70 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.11)]">
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

function EditIcon() {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
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
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export default function AdminSchoolPage() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

        setSchools([
          {
            id: "1",
            name: "SMA Negeri 1 Bandung",
            npsn: "20223456",
            address: "Jl. Belitung No.8, Bandung",
            phone: "022-4234567",
            level: "SMA",
            status: "approved",
          },
          {
            id: "2",
            name: "SMK Negeri 2 Surabaya",
            npsn: "20327890",
            address: "Jl. Raya ITS, Surabaya",
            phone: "031-5678901",
            level: "SMK",
            status: "pending",
          },
          {
            id: "3",
            name: "MA Al-Ikhsan",
            npsn: "20451234",
            address: "Jl. Magelang Km.7, Magelang",
            phone: "0293-123456",
            level: "MA",
            status: "pending",
          },
        ]);
      });
  }, []);

  const verifiedCount = useMemo(
    () => schools.filter((school) => school.status === "approved").length,
    [schools]
  );

  const pendingCount = useMemo(
    () => schools.filter((school) => school.status !== "approved").length,
    [schools]
  );

  const filteredSchools = useMemo(() => {
    if (!searchQuery.trim()) return schools;

    const query = searchQuery.toLowerCase();

    return schools.filter(
      (school) =>
        school.name.toLowerCase().includes(query) ||
        school.npsn.toLowerCase().includes(query) ||
        school.level.toLowerCase().includes(query) ||
        school.address.toLowerCase().includes(query)
    );
  }, [schools, searchQuery]);

  const handleEdit = (school: SchoolRow) => {
    alert(`Edit sekolah: ${school.name}`);
  };

  const handleDelete = async (school: SchoolRow) => {
    if (!confirm(`Hapus sekolah ${school.name}?`)) return;

    try {
      await deleteSchool(Number(school.id));
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Sekolah"
            value={loading ? "..." : schools.length}
            desc="Sekolah terdaftar di sistem"
            icon="school"
          />

          <StatCard
            title="Terverifikasi"
            value={loading ? "..." : verifiedCount}
            desc="Sekolah sudah disetujui"
            icon="verify"
          />

          <StatCard
            title="Menunggu"
            value={loading ? "..." : pendingCount}
            desc="Sekolah perlu ditinjau"
            icon="clock"
          />
        </div>

        {error && !loading && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
          <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                Sekolah
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                Data Status Sekolah
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Kelola daftar sekolah, status verifikasi, dan data kontak.
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 sm:w-64"
                />
              </div>

              <span className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20">
                {filteredSchools.length} Data
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-sky-100 via-white to-blue-100 text-xs font-black uppercase tracking-[0.14em] text-sky-800">
                <tr>
                  <th className="px-5 py-4">No</th>
                  <th className="px-5 py-4">Nama Sekolah</th>
                  <th className="px-5 py-4">NPSN</th>
                  <th className="px-5 py-4">Alamat</th>
                  <th className="px-5 py-4">No HP</th>
                  <th className="px-5 py-4">Jenis</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm font-semibold text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                        Memuat data sekolah...
                      </div>
                    </td>
                  </tr>
                ) : filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700">
                        <Icon name="school" className="h-5 w-5" />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        {searchQuery ? "Tidak ada sekolah yang cocok." : "Belum ada sekolah terdaftar."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((school, idx) => (
                    <tr
                      key={school.id}
                      className="group transition duration-150 hover:bg-sky-50/50"
                    >
                      <td className="px-5 py-4 text-sm font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sm font-black text-sky-700 ring-1 ring-sky-200/70">
                            {school.name.slice(0, 2).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {school.name}
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                              {school.level}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        {school.npsn}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        <span title={school.address}>
                          {school.address.length > 45
                            ? school.address.slice(0, 45) + "..."
                            : school.address}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        {school.phone || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-700">
                        {school.level}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={school.status} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(school)}
                            className="grid h-9 w-9 place-items-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-100 hover:shadow-sm"
                            title="Edit sekolah"
                            aria-label="Edit sekolah"
                          >
                            <EditIcon />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(school)}
                            className="grid h-9 w-9 place-items-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-100 hover:shadow-sm"
                            title="Hapus sekolah"
                            aria-label="Hapus sekolah"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
