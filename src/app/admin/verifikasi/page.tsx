"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell, type DashboardNavItem } from "../../../components/layout/DashboardShell";
import { approveSchool, getSchoolVerifications, type VerificationRow } from "../../../features/admin/api";

const navItems = [
  { key: "dashboard", label: "Dashboard", description: "Monitoring sistem", href: "/admin/dashboard", icon: "dashboard" },
  { key: "verifikasi", label: "Verifikasi", description: "Sekolah dan akun", href: "/admin/verifikasi", icon: "verify" },
  { key: "sekolah", label: "Data Sekolah", description: "Daftar sekolah", href: "/admin/sekolah", icon: "school" },
  { key: "laporan", label: "Laporan", description: "Aktivitas SPK", href: "/admin/dashboard", icon: "report" },
] as const satisfies readonly DashboardNavItem[];

function StatusBadge({ status }: { status: string }) {
  const ready = status === "approved";
  const style = ready ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>{ready ? "Terverifikasi" : "Menunggu"}</span>;
}

export default function AdminVerifikasiPage() {
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    try {
      setRows(await getSchoolVerifications());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil verifikasi");
    }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <DashboardShell requiredRole={["admin", "superadmin"]} activeKey="verifikasi" navItems={navItems} title="Verifikasi Sekolah" subtitle="Setujui data sekolah agar guru dapat menggunakan ruang kerja import nilai dan bimbingan." userName="Admin Pusat" userLabel="Administrator" schoolName="Platform SkillLens">
      <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f2a5f]">Antrean verifikasi</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Data dari endpoint admin</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-500">Setiap kartu diambil dari tabel sekolah lewat NestJS. Tombol setujui mengirim PUT ke backend.</p>
          </div>
          <Link href="/admin/dashboard" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0f2a5f]">Kembali dashboard</Link>
        </div>

        {(error || message) && <div className={`mt-5 rounded-2xl p-4 text-sm font-medium ${error ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"}`}>{error || message}</div>}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {rows.map((item) => (
            <article key={item.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-900/5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f2a5f]">{item.level}</p>
              <h3 className="mt-2 text-xl font-semibold leading-tight text-slate-950">{item.school}</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"><span className="text-sm font-medium text-slate-500">Kota</span><span className="text-sm font-semibold text-slate-950">{item.city}</span></div>
                <div className="rounded-2xl bg-white px-4 py-3"><p className="text-sm font-medium text-slate-500">Alamat</p><p className="mt-1 text-sm font-semibold text-slate-950">{item.address}</p></div>
                <StatusBadge status={item.status} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={async () => { setError(""); setMessage(""); await approveSchool(item.id); setMessage("Sekolah berhasil disetujui."); refresh(); }} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f2a5f]">Setujui</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
