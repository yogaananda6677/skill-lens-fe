"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";

import { DashboardShell } from "../../components/layout/DashboardShell";
import { FeedbackModal } from "../../components/ui/FeedbackModal";
import { adminSekolahNav } from "../../config/navigation";
import { apiFetch } from "../../lib/axios";
import { uploadWithProgress, type UploadProgressState } from "../../lib/upload";

import { AdminSchoolDashboard } from "./components/AdminSchoolDashboard";
import { AdminSchoolDataGuru } from "./components/AdminSchoolDataGuru";
import { AdminSchoolDataNilai } from "./components/AdminSchoolDataNilai";
import { AdminSchoolDataSekolah } from "./components/AdminSchoolDataSekolah";
import { AdminSchoolDataSiswa } from "./components/AdminSchoolDataSiswa";
import { AdminSchoolImportSiswa } from "./components/AdminSchoolImportSiswa";
import { AdminSchoolJurusan } from "./components/AdminSchoolJurusan";
import { AdminSchoolMataPelajaran } from "./components/AdminSchoolMataPelajaran";
import { LockedFeatureCard } from "./components/AdminSchoolShared";

import { initialSchoolForm, initialTeacherForm } from "./constants";

import {
  cleanPhone,
  hasErrors,
  validateSchool,
  validateTeacher,
} from "./validators";

import type {
  AdminSchoolPageKey,
  AdminSchoolStatus,
  JurusanRow,
  ModalState,
  SchoolForm,
  SiswaRow,
  TeacherForm,
  TeacherRow,
} from "./types";

type AdminSchoolStatusWithJenis = AdminSchoolStatus & {
  jenis_sekolah?: string | null;
};

