"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Icon } from "../../../components/ui/icons";
import { apiFetch } from "../../../lib/axios";
import {
  type AvailabilityResponse,
  type AvailabilityStatus,
  availabilityMessage,
  getAvailabilityValue,
} from "../../../lib/form-rules";
import { jabatanOptions } from "../constants";
import { AdminSchoolModalPortal } from "./AdminSchoolModalPortal";
import type { FieldErrors, TeacherForm, TeacherRow } from "../types";
import { Field, StatusMessage, getInitials } from "./AdminSchoolShared";

const TEACHER_ITEMS_PER_PAGE = 10;

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
    <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-cyan-50/50 to-sky-50/70 p-5 shadow-sm shadow-sky-100/60 transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />

      <div className="flex items-start justify-between gap-4 pt-1">
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

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-sky-700 shadow-sm shadow-sky-100/70 ring-1 ring-sky-100">
          <Icon name={icon as any} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
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
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function ActionIconButton({
  label,
  tone,
  children,
  onClick,
  disabled,
}: {
  label: string;
  tone: "edit" | "delete";
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  const toneClass =
    tone === "edit"
      ? "border-sky-100 bg-white text-sky-700 hover:border-sky-200 hover:bg-sky-50 hover:shadow-md"
      : "border-rose-100 bg-white text-rose-600 hover:border-rose-200 hover:bg-rose-50 hover:shadow-md";

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-2xl border shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
    >
      {children}
    </button>
  );
}

