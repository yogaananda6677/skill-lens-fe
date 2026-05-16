"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DashboardShell, type DashboardNavItem } from "../../components/layout/DashboardShell";
import {
  chooseSchool,
  extractAccounts,
  getApprovedSchools,
  getGuidanceCases,
  getGuruWorkspace,
  getGuruJurusan,
  getSiswaAccounts,
  createGuruJurusan,
  updateGuruJurusan,
  deleteGuruJurusan,
  importExcelGrades,
  requestNewSchool,
  type GeneratedAccount,
  type GuidanceCase,
  type GuruWorkspace,
  type ImportPreview,
  type MajorRecord,
  type SchoolRecord,
} from "../../features/guru/api";

const navItems = [
  { key: "overview", label: "Ringkasan", description: "Status ruang kerja", href: "#overview", icon: "overview" },
  { key: "school", label: "Sekolah", description: "Pengajuan sekolah", href: "#school", icon: "school" },
  { key: "import", label: "Import Nilai", description: "Excel akademik", href: "#import", icon: "upload" },
  { key: "accounts", label: "Akun Siswa", description: "Hasil import", href: "#accounts", icon: "users" },
  { key: "guidance", label: "Bimbingan", description: "Tindak lanjut", href: "#guidance", icon: "guidance" },
] as const satisfies readonly DashboardNavItem[];