export default function AdminSekolahPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [active, setActive] = useState<AdminSchoolPageKey>("dashboard");

  const [schoolStatus, setSchoolStatus] = useState<AdminSchoolStatus | null>(
    null
  );
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [schoolForm, setSchoolForm] = useState<SchoolForm>(initialSchoolForm);
  const [teacherForm, setTeacherForm] =
    useState<TeacherForm>(initialTeacherForm);

  const [schoolTouched, setSchoolTouched] = useState(false);
  const [teacherTouched, setTeacherTouched] = useState(false);

  const [teacherRows, setTeacherRows] = useState<TeacherRow[]>([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherRoleFilter, setTeacherRoleFilter] = useState("semua");
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);

  const [jurusanRows, setJurusanRows] = useState<JurusanRow[]>([]);
  const [jurusanName, setJurusanName] = useState("");
  const [loadingJurusan, setLoadingJurusan] = useState(false);

  const [siswaRows, setSiswaRows] = useState<SiswaRow[]>([]);
  const [siswaPage, setSiswaPage] = useState(1);
  const [siswaLimit] = useState(10);
  const [siswaTotal, setSiswaTotal] = useState(0);
  const [siswaSearch, setSiswaSearch] = useState("");
  const [siswaJurusanFilter, setSiswaJurusanFilter] = useState("semua");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importJurusanId, setImportJurusanId] = useState("");
  const [importSemester, setImportSemester] = useState("");

  const [schoolMessage, setSchoolMessage] = useState("");
  const [schoolError, setSchoolError] = useState("");
  const [teacherMessage, setTeacherMessage] = useState("");
  const [teacherError, setTeacherError] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");

  const [loadingSchool, setLoadingSchool] = useState(false);
  const [loadingTeacher, setLoadingTeacher] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);

  const [uploadProgress, setUploadProgress] =
    useState<UploadProgressState | null>(null);

  const [modal, setModal] = useState<ModalState | null>(null);

  const schoolErrors = useMemo(() => validateSchool(schoolForm), [schoolForm]);

  const teacherErrors = useMemo(
    () => validateTeacher(teacherForm),
    [teacherForm]
  );

  const isSchoolApproved = schoolStatus?.school_status === "approved";

  const jenisSekolah = String(
    (schoolStatus as AdminSchoolStatusWithJenis | null)?.jenis_sekolah || "SMA"
  ).toUpperCase();

  const isSma = jenisSekolah === "SMA";

  const filteredTeachers = useMemo(() => {
    const keyword = teacherSearch.trim().toLowerCase();

    return teacherRows.filter((teacher) => {
      const matchKeyword =
        !keyword ||
        teacher.nama.toLowerCase().includes(keyword) ||
        teacher.email.toLowerCase().includes(keyword) ||
        teacher.username.toLowerCase().includes(keyword) ||
        teacher.nip.toLowerCase().includes(keyword) ||
        teacher.no_hp.toLowerCase().includes(keyword);

      const matchRole =
        teacherRoleFilter === "semua" || teacher.jabatan === teacherRoleFilter;

      return matchKeyword && matchRole;
    });
  }, [teacherRows, teacherSearch, teacherRoleFilter]);

  async function loadSchoolStatus() {
    setLoadingStatus(true);

    try {
      const result = await apiFetch<AdminSchoolStatus>("/admin-sekolah/status", {
        method: "GET",
      });

      setSchoolStatus(result);
    } catch {
      setSchoolStatus({
        has_school: false,
        school_status: "none",
        id_sekolah: null,
        nama_sekolah: null,
        message: "Status sekolah belum bisa dimuat.",
      });
    } finally {
      setLoadingStatus(false);
    }
  }

  async function loadTeachers() {
    if (!isSchoolApproved) return;

    try {
      const result = await apiFetch<{ data?: TeacherRow[] }>(
        "/admin-sekolah/guru",
        { method: "GET" }
      );

      setTeacherRows(result.data || []);
    } catch {
      setTeacherRows([]);
    }
  }

  async function loadJurusan() {
    if (!isSchoolApproved) return;

    try {
      const result = await apiFetch<{ data?: JurusanRow[] }>(
        "/admin-sekolah/jurusan",
        { method: "GET" }
      );

      const rows = (result.data || []).map((item: any) => ({
        id: item.id ?? item.id_jurusan,
        id_jurusan: item.id_jurusan ?? item.id,
        nama: item.nama ?? item.nama_jurusan,
        nama_jurusan: item.nama_jurusan ?? item.nama,
        id_sekolah: item.id_sekolah,
        usage: item.usage,
        usage_count: item.usage_count ?? item.usage?.total ?? 0,
        is_used: item.is_used ?? item.usage?.is_used ?? false,
        can_edit: item.can_edit ?? item.usage?.can_edit ?? true,
        can_delete: item.can_delete ?? item.usage?.can_delete ?? true,
      }));

      setJurusanRows(rows);
    } catch {
      setJurusanRows([]);
    }
  }

  async function loadSiswa(page = siswaPage) {
    if (!isSchoolApproved) return;

    const params = new URLSearchParams({
      page: String(page),
      limit: String(siswaLimit),
      keyword: siswaSearch.trim(),
      id_jurusan: siswaJurusanFilter === "semua" ? "" : siswaJurusanFilter,
    });

    try {
      const result = await apiFetch<{
        data?: SiswaRow[];
        total?: number;
      }>(`/admin-sekolah/siswa?${params.toString()}`, {
        method: "GET",
      });

      setSiswaRows(result.data || []);
      setSiswaTotal(result.total || 0);
    } catch {
      setSiswaRows([]);
      setSiswaTotal(0);
    }
  }

  useEffect(() => {
    loadSchoolStatus();
  }, []);

  useEffect(() => {
    if (isSchoolApproved) {
      loadTeachers();
      loadJurusan();
      setSiswaPage(1);
      loadSiswa(1);
    }
  }, [isSchoolApproved]);

  useEffect(() => {
    if (isSchoolApproved) {
      setSiswaPage(1);
      loadSiswa(1);
    }
  }, [siswaSearch, siswaJurusanFilter]);

  function isLockedFeature(key: string) {
    return (
      [
        "guru",
        "jurusan",
        "import-siswa",
        "siswa",
        "mata-pelajaran",
        "nilai",
      ].includes(key) && !isSchoolApproved
    );
  }

  function showModal(
    title: string,
    description: string,
    type: "success" | "error" = "success"
  ) {
    setModal({ title, description, type });
  }

  function updateSchool(key: keyof SchoolForm, value: string) {
    setSchoolForm((current) => ({ ...current, [key]: value }));
  }

  function updateTeacher(key: keyof TeacherForm, value: string) {
    const nextValue =
      key === "username" || key === "email" ? value.toLowerCase() : value;

    setTeacherForm((current) => ({ ...current, [key]: nextValue }));
  }

  function openCreateTeacher() {
    setTeacherForm(initialTeacherForm);
    setTeacherTouched(false);
    setTeacherError("");
    setTeacherMessage("");
    setTeacherModalOpen(true);
  }

  async function submitSchool(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSchoolTouched(true);
    setSchoolMessage("");
    setSchoolError("");

    if (hasErrors(schoolErrors)) {
      setSchoolError("Periksa kembali data sekolah yang belum sesuai.");
      return;
    }

    setLoadingSchool(true);

    try {
      const result = await apiFetch<{ message?: string }>(
        "/admin-sekolah/sekolah",
        {
          method: "POST",
          body: JSON.stringify({
            nama_sekolah: schoolForm.nama_sekolah.trim(),
            npsn: schoolForm.npsn.trim(),
            jenis_sekolah: schoolForm.jenis_sekolah,
            alamat: schoolForm.alamat.trim(),
            no_telp: cleanPhone(schoolForm.no_telp.trim()),
          }),
        }
      );

      const message =
        result.message ||
        "Data sekolah berhasil diajukan dan menunggu verifikasi.";

      setSchoolMessage(message);
      setModal({ title: "Pengajuan terkirim", description: message });
      setSchoolForm(initialSchoolForm);
      setSchoolTouched(false);

      await loadSchoolStatus();

      setActive("dashboard");
    } catch (err) {
      setSchoolError(
        err instanceof Error
          ? err.message
          : "Pengajuan sekolah gagal diproses."
      );
    } finally {
      setLoadingSchool(false);
    }
  }

  async function submitTeacher(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTeacherTouched(true);
    setTeacherMessage("");
    setTeacherError("");

    if (!isSchoolApproved) {
      setTeacherError(
        "Sekolah belum disetujui. Fitur tambah guru masih terkunci."
      );
      return;
    }

    if (hasErrors(teacherErrors)) {
      setTeacherError("Periksa kembali data guru yang belum sesuai.");
      return;
    }

    setLoadingTeacher(true);

    try {
      const payload = {
        nama: teacherForm.nama.trim(),
        email: teacherForm.email.trim().toLowerCase(),
        username: teacherForm.username.trim().toLowerCase(),
        no_hp: cleanPhone(teacherForm.no_hp.trim()),
        nip: teacherForm.nip.trim(),
        jabatan: teacherForm.jabatan,
      };

      const result = await apiFetch<{
        message?: string;
        data?: TeacherRow;
      }>("/admin-sekolah/guru", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const message =
        result.message ||
        "Akun guru berhasil dibuat. Password awal sama dengan NIP/NUPTK.";

      if (result.data) {
        setTeacherRows((current) => [result.data as TeacherRow, ...current]);
      } else {
        await loadTeachers();
      }

      setTeacherMessage(message);
      setTeacherForm(initialTeacherForm);
      setTeacherTouched(false);
      setTeacherModalOpen(false);
      setModal({ title: "Guru berhasil ditambahkan", description: message });
      setActive("guru");
    } catch (err) {
      setTeacherError(
        err instanceof Error ? err.message : "Tambah guru gagal diproses."
      );
    } finally {
      setLoadingTeacher(false);
    }
  }

  async function submitJurusan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nama = jurusanName.trim();

    if (!nama) {
      setModal({
        type: "error",
        title: "Nama jurusan kosong",
        description: "Nama jurusan wajib diisi.",
      });
      return;
    }

    setLoadingJurusan(true);

    try {
      const result = await apiFetch<{ message?: string; data?: JurusanRow }>(
        "/admin-sekolah/jurusan",
        {
          method: "POST",
          body: JSON.stringify({ nama_jurusan: nama }),
        }
      );

      if (result.data) {
        setJurusanRows((current) => [result.data as JurusanRow, ...current]);
      } else {
        await loadJurusan();
      }

      setJurusanName("");
      setModal({
        title: "Jurusan berhasil ditambahkan",
        description: result.message || "Data jurusan sudah tersimpan.",
      });
    } catch (err) {
      setModal({
        type: "error",
        title: "Gagal menyimpan jurusan",
        description:
          err instanceof Error ? err.message : "Jurusan gagal disimpan.",
      });
    } finally {
      setLoadingJurusan(false);
    }
  }

  async function submitImportSiswa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setImportMessage("");
    setImportError("");
    setUploadProgress(null);

    if (!isSchoolApproved) {
      setImportError("Sekolah belum disetujui. Import nilai masih terkunci.");
      return;
    }

    if (!selectedFile) {
      setImportError("Pilih file Excel nilai terlebih dahulu.");
      return;
    }

    const formData = new FormData();

    formData.append("file", selectedFile);
    formData.append("jenis_sekolah", isSma ? "SMA" : "SMK");

    // Mode baru: 1 file Excel multi-sheet
    formData.append("multi_semester", "true");
    if (!isSma && !importJurusanId) {
      setImportError("Pilih jurusan SMK terlebih dahulu sebelum import nilai.");
      return;
    }

    formData.append("mode", isSma ? "sma_multi_jurusan" : "smk_per_jurusan");
    formData.append("semester_start", "1");
    formData.append("semester_end", "6");

    if (!isSma) {
      formData.append("jurusanId", importJurusanId);
    }

    setLoadingImport(true);

    try {
      const result = await uploadWithProgress<{
        message?: string;
        imported?: number;
        updated?: number;
        skipped?: number;
      }>({
        path: "/admin-sekolah/siswa/import",
        formData,
        onProgress: setUploadProgress,
      });

      const message = result.message || "Import nilai siswa berhasil diproses.";

      setImportMessage(message);
      setSelectedFile(null);
      setImportJurusanId("");
      setImportSemester("");
      setUploadProgress(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      setSiswaPage(1);
      await loadSiswa(1);

      setModal({
        title: "Import nilai selesai",
        description: message,
      });

      setActive("siswa");
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Import nilai siswa gagal diproses."
      );
    } finally {
      setLoadingImport(false);
    }
  }

  function renderLocked(
    key: AdminSchoolPageKey,
    title: string,
    description: string
  ) {
    return (
      <LockedFeatureCard
        title={title}
        description={description}
        statusMessage={schoolStatus?.message}
        onGoSchool={() => setActive("sekolah")}
      />
    );
  }

  function renderContent() {
    if (loadingStatus) {
      return (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="ml-2 text-slate-600">
            Memuat status sekolah...
          </span>
        </div>
      );
    }

    if (active === "sekolah") {
      return (
        <AdminSchoolDataSekolah
          schoolStatus={schoolStatus}
          schoolForm={schoolForm}
          schoolErrors={schoolErrors}
          schoolTouched={schoolTouched}
          schoolMessage={schoolMessage}
          schoolError={schoolError}
          loadingSchool={loadingSchool}
          onUpdate={updateSchool}
          onSubmit={submitSchool}
          onBack={() => setActive("dashboard")}
        />
      );
    }

    if (active === "guru") {
      if (isLockedFeature("guru")) {
        return renderLocked(
          "guru",
          "Data guru masih terkunci",
          "Admin sekolah hanya bisa menambahkan guru setelah sekolah disetujui oleh superadmin."
        );
      }

      return (
        <AdminSchoolDataGuru
          teacherRows={teacherRows}
          filteredTeachers={filteredTeachers}
          teacherSearch={teacherSearch}
          teacherRoleFilter={teacherRoleFilter}
          teacherForm={teacherForm}
          teacherErrors={teacherErrors}
          teacherTouched={teacherTouched}
          teacherModalOpen={teacherModalOpen}
          teacherMessage={teacherMessage}
          teacherError={teacherError}
          loadingTeacher={loadingTeacher}
          setTeacherSearch={setTeacherSearch}
          setTeacherRoleFilter={setTeacherRoleFilter}
          setTeacherModalOpen={setTeacherModalOpen}
          onUpdateTeacher={updateTeacher}
          onSubmitTeacher={submitTeacher}
          onOpenCreate={openCreateTeacher}
        />
      );
    }

    if (active === "jurusan") {
      if (isLockedFeature("jurusan")) {
        return renderLocked(
          "jurusan",
          "Data jurusan masih terkunci",
          "Jurusan hanya bisa dikelola setelah sekolah disetujui oleh superadmin."
        );
      }

      return (
        <AdminSchoolJurusan
          jurusanRows={jurusanRows}
          jurusanName={jurusanName}
          loadingJurusan={loadingJurusan}
          setJurusanName={setJurusanName}
          onSubmitJurusan={submitJurusan}
          jenisSekolah={jenisSekolah}
          onReloadJurusan={loadJurusan}
          showModal={showModal}
        />
      );
    }

    if (active === "import-siswa") {
      if (isLockedFeature("import-siswa")) {
        return renderLocked(
          "import-siswa",
          "Import siswa masih terkunci",
          "Import data siswa hanya bisa dilakukan setelah sekolah disetujui oleh superadmin."
        );
      }

      return (
        <AdminSchoolImportSiswa
          fileRef={fileRef}
          jurusanRows={jurusanRows}
          selectedFile={selectedFile}
          dragActive={dragActive}
          importJurusanId={importJurusanId}
          importSemester={importSemester}
          importMessage={importMessage}
          importError={importError}
          loadingImport={loadingImport}
          uploadProgress={uploadProgress}
          jenisSekolah={jenisSekolah}
          setSelectedFile={setSelectedFile}
          setDragActive={setDragActive}
          setImportJurusanId={setImportJurusanId}
          setImportSemester={setImportSemester}
          setImportError={setImportError}
          onSubmitImport={submitImportSiswa}
          onBack={() => setActive("siswa")}
        />
      );
    }

    if (active === "siswa") {
      if (isLockedFeature("siswa")) {
        return renderLocked(
          "siswa",
          "Data siswa masih terkunci",
          "Data siswa hanya bisa dilihat setelah sekolah disetujui oleh superadmin."
        );
      }

      return (
        <AdminSchoolDataSiswa
          siswaRows={siswaRows}
          siswaTotal={siswaTotal}
          siswaPage={siswaPage}
          siswaLimit={siswaLimit}
          siswaSearch={siswaSearch}
          siswaJurusanFilter={siswaJurusanFilter}
          jurusanRows={jurusanRows}
          setSiswaSearch={setSiswaSearch}
          setSiswaJurusanFilter={setSiswaJurusanFilter}
          setSiswaPage={setSiswaPage}
          loadSiswa={loadSiswa}
        />
      );
    }

    if (active === "mata-pelajaran") {
      if (isLockedFeature("mata-pelajaran")) {
        return renderLocked(
          "mata-pelajaran",
          "Data mata pelajaran masih terkunci",
          "Mata pelajaran hanya bisa dikelola setelah sekolah disetujui oleh superadmin."
        );
      }

      return (
        <AdminSchoolMataPelajaran
          isSchoolApproved={isSchoolApproved}
          onShowModal={showModal}
          jurusanRows={jurusanRows}
        />
      );
    }

    if (active === "nilai") {
      if (isLockedFeature("nilai")) {
        return renderLocked(
          "nilai",
          "Data nilai masih terkunci",
          "Data nilai hanya bisa diakses setelah sekolah disetujui oleh superadmin."
        );
      }

      return (
        <AdminSchoolDataNilai
          siswaRows={siswaRows}
          jurusanRows={jurusanRows}
          jenisSekolah={jenisSekolah}
          loadSiswa={loadSiswa}
        />
      );
    }

    return (
      <AdminSchoolDashboard
        schoolStatus={schoolStatus}
        loadingStatus={loadingStatus}
        isSchoolApproved={isSchoolApproved}
        teacherCount={teacherRows.length}
        siswaCount={siswaTotal}
        onNavigate={setActive}
        isLockedFeature={isLockedFeature}
      />
    );
  }

  return (
    <DashboardShell
      requiredRole="admin_sekolah"
      activeKey={active}
      navItems={adminSekolahNav}
      title="Dashboard Admin Sekolah"
      subtitle="Kelola data sekolah, guru, jurusan, import siswa, dan data siswa dalam satu panel."
      onNavigate={(key) => setActive(key as AdminSchoolPageKey)}
      rightSlot={null}
    >
      {renderContent()}

      <FeedbackModal
        open={!!modal}
        type={modal?.type ?? "success"}
        title={modal?.title ?? ""}
        description={modal?.description}
        onClose={() => setModal(null)}
      />
    </DashboardShell>
  );
}