function TeacherStatusBadge({ status }: { status?: string | null }) {
  const value = status || "Aktif";
  const inactive = value.toLowerCase() !== "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        inactive
          ? "bg-slate-100 text-slate-600 ring-slate-200"
          : "bg-emerald-100 text-emerald-700 ring-emerald-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          inactive ? "bg-slate-400" : "bg-emerald-500"
        }`}
      />
      {value}
    </span>
  );
}

function getTeacherId(teacher: TeacherRow) {
  const record = teacher as unknown as Record<string, unknown>;
  return String(
    record.id_guru ?? record.id_teacher ?? record.id_user ?? record.id ?? "",
  );
}

async function updateTeacherRequest(id: string, payload: TeacherForm) {
  const endpointCandidates = [
    { endpoint: `/admin-sekolah/guru/${id}`, method: "PATCH" },
    { endpoint: `/admin-sekolah/guru/${id}`, method: "PUT" },
    { endpoint: `/admin-sekolah/teachers/${id}`, method: "PATCH" },
    { endpoint: `/admin-sekolah/teachers/${id}`, method: "PUT" },
  ];

  let lastError: unknown = null;

  for (const candidate of endpointCandidates) {
    try {
      return await apiFetch(candidate.endpoint, {
        method: candidate.method,
        body: JSON.stringify(payload),
        alert: false,
        successMessage: false,
        errorMessage: false,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Endpoint update guru belum tersedia.");
}

async function deleteTeacherRequest(id: string) {
  const endpointCandidates = [
    `/admin-sekolah/guru/${id}`,
    `/admin-sekolah/teachers/${id}`,
  ];

  let lastError: unknown = null;

  for (const endpoint of endpointCandidates) {
    try {
      return await apiFetch(endpoint, {
        method: "DELETE",
        alert: false,
        successMessage: false,
        errorMessage: false,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Endpoint hapus guru belum tersedia.");
}

export function AdminSchoolDataGuru({
  teacherRows,
  filteredTeachers,
  teacherSearch,
  teacherRoleFilter,
  teacherForm,
  teacherErrors,
  teacherTouched,
  teacherModalOpen,
  teacherMessage,
  teacherError,
  loadingTeacher,
  setTeacherSearch,
  setTeacherRoleFilter,
  setTeacherModalOpen,
  onUpdateTeacher,
  onSubmitTeacher,
  onOpenCreate,
  onRefreshTeachers,
}: {
  teacherRows: TeacherRow[];
  filteredTeachers: TeacherRow[];
  teacherSearch: string;
  teacherRoleFilter: string;
  teacherForm: TeacherForm;
  teacherErrors: FieldErrors<TeacherForm>;
  teacherTouched: boolean;
  teacherModalOpen: boolean;
  teacherMessage: string;
  teacherError: string;
  loadingTeacher: boolean;
  setTeacherSearch: (value: string) => void;
  setTeacherRoleFilter: (value: string) => void;
  setTeacherModalOpen: (value: boolean) => void;
  onUpdateTeacher: (key: keyof TeacherForm, value: string) => void;
  onSubmitTeacher: (event: FormEvent<HTMLFormElement>) => void;
  onOpenCreate: () => void;
  onRefreshTeachers?: () => void | Promise<void>;
}) {
  const activeTeacherCount = teacherRows.filter(
    (teacher) => !teacher.status || teacher.status.toLowerCase() === "aktif",
  ).length;

  const [emailStatus, setEmailStatus] = useState<AvailabilityStatus>("idle");
  const [usernameStatus, setUsernameStatus] =
    useState<AvailabilityStatus>("idle");
  const [editingTeacher, setEditingTeacher] = useState<TeacherRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeacherRow | null>(null);
  const [savingTeacherAction, setSavingTeacherAction] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const isEditMode = Boolean(editingTeacher);
  const emailLocalError = teacherErrors.email;
  const usernameLocalError = teacherErrors.username;

  useEffect(() => {
    if (!teacherModalOpen) {
      setEditingTeacher(null);
      setEmailStatus("idle");
      setUsernameStatus("idle");
    }
  }, [teacherModalOpen]);

  useEffect(() => {
    const email = teacherForm.email.trim().toLowerCase();

    if (!teacherModalOpen || isEditMode || !email || emailLocalError) {
      setEmailStatus("idle");
      return;
    }

    let alive = true;
    const timeout = window.setTimeout(async () => {
      setEmailStatus("checking");
      try {
        const result = await apiFetch<AvailabilityResponse>(
          `/auth/check-availability?email=${encodeURIComponent(email)}`,
          {
            method: "GET",
            alert: false,
          },
        );
        if (!alive) return;
        setEmailStatus(
          getAvailabilityValue(result, "email") ? "available" : "unavailable",
        );
      } catch {
        if (alive) setEmailStatus("error");
      }
    }, 450);

    return () => {
      alive = false;
      window.clearTimeout(timeout);
    };
  }, [emailLocalError, isEditMode, teacherForm.email, teacherModalOpen]);

  useEffect(() => {
    const username = teacherForm.username.trim().toLowerCase();

    if (!teacherModalOpen || isEditMode || !username || usernameLocalError) {
      setUsernameStatus("idle");
      return;
    }

    let alive = true;
    const timeout = window.setTimeout(async () => {
      setUsernameStatus("checking");
      try {
        const result = await apiFetch<AvailabilityResponse>(
          `/auth/check-availability?username=${encodeURIComponent(username)}`,
          {
            method: "GET",
            alert: false,
          },
        );
        if (!alive) return;
        setUsernameStatus(
          getAvailabilityValue(result, "username")
            ? "available"
            : "unavailable",
        );
      } catch {
        if (alive) setUsernameStatus("error");
      }
    }, 450);

    return () => {
      alive = false;
      window.clearTimeout(timeout);
    };
  }, [isEditMode, teacherForm.username, teacherModalOpen, usernameLocalError]);

  const emailHint = useMemo(
    () => availabilityMessage(emailStatus, "email"),
    [emailStatus],
  );
  const usernameHint = useMemo(
    () => availabilityMessage(usernameStatus, "username"),
    [usernameStatus],
  );
  const isCheckingIdentity =
    !isEditMode &&
    (emailStatus === "checking" || usernameStatus === "checking");
  const isIdentityUnavailable =
    !isEditMode &&
    (emailStatus === "unavailable" || usernameStatus === "unavailable");

  const totalTeacherPages = Math.max(
    1,
    Math.ceil(filteredTeachers.length / TEACHER_ITEMS_PER_PAGE),
  );

  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * TEACHER_ITEMS_PER_PAGE;
    return filteredTeachers.slice(start, start + TEACHER_ITEMS_PER_PAGE);
  }, [currentPage, filteredTeachers]);

  const visibleStartNumber =
    filteredTeachers.length === 0
      ? 0
      : (currentPage - 1) * TEACHER_ITEMS_PER_PAGE + 1;

  const visibleEndNumber = Math.min(
    currentPage * TEACHER_ITEMS_PER_PAGE,
    filteredTeachers.length,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [teacherSearch, teacherRoleFilter, filteredTeachers.length]);

  useEffect(() => {
    if (currentPage > totalTeacherPages) {
      setCurrentPage(totalTeacherPages);
    }
  }, [currentPage, totalTeacherPages]);

  function goToTeacherPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalTeacherPages)));
  }

  async function refreshAfterAction() {
    if (onRefreshTeachers) {
      await onRefreshTeachers();
      return;
    }

    window.setTimeout(() => {
      window.location.reload();
    }, 450);
  }

  function openCreateTeacher() {
    setEditingTeacher(null);
    setActionMessage("");
    setActionError("");
    onOpenCreate();
  }

  function openEditTeacher(teacher: TeacherRow) {
    setEditingTeacher(teacher);
    setActionMessage("");
    setActionError("");

    onUpdateTeacher("nama", teacher.nama || "");
    onUpdateTeacher("email", teacher.email || "");
    onUpdateTeacher("username", teacher.username || "");
    onUpdateTeacher("nip", teacher.nip || "");
    onUpdateTeacher("no_hp", teacher.no_hp || "");
    onUpdateTeacher("jabatan", teacher.jabatan || jabatanOptions[0] || "");

    setTeacherModalOpen(true);
  }

  function closeTeacherModal() {
    if (loadingTeacher || savingTeacherAction) return;
    setEditingTeacher(null);
    setTeacherModalOpen(false);
  }

  async function handleUpdateTeacher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingTeacher || savingTeacherAction) return;

    const teacherId = getTeacherId(editingTeacher);
    if (!teacherId) {
      setActionError("ID guru tidak ditemukan, data tidak bisa diperbarui.");
      return;
    }

    setSavingTeacherAction(true);
    setActionMessage("");
    setActionError("");

    try {
      await updateTeacherRequest(teacherId, {
        ...teacherForm,
        nama: teacherForm.nama.trim(),
        email: teacherForm.email.trim(),
        username: teacherForm.username.trim(),
        nip: teacherForm.nip.trim(),
        no_hp: teacherForm.no_hp.trim(),
        jabatan: teacherForm.jabatan,
      });

      setActionMessage("Data guru berhasil diperbarui.");
      setEditingTeacher(null);
      setTeacherModalOpen(false);
      await refreshAfterAction();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Gagal memperbarui data guru.",
      );
    } finally {
      setSavingTeacherAction(false);
    }
  }

  async function handleDeleteTeacher() {
    if (!deleteTarget || deleteLoading) return;

    const teacherId = getTeacherId(deleteTarget);
    if (!teacherId) {
      setActionError("ID guru tidak ditemukan, data tidak bisa dihapus.");
      setDeleteTarget(null);
      return;
    }

    setDeleteLoading(true);
    setActionMessage("");
    setActionError("");

    try {
      await deleteTeacherRequest(teacherId);
      setActionMessage("Data guru berhasil dihapus.");
      setDeleteTarget(null);
      await refreshAfterAction();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Gagal menghapus data guru.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleSubmitTeacher(event: FormEvent<HTMLFormElement>) {
    if (isEditMode) {
      void handleUpdateTeacher(event);
      return;
    }

    if (isCheckingIdentity || isIdentityUnavailable) {
      event.preventDefault();
      return;
    }

    onSubmitTeacher(event);
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
      <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-7 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
              <Icon name="users" className="h-3.5 w-3.5" />
              Data Guru
            </p>

            <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Kelola Data Guru
            </h3>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Tambahkan akun guru, ubah data guru, dan hapus data yang tidak
              digunakan. Password awal otomatis sama dengan NIP/NUPTK.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateTeacher}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Icon name="users" className="h-4 w-4" />
            Tambah Guru
          </button>
        </div>
      </div>

      <div className="space-y-6 p-5 md:p-6">
        <StatusMessage
          message={teacherMessage || actionMessage}
          error={teacherError || actionError}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Guru"
            value={teacherRows.length}
            desc="Akun guru terdaftar"
            icon="users"
          />
          <StatCard
            title="Ditampilkan"
            value={filteredTeachers.length}
            desc="Data sesuai pencarian/filter"
            icon="profile"
          />
          <StatCard
            title="Status Aktif"
            value={activeTeacherCount}
            desc="Guru dengan status aktif"
            icon="verify"
          />
        </div>

        <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
          <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                Daftar Guru
              </p>
              <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                Data Guru Sekolah
              </h3>
              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Gunakan pencarian dan filter jabatan untuk menemukan data guru
                lebih cepat.
              </p>
            </div>

            <div className="grid w-full gap-3 lg:w-auto lg:grid-cols-[minmax(260px,1fr)_180px]">
              <div className="relative">
                <Icon
                  name="profile"
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={teacherSearch}
                  onChange={(event) => setTeacherSearch(event.target.value)}
                  placeholder="Cari nama, email, username, atau NIP..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <select
                value={teacherRoleFilter}
                onChange={(event) => setTeacherRoleFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              >
                <option value="semua">Semua jabatan</option>
                {jabatanOptions.map((jabatan) => (
                  <option key={jabatan} value={jabatan}>
                    {jabatan}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="bg-gradient-to-r from-sky-100 via-white to-blue-100 text-xs font-black uppercase tracking-[0.14em] text-sky-800">
                <tr>
                  <th className="px-5 py-4">Guru</th>
                  <th className="px-5 py-4">NIP/NUPTK</th>
                  <th className="px-5 py-4">Kontak</th>
                  <th className="px-5 py-4">Username</th>
                  <th className="px-5 py-4">Jabatan</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.length > 0 ? (
                  paginatedTeachers.map((teacher) => (
                    <tr
                      key={getTeacherId(teacher) || teacher.id}
                      className="transition hover:bg-sky-50/50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sm font-black text-sky-700 ring-1 ring-sky-200/70">
                            {getInitials(teacher.nama)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {teacher.nama}
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                              Guru terdaftar
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-600">
                        {teacher.nip}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {teacher.email}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {teacher.no_hp || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-600">
                        {teacher.username}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-200">
                          {teacher.jabatan}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <TeacherStatusBadge status={teacher.status} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <ActionIconButton
                            label={`Edit guru ${teacher.nama}`}
                            tone="edit"
                            onClick={() => openEditTeacher(teacher)}
                            disabled={savingTeacherAction || deleteLoading}
                          >
                            <PencilIcon />
                          </ActionIconButton>

                          <ActionIconButton
                            label={`Hapus guru ${teacher.nama}`}
                            tone="delete"
                            onClick={() => setDeleteTarget(teacher)}
                            disabled={savingTeacherAction || deleteLoading}
                          >
                            <TrashIcon />
                          </ActionIconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                        <Icon name="users" className="h-5 w-5" />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        {teacherRows.length
                          ? "Data guru tidak ditemukan"
                          : "Belum ada data guru"}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {teacherRows.length
                          ? "Ubah kata kunci atau filter jabatan."
                          : "Klik tombol Tambah Guru untuk membuat akun guru baru."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!loadingTeacher &&
            filteredTeachers.length > TEACHER_ITEMS_PER_PAGE && (
              <div className="flex flex-col items-center gap-3 border-t border-sky-100 bg-gradient-to-r from-white via-cyan-50/35 to-sky-50/60 px-5 py-4 sm:flex-row sm:justify-between">
                <p className="text-xs font-semibold text-slate-500 sm:text-sm">
                  Menampilkan {visibleStartNumber} - {visibleEndNumber} dari{" "}
                  {filteredTeachers.length} guru
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToTeacherPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="inline-flex min-w-[108px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Sebelumnya
                  </button>

                  <span className="inline-flex min-w-[78px] justify-center rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2.5 text-sm font-black text-sky-700 shadow-sm shadow-sky-100/70">
                    {currentPage} / {totalTeacherPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => goToTeacherPage(currentPage + 1)}
                    disabled={currentPage >= totalTeacherPages}
                    className="inline-flex min-w-[108px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
        </section>
      </div>

      {teacherModalOpen && (
        <AdminSchoolModalPortal>
          <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/50 px-4 py-5 backdrop-blur-[3px] sm:py-6">
            <button
              type="button"
              className="absolute inset-0 cursor-default"
              onClick={closeTeacherModal}
              aria-label="Tutup modal guru"
              disabled={loadingTeacher || savingTeacherAction}
            />

            <form
              onSubmit={handleSubmitTeacher}
              className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.85rem] border border-sky-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]"
            >
              <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-5 text-slate-900">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-200/25 blur-3xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-white text-sky-700 shadow-sm shadow-sky-100/70">
                      <Icon name="users" className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700">
                        Data Guru
                      </p>

                      <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                        {isEditMode ? "Edit Akun Guru" : "Tambah Akun Guru"}
                      </h3>

                      <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                        {isEditMode
                          ? "Perbarui informasi akun guru yang sudah terdaftar."
                          : "Lengkapi data guru. Password awal otomatis sama dengan NIP/NUPTK."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loadingTeacher || savingTeacherAction}
                    onClick={closeTeacherModal}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                    aria-label="Tutup modal"
                  >
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-br from-white via-slate-50/40 to-sky-50/35 px-6 py-5">
                <StatusMessage
                  message={teacherMessage || actionMessage}
                  error={teacherError || actionError}
                />

                {!isEditMode && (
                  <div className="mb-5 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                        <Icon name="shield" className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-black text-slate-900">
                          Informasi akun guru
                        </p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                          Username dapat dibuat otomatis dari nama dan
                          NIP/NUPTK. Guru bisa mengganti password setelah login.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-[1.4rem] border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100/50">
                  <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                      <Icon name="profile" className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-950">
                        Form Data Guru
                      </p>
                      <p className="text-xs font-semibold text-slate-500">
                        Pastikan email, username, dan NIP/NUPTK benar.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Nama guru"
                      value={teacherForm.nama}
                      placeholder="Contoh: Budi Santoso"
                      error={
                        teacherTouched || teacherForm.nama
                          ? teacherErrors.nama
                          : undefined
                      }
                      onChange={(value) => onUpdateTeacher("nama", value)}
                    />

                    <Field
                      label="Email"
                      value={teacherForm.email}
                      placeholder="guru@email.com"
                      type="email"
                      autoComplete="email"
                      maxLength={120}
                      error={
                        teacherTouched || teacherForm.email
                          ? teacherErrors.email || emailHint.error
                          : undefined
                      }
                      success={
                        !isEditMode && !teacherErrors.email
                          ? emailHint.success
                          : undefined
                      }
                      loading={
                        !isEditMode && !teacherErrors.email
                          ? emailHint.loading
                          : undefined
                      }
                      helper="Email digunakan guru untuk login dan pemulihan akun."
                      onChange={(value) => onUpdateTeacher("email", value)}
                    />

                    <Field
                      label="Username"
                      value={teacherForm.username}
                      placeholder="otomatis dari nama dan NIP"
                      maxLength={24}
                      autoComplete="username"
                      error={
                        teacherTouched || teacherForm.username
                          ? teacherErrors.username || usernameHint.error
                          : undefined
                      }
                      success={
                        !isEditMode && !teacherErrors.username
                          ? usernameHint.success
                          : undefined
                      }
                      loading={
                        !isEditMode && !teacherErrors.username
                          ? usernameHint.loading
                          : undefined
                      }
                      helper="Bisa diedit jika username otomatis kurang sesuai."
                      onChange={(value) => onUpdateTeacher("username", value)}
                    />

                    <Field
                      label="NIP/NUPTK"
                      value={teacherForm.nip}
                      placeholder="1234567890"
                      inputMode="numeric"
                      maxLength={40}
                      error={
                        teacherTouched || teacherForm.nip
                          ? teacherErrors.nip
                          : undefined
                      }
                      helper="Hanya angka. Password awal otomatis sama dengan NIP/NUPTK."
                      onChange={(value) => onUpdateTeacher("nip", value)}
                    />

                    <Field
                      label="No HP"
                      value={teacherForm.no_hp}
                      placeholder="081234567890"
                      type="tel"
                      inputMode="tel"
                      maxLength={16}
                      error={
                        teacherTouched || teacherForm.no_hp
                          ? teacherErrors.no_hp
                          : undefined
                      }
                      helper="Boleh diawali 08, 62, atau +62."
                      onChange={(value) => onUpdateTeacher("no_hp", value)}
                    />

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-bold text-slate-700">
                        Jabatan
                      </span>

                      <select
                        value={teacherForm.jabatan}
                        onChange={(event) =>
                          onUpdateTeacher("jabatan", event.target.value)
                        }
                        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:ring-4 ${
                          teacherTouched && teacherErrors.jabatan
                            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                            : "border-slate-200 focus:border-sky-300 focus:ring-sky-100"
                        }`}
                      >
                        {jabatanOptions.map((jabatan) => (
                          <option key={jabatan} value={jabatan}>
                            {jabatan}
                          </option>
                        ))}
                      </select>

                      {teacherTouched && teacherErrors.jabatan && (
                        <p className="mt-1.5 text-xs font-semibold text-rose-600">
                          {teacherErrors.jabatan}
                        </p>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 shadow-[0_-12px_30px_rgba(15,23,42,0.05)]">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={loadingTeacher || savingTeacherAction}
                    onClick={closeTeacherModal}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={
                      loadingTeacher ||
                      savingTeacherAction ||
                      isCheckingIdentity ||
                      isIdentityUnavailable
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <Icon
                      name={isEditMode ? "edit" : "users"}
                      className="h-4 w-4"
                    />
                    {loadingTeacher || savingTeacherAction
                      ? "Menyimpan..."
                      : isEditMode
                        ? "Update Guru"
                        : "Simpan Guru"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </AdminSchoolModalPortal>
      )}

      {deleteTarget && (
        <AdminSchoolModalPortal>
          <div className="fixed inset-0 z-[1210] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-[3px]">
            <button
              type="button"
              className="absolute inset-0 cursor-default"
              onClick={() => !deleteLoading && setDeleteTarget(null)}
              aria-label="Tutup konfirmasi hapus"
            />

            <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-2xl shadow-slate-950/20">
              <div className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-br from-white via-rose-50/70 to-white px-6 py-5">
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-rose-100/70 blur-3xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-600">
                      Konfirmasi Hapus
                    </p>
                    <h3 className="mt-2 text-xl font-black text-slate-950">
                      Hapus data guru?
                    </h3>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                      Data guru akan dihapus dari daftar. Pastikan data ini
                      memang tidak digunakan lagi.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={deleteLoading}
                    onClick={() => setDeleteTarget(null)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
                    aria-label="Batal hapus"
                  >
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-900">
                    {deleteTarget.nama}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {deleteTarget.email} · {deleteTarget.jabatan}
                  </p>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={deleteLoading}
                    onClick={() => setDeleteTarget(null)}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    disabled={deleteLoading}
                    onClick={handleDeleteTeacher}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-rose-600/20 transition hover:-translate-y-0.5 hover:bg-rose-700 disabled:opacity-50"
                  >
                    <TrashIcon />
                    {deleteLoading ? "Menghapus..." : "Hapus Guru"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </AdminSchoolModalPortal>
      )}
    </section>
  );
}