type SectionKey = (typeof navItems)[number]["key"];

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</section>;
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{detail}</p>
    </article>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const approved = status === "approved";
  const pending = status === "pending";
  const label = approved ? "Terverifikasi" : pending ? "Menunggu verifikasi" : "Belum diajukan";
  const cls = approved ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : pending ? "bg-amber-50 text-amber-700 ring-amber-100" : "bg-slate-100 text-slate-600 ring-slate-200";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cls}`}>{label}</span>;
}

function LockedWorkspace({
  workspace,
  schools,
  selectedSchoolId,
  setSelectedSchoolId,
  onChooseSchool,
  onRequestSchool,
  message,
  error,
}: {
  workspace: GuruWorkspace | null;
  schools: SchoolRecord[];
  selectedSchoolId: string;
  setSelectedSchoolId: (value: string) => void;
  onChooseSchool: () => Promise<void>;
  onRequestSchool: (payload: { nama_sekolah: string; jenis_sekolah: "SMA" | "SMK"; npsn?: string; alamat?: string; no_hp_sekolah?: string }) => Promise<void>;
  message: string;
  error: string;
}) {
  const [namaSekolah, setNamaSekolah] = useState("");
  const [jenisSekolah, setJenisSekolah] = useState<"SMA" | "SMK">("SMK");
  const [npsn, setNpsn] = useState("");
  const [alamat, setAlamat] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Ruang kerja belum aktif</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Pilih atau ajukan sekolah terlebih dahulu</h2>
        <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
          Fitur import nilai, akun siswa, dan bimbingan akan aktif setelah sekolah guru terhubung dan terverifikasi oleh admin.
        </p>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Status sekolah</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{workspace?.lockReason ?? "Data sekolah belum tersedia."}</p>
            </div>
            <StatusBadge status={workspace?.sekolah?.status ?? null} />
          </div>
        </div>

        {(message || error) && (
          <div className={`mt-5 rounded-2xl p-4 text-sm font-medium ${error ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"}`}>
            {error || message}
          </div>
        )}
      </Panel>

      <div className="grid gap-6">
        <Panel>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Sekolah sudah terdaftar</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Hubungkan ke sekolah yang sudah disetujui</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <select value={selectedSchoolId} onChange={(event) => setSelectedSchoolId(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium outline-none focus:border-sky-700 focus:bg-white">
              <option value="">Pilih sekolah</option>
              {schools.map((school) => (
                <option key={school.id} value={school.backendId}>{school.name} - {school.city}</option>
              ))}
            </select>
            <button type="button" onClick={onChooseSchool} className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-sky-800">Gunakan sekolah</button>
          </div>
        </Panel>

        <Panel>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Sekolah belum tersedia</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Ajukan sekolah baru</h3>
          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              await onRequestSchool({ nama_sekolah: namaSekolah, jenis_sekolah: jenisSekolah, npsn, alamat, no_hp_sekolah: phone });
            }}
          >
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Nama sekolah</span>
              <input value={namaSekolah} onChange={(event) => setNamaSekolah(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium outline-none focus:border-sky-700 focus:bg-white" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Jenis sekolah</span>
              <select value={jenisSekolah} onChange={(event) => setJenisSekolah(event.target.value as "SMA" | "SMK")} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium outline-none focus:border-sky-700 focus:bg-white">
                <option value="SMA">SMA</option>
                <option value="SMK">SMK</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">NPSN</span>
              <input value={npsn} onChange={(event) => setNpsn(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium outline-none focus:border-sky-700 focus:bg-white" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Alamat</span>
              <input value={alamat} onChange={(event) => setAlamat(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium outline-none focus:border-sky-700 focus:bg-white" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Nomor telepon sekolah</span>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium outline-none focus:border-sky-700 focus:bg-white" />
            </label>
            <button type="submit" className="rounded-2xl bg-sky-800 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-950 sm:col-span-2">Ajukan ke admin</button>
          </form>
        </Panel>
      </div>
    </div>
  );
}

export default function GuruPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("overview");
  const [workspace, setWorkspace] = useState<GuruWorkspace | null>(null);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [majors, setMajors] = useState<MajorRecord[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedMajorId, setSelectedMajorId] = useState("");
  const [jurusanName, setJurusanName] = useState("");
  const [editingJurusanId, setEditingJurusanId] = useState<number | null>(null);
  const [jurusanModalOpen, setJurusanModalOpen] = useState(false);
  const [tahunAjaran, setTahunAjaran] = useState("2025/2026");
  const [fileName, setFileName] = useState("Belum ada file dipilih");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [accounts, setAccounts] = useState<GeneratedAccount[]>([]);
  const [guidance, setGuidance] = useState<GuidanceCase[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshWorkspace() {
    const [workspaceData, schoolData] = await Promise.all([getGuruWorkspace(), getApprovedSchools()]);
    setWorkspace(workspaceData);
    setSchools(schoolData);
    if (workspaceData.sekolah?.id) {
      setSelectedSchoolId(String(workspaceData.sekolah.id));
      const jurusanData = await getGuruJurusan();
      const majorData = jurusanData.map((item) => ({ id: String(item.id), backendId: item.id, name: item.nama, schoolId: workspaceData.sekolah!.id, schoolName: workspaceData.sekolah!.nama }));
      setMajors(majorData);
      setSelectedMajorId(String(majorData[0]?.backendId ?? ""));
    } else {
      setSelectedSchoolId(String(schoolData[0]?.backendId ?? ""));
    }
    if (workspaceData.canAccessWorkspace) {
      try {
        setGuidance(await getGuidanceCases());
      } catch {
        setGuidance([]);
      }

      try {
        const accountsRows = await getSiswaAccounts();
        setAccounts(accountsRows);
      } catch {
        setAccounts([]);
      }
    }
  }

  useEffect(() => {
    refreshWorkspace().catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat ruang kerja guru."));
  }, []);

  useEffect(() => {
    if (!workspace?.canAccessWorkspace) return;
    getGuruJurusan().then((rows) => {
      const mapped = rows.map((item) => ({ id: String(item.id), backendId: item.id, name: item.nama, schoolId: workspace.sekolah!.id, schoolName: workspace.sekolah!.nama }));
      setMajors(mapped);
      setSelectedMajorId(String(mapped[0]?.backendId ?? ""));
    }).catch(() => setMajors([]));
  }, [workspace?.canAccessWorkspace, workspace?.sekolah?.id]);

  const selectedMajor = useMemo(() => majors.find((item) => String(item.backendId) === String(selectedMajorId)), [majors, selectedMajorId]);
  const selectedSchool = useMemo(() => schools.find((item) => String(item.backendId) === String(selectedSchoolId)), [schools, selectedSchoolId]);
  const canUseWorkspace = Boolean(workspace?.canAccessWorkspace);

  async function handleChooseSchool() {
    setError("");
    setMessage("");
    if (!selectedSchoolId) {
      setError("Pilih sekolah terlebih dahulu.");
      return;
    }
    try {
      const result = await chooseSchool(selectedSchoolId);
      setMessage(result.message);
      await refreshWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memilih sekolah.");
    }
  }

  async function handleRequestSchool(payload: { nama_sekolah: string; jenis_sekolah: "SMA" | "SMK"; npsn?: string; alamat?: string; no_hp_sekolah?: string }) {
    setError("");
    setMessage("");
    try {
      const result = await requestNewSchool(payload);
      setMessage(result.message);
      await refreshWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengajukan sekolah.");
    }
  }

  async function handleImport(dryRun: boolean) {
    setError("");
    setMessage("");
    if (!selectedFile) {
      setError("Pilih file Excel terlebih dahulu.");
      return;
    }
    if (!workspace?.sekolah?.id || !selectedMajor) {
      setError("Sekolah dan jurusan harus dipilih sebelum import nilai.");
      return;
    }
    setLoading(true);
    try {
      const result = await importExcelGrades({
        file: selectedFile,
        dryRun,
        tahunAjaran,
        jenisSekolah: workspace.sekolah.jenis ?? undefined,
        jurusan: selectedMajor.name,
        sekolahId: workspace.sekolah.id,
        jurusanId: selectedMajor.backendId,
      });
      setPreview(result);
      setAccounts(extractAccounts(result));
      setMessage(result.message || (dryRun ? "File berhasil dibaca." : "Import berhasil disimpan."));
      if (!dryRun) await refreshWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import gagal diproses.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell
      requiredRole="guru"
      activeKey={activeSection}
      navItems={navItems}
      title="Ruang Kerja Guru"
      subtitle="Kelola sekolah, import nilai, akun siswa, dan tindak lanjut bimbingan melalui data yang terhubung ke backend."
      userName={workspace?.guru.nama ?? "Guru"}
      userLabel={workspace?.guru.jabatan ?? "Guru"}
      schoolName={workspace?.sekolah?.nama ?? "Sekolah belum dipilih"}
      onNavigate={(key) => setActiveSection(key as SectionKey)}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Status akses</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{workspace?.sekolah?.nama ?? "Sekolah belum terhubung"}</h1>
        </div>
        <StatusBadge status={workspace?.sekolah?.status ?? null} />
      </div>

      {!canUseWorkspace && (
        <LockedWorkspace
          workspace={workspace}
          schools={schools}
          selectedSchoolId={selectedSchoolId}
          setSelectedSchoolId={setSelectedSchoolId}
          onChooseSchool={handleChooseSchool}
          onRequestSchool={handleRequestSchool}
          message={message}
          error={error}
        />
      )}

      {canUseWorkspace && (
        <>
          {(message || error) && (
            <div className={`mt-5 rounded-2xl p-4 text-sm font-medium ${error ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"}`}>
              {error || message}
            </div>
          )}

          {activeSection === "overview" && (
            <div id="overview" className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Siswa" value={String(workspace?.stats.siswa ?? 0)} detail="Data siswa dari sekolah aktif." />
              <MetricCard label="Jurusan" value={String(workspace?.stats.jurusan ?? 0)} detail="Jurusan dikelola oleh guru." />
              <MetricCard label="Data valid" value={String(preview?.meta?.jumlah_siswa ?? 0)} detail="Jumlah siswa dari import terakhir." />
              <MetricCard label="Bimbingan" value={String(guidance.length)} detail="Tindak lanjut rekomendasi." />
            </div>
          )}

          {activeSection === "school" && (
            <div id="school" className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <Panel>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Sekolah aktif</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{workspace?.sekolah?.nama}</h2>
                <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{workspace?.sekolah?.alamat ?? "Alamat belum tersedia."}</p>
              </Panel>
              <Panel>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Daftar jurusan</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">Kelola jurusan sekolah</h2>
                    <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">Jurusan digunakan saat import nilai. ID jurusan tetap dikirim otomatis ke backend.</p>
                  </div>
                  <button type="button" onClick={() => { setEditingJurusanId(null); setJurusanName(""); setJurusanModalOpen(true); }} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800">Tambah Jurusan</button>
                </div>
                <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"><tr><th className="px-4 py-3">Nama jurusan</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {majors.map((item) => (
                        <tr key={item.backendId}>
                          <td className="px-4 py-3 font-semibold text-slate-700">{item.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => { setEditingJurusanId(item.backendId); setJurusanName(item.name); setJurusanModalOpen(true); }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Edit</button>
                              <button type="button" onClick={async () => { if (!confirm(`Hapus jurusan ${item.name}?`)) return; await deleteGuruJurusan(item.backendId); setMessage("Jurusan berhasil dihapus."); await refreshWorkspace(); }} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">Hapus</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!majors.length && <tr><td colSpan={2} className="px-4 py-8 text-center font-semibold text-slate-500">Belum ada jurusan. Tambahkan jurusan sebelum import nilai.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          )}

          {activeSection === "import" && (
            <div id="import" className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Panel>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Import nilai</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Unggah nilai akademik siswa</h2>
                <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">Pilih jurusan, tahun ajaran, dan file Excel. ID sekolah serta ID jurusan dikirim otomatis ke backend tanpa ditampilkan ke pengguna.</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Jurusan</span>
                    <select value={selectedMajorId} onChange={(event) => setSelectedMajorId(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium outline-none focus:border-sky-700 focus:bg-white">
                      {majors.map((major) => <option key={major.id} value={major.backendId}>{major.name}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Tahun ajaran</span>
                    <input value={tahunAjaran} onChange={(event) => setTahunAjaran(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium outline-none focus:border-sky-700 focus:bg-white" />
                  </label>
                </div>

                <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-9 text-center transition hover:border-sky-700 hover:bg-sky-50">
                  <input type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                    setFileName(file?.name ?? "Belum ada file dipilih");
                  }} />
                  <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-sky-800 shadow-sm">XLSX</div>
                  <p className="mt-4 text-base font-semibold text-slate-950">{fileName}</p>
                  <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">Gunakan template nilai semester 1 sampai 5. Data rekomendasi final tetap diproses oleh layanan SPK Python.</p>
                </label>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => handleImport(true)} disabled={loading || !selectedFile} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">Cek file</button>
                  <button type="button" onClick={() => handleImport(false)} disabled={loading || !selectedFile} className="rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:opacity-50">Simpan ke database</button>
                </div>
              </Panel>

              <Panel>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Hasil import</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{preview ? preview.message : "Belum ada file diproses"}</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Siswa" value={String(preview?.meta?.jumlah_siswa ?? preview?.data?.length ?? 0)} detail="Baris siswa terbaca." />
                  <MetricCard label="Nilai" value={String(preview?.meta?.jumlah_nilai ?? 0)} detail="Nilai akademik terbaca." />
                  <MetricCard label="Semester" value={(preview?.meta?.semester_terbaca ?? []).join(", ") || "-"} detail="Sheet semester." />
                </div>
                {!!preview?.warnings?.length && <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">{preview.warnings.join(" ")}</div>}
              </Panel>
            </div>
          )}

          {activeSection === "accounts" && (
            <Panel className="mt-6" >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Akun siswa</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Akun hasil import</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    <tr><th className="px-4 py-3">NISN</th><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Username</th><th className="px-4 py-3">Password awal</th><th className="px-4 py-3">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accounts.map((item) => <tr key={item.nisn}><td className="px-4 py-3 font-medium">{item.nisn}</td><td className="px-4 py-3 font-semibold">{item.nama}</td><td className="px-4 py-3">{item.username}</td><td className="px-4 py-3">{item.password_default}</td><td className="px-4 py-3">{item.akun_baru ? "Baru" : "Sudah ada"}</td></tr>)}
                    {!accounts.length && <tr><td colSpan={5} className="px-4 py-8 text-center font-semibold text-slate-500">Belum ada akun siswa dari import terakhir.</td></tr>}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {activeSection === "guidance" && (
            <div id="guidance" className="mt-6 grid gap-4 lg:grid-cols-2">
              {guidance.map((item) => (
                <Panel key={item.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div><h3 className="text-lg font-semibold text-slate-950">{item.studentName}</h3><p className="mt-1 text-sm font-semibold text-slate-500">{item.className}</p></div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.priority}</span>
                  </div>
                  <p className="mt-4 text-sm font-medium leading-6 text-slate-600">{item.topic}</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{item.lastNote}</p>
                </Panel>
              ))}
              {!guidance.length && <Panel><p className="text-sm font-semibold text-slate-500">Belum ada data bimbingan. Import nilai terlebih dahulu.</p></Panel>}
            </div>
          )}
        </>
      )}

      {jurusanModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-2xl font-semibold text-slate-950">{editingJurusanId ? "Edit Jurusan" : "Tambah Jurusan"}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Jurusan akan terhubung dengan sekolah aktif guru.</p>
            </div>
            <form className="space-y-4 p-6" onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              setMessage("");
              try {
                if (editingJurusanId) await updateGuruJurusan(editingJurusanId, jurusanName);
                else await createGuruJurusan(jurusanName);
                setMessage(editingJurusanId ? "Jurusan berhasil diperbarui." : "Jurusan berhasil ditambahkan.");
                setJurusanModalOpen(false);
                setJurusanName("");
                setEditingJurusanId(null);
                await refreshWorkspace();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Gagal menyimpan jurusan.");
              }
            }}>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Nama jurusan</span>
                <input value={jurusanName} onChange={(event) => setJurusanName(event.target.value)} placeholder="Contoh: Rekayasa Perangkat Lunak" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium outline-none focus:border-sky-700 focus:bg-white" />
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setJurusanModalOpen(false)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
                <button type="submit" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
