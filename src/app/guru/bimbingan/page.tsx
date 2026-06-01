"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { DashboardShell } from "../../../components/layout/DashboardShell";
import { Icon } from "../../../components/ui/icons";
import { guruNav } from "../../../config/navigation";
import { getGuidanceCases, type GuidanceCase } from "../../../features/guru/api";
import { notifyAppAlert } from "../../../lib/app-alert-events";
import { GuruOnbordaProvider } from "../components/GuruOnbordaProvider";
import { StartGuruOnbordaButton } from "../components/StartGuruOnbordaButton";

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export default function GuruBimbinganPage() {
  const [rows, setRows] = useState<GuidanceCase[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await getGuidanceCases();
        if (active) setRows(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Gagal memuat catatan bimbingan.";
        if (active) setError(message);
        notifyAppAlert({ type: "error", title: "Gagal memuat bimbingan", description: message, autoCloseMs: false });
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = normalizeText(search);
    return rows.filter((item) =>
      !keyword ||
      normalizeText(item.studentName).includes(keyword) ||
      normalizeText(item.className).includes(keyword) ||
      normalizeText(item.jurusan).includes(keyword) ||
      normalizeText(item.lastNote).includes(keyword),
    );
  }, [rows, search]);

  return (
    <GuruOnbordaProvider>
      <DashboardShell
        requiredRole="guru"
        activeKey="bimbingan"
        navItems={guruNav}
        title="Catatan Bimbingan"
        subtitle="Lihat tindak lanjut dan masuk ke detail progress siswa untuk menambahkan catatan per tahap."
        rightSlot={<StartGuruOnbordaButton />}
      >
        {error && <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{error}</div>}

        <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">Bimbingan</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Tindak lanjut siswa</h2>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                Catatan detail diberikan dari halaman progress siswa agar tersimpan sesuai tahap roadmap.
              </p>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari siswa/catatan..."
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-50 md:min-w-[320px]"
            />
          </div>

          <div className="mt-6 grid gap-4">
            {filtered.length ? filtered.map((item) => (
              <article key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-950">{item.studentName}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{item.className || "-"} • {item.jurusan || "-"} • {item.phone || "No HP belum ada"}</p>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{item.lastNote || "Belum ada catatan bimbingan."}</p>
                  </div>
                  <Link href={`/guru/siswa/${item.studentId}/progress`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-sky-700">
                    Tambah Catatan
                    <Icon name="chevronRight" className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            )) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm font-semibold text-slate-400">
                {loading ? "Memuat catatan..." : "Belum ada data bimbingan."}
              </div>
            )}
          </div>
        </section>
      </DashboardShell>
    </GuruOnbordaProvider>
  );
}
