"use client";

import { useMemo, useState } from "react";
import type React from "react";
import { Icon } from "../../../components/ui/icons";
import { apiFetch } from "../../../lib/axios";
import type { JurusanRow } from "../types";

const SMA_JURUSAN_OPTIONS = ["IPA", "IPS", "BAHASA"];

type AdminSchoolJurusanProps = {
  jurusanRows: JurusanRow[];
  jurusanName: string;
  loadingJurusan: boolean;
  jenisSekolah?: string;
  setJurusanName: (value: string) => void;
  onSubmitJurusan: (event: React.FormEvent<HTMLFormElement>) => void;
  onReloadJurusan?: () => Promise<void> | void;
  showModal?: (
    title: string,
    description: string,
    type?: "success" | "error",
  ) => void;
};

const cardShellClass =
  "overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60";

const headerClass =
  "relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/50 to-sky-50/70 px-6 py-6 text-slate-900";

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-sky-600 to-cyan-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

function normalizeJurusanName(value: string) {
  return String(value || "").trim().replace(/\s+/g, " ").toUpperCase();
}

function getJurusanUsageCount(item: JurusanRow) {
  return item.usage_count ?? item.usage?.total ?? 0;
}

function isJurusanUsed(item: JurusanRow) {
  return item.is_used ?? item.usage?.is_used ?? getJurusanUsageCount(item) > 0;
}

function canEditJurusan(item: JurusanRow) {
  return item.can_edit ?? !isJurusanUsed(item);
}

function canDeleteJurusan(item: JurusanRow) {
  return item.can_delete ?? !isJurusanUsed(item);
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

function CheckIcon() {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function AdminSchoolJurusan({
  jurusanRows,
  jurusanName,
  loadingJurusan,
  jenisSekolah,
  setJurusanName,
  onSubmitJurusan,
  onReloadJurusan,
  showModal,
}: AdminSchoolJurusanProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);

  const isSma = String(jenisSekolah || "SMA").toUpperCase() === "SMA";

  const usedSmaOptions = useMemo(() => {
    return new Set(jurusanRows.map((item) => normalizeJurusanName(item.nama)));
  }, [jurusanRows]);

  const availableSmaOptions = useMemo(() => {
    return SMA_JURUSAN_OPTIONS.filter((option) => !usedSmaOptions.has(option));
  }, [usedSmaOptions]);

  const formJurusanName = normalizeJurusanName(jurusanName);

  async function reloadJurusan() {
    await onReloadJurusan?.();
  }

  function notify(
    title: string,
    description: string,
    type: "success" | "error" = "success",
  ) {
    showModal?.(title, description, type);
  }

  function startEdit(item: JurusanRow) {
    if (!canEditJurusan(item)) {
      notify(
        "Jurusan tidak bisa diedit",
        "Jurusan ini tidak bisa diedit karena sudah pernah dipakai oleh siswa, mapel, atau kurikulum.",
        "error",
      );
      return;
    }

    setEditingId(Number(item.id));
    setEditingName(normalizeJurusanName(item.nama));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  async function saveEdit(item: JurusanRow) {
    const id = Number(item.id);
    const nextName = normalizeJurusanName(editingName);

    if (!nextName) {
      notify("Nama jurusan kosong", "Nama jurusan wajib diisi.", "error");
      return;
    }

    setLoadingActionId(id);

    try {
      const result = await apiFetch<{ message?: string }>(
        `/admin-sekolah/jurusan/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ nama_jurusan: nextName }),
        },
      );

      notify(
        "Jurusan berhasil diperbarui",
        result.message || "Data jurusan sudah diperbarui.",
      );
      cancelEdit();
      await reloadJurusan();
    } catch (err) {
      notify(
        "Gagal memperbarui jurusan",
        err instanceof Error ? err.message : "Jurusan gagal diperbarui.",
        "error",
      );
    } finally {
      setLoadingActionId(null);
    }
  }

  async function deleteJurusan(item: JurusanRow) {
    const id = Number(item.id);

    if (!canDeleteJurusan(item)) {
      notify(
        "Jurusan tidak bisa dihapus",
        "Jurusan ini tidak bisa dihapus karena sudah pernah dipakai oleh siswa, mapel, atau kurikulum.",
        "error",
      );
      return;
    }

    const confirmed = window.confirm(
      `Hapus jurusan ${item.nama}? Data yang sudah dipakai tidak bisa dihapus.`,
    );

    if (!confirmed) return;

    setLoadingActionId(id);

    try {
      const result = await apiFetch<{ message?: string }>(
        `/admin-sekolah/jurusan/${id}`,
        {
          method: "DELETE",
        },
      );

      notify(
        "Jurusan berhasil dihapus",
        result.message || "Data jurusan sudah dihapus.",
      );
      await reloadJurusan();
    } catch (err) {
      notify(
        "Gagal menghapus jurusan",
        err instanceof Error ? err.message : "Jurusan gagal dihapus.",
        "error",
      );
    } finally {
      setLoadingActionId(null);
    }
  }

  return (
    <section className={cardShellClass}>
      <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-7 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
              <Icon name="graduation" className="h-3.5 w-3.5" />
              Data Jurusan
            </p>

            <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Kelola jurusan sekolah
            </h3>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Jurusan digunakan saat import siswa, mapel, template nilai, dan
              filter data siswa.
            </p>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-white via-cyan-50/80 to-sky-50 px-4 py-3 text-sm font-bold text-sky-700 shadow-sm">
            {jurusanRows.length} Jurusan
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 md:p-6">
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 p-5 text-sm font-medium leading-6 text-slate-600 shadow-sm shadow-sky-100/50">
          <div className="flex gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
              <Icon name="info" className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-600">
                Ketentuan Jurusan
              </p>

              <p className="mt-1">
                {isSma ? (
                  <>
                    Untuk SMA, jurusan hanya boleh <b>IPA</b>, <b>IPS</b>, atau{" "}
                    <b>BAHASA</b>. Jurusan yang sudah dipakai oleh siswa, mapel,
                    atau kurikulum tidak bisa diedit dan tidak bisa dihapus.
                  </>
                ) : (
                  <>
                    Untuk SMK, nama jurusan mengikuti program keahlian sekolah,
                    misalnya RPL, TKJ, TKRO, DKV, TPM, dan sejenisnya. Jurusan
                    yang sudah dipakai tidak bisa diedit dan tidak bisa dihapus.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={onSubmitJurusan}
          className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100/60"
        >
          <div className="mb-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-600">
              Tambah Jurusan
            </p>
            <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900">
              Buat data jurusan baru
            </h3>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* input/select tetap */}
            {isSma ? (
              <select
                value={jurusanName}
                onChange={(event) => setJurusanName(event.target.value)}
                className={inputClass}
                required
              >
                <option value="">Pilih jurusan SMA</option>
                {SMA_JURUSAN_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                    disabled={usedSmaOptions.has(option)}
                  >
                    {option} {usedSmaOptions.has(option) ? "(sudah ada)" : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={jurusanName}
                onChange={(event) =>
                  setJurusanName(event.target.value.toUpperCase())
                }
                placeholder="Contoh: RPL, TKJ, TKRO, DKV"
                className={inputClass}
                required
              />
            )}

            <button
              type="submit"
              disabled={
                loadingJurusan ||
                (isSma && (!formJurusanName || availableSmaOptions.length === 0))
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-r from-[#0b2450] via-sky-600 to-cyan-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="spark" className="h-4 w-4" />
              {loadingJurusan ? "Menyimpan..." : "Tambah Jurusan"}
            </button>
          </div>

          {isSma && availableSmaOptions.length === 0 && (
            <p className="mt-3 text-xs font-bold text-emerald-700">
              Semua jurusan SMA yang diizinkan sudah tersedia.
            </p>
          )}
        </form>

        {/* Daftar jurusan */}
        <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
          <div className="flex flex-col gap-3 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-600">
                Daftar Jurusan
              </p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900">
                Jurusan tersedia
              </h3>
            </div>

            <span className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-sky-600/20">
              {jurusanRows.length} Data
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-sky-100 via-white to-blue-100 text-xs font-black uppercase tracking-[0.14em] text-sky-800">
                <tr>
                  <th className="px-5 py-4">Nama Jurusan</th>
                  <th className="px-5 py-4">Status Penggunaan</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {jurusanRows.length ? (
                  jurusanRows.map((item) => {
                    const used = isJurusanUsed(item);
                    const editable = canEditJurusan(item);
                    const deletable = canDeleteJurusan(item);
                    const isEditing = editingId === Number(item.id);
                    const loadingThis = loadingActionId === Number(item.id);

                    return (
                      <tr key={item.id} className="transition hover:bg-sky-50/50">
                        <td className="px-5 py-4">
                          {isEditing ? (
                            isSma ? (
                              <select
                                value={editingName}
                                onChange={(event) =>
                                  setEditingName(event.target.value)
                                }
                                className={inputClass}
                              >
                                {SMA_JURUSAN_OPTIONS.map((option) => {
                                  const alreadyUsedByOther = jurusanRows.some(
                                    (row) =>
                                      Number(row.id) !== Number(item.id) &&
                                      normalizeJurusanName(row.nama) === option,
                                  );

                                  return (
                                    <option
                                      key={option}
                                      value={option}
                                      disabled={alreadyUsedByOther}
                                    >
                                      {option}{" "}
                                      {alreadyUsedByOther ? "(sudah ada)" : ""}
                                    </option>
                                  );
                                })}
                              </select>
                            ) : (
                              <input
                                value={editingName}
                                onChange={(event) =>
                                  setEditingName(event.target.value.toUpperCase())
                                }
                                className={inputClass}
                              />
                            )
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sm font-black text-sky-700 ring-1 ring-sky-200/70">
                                {normalizeJurusanName(item.nama).slice(0, 2)}
                              </div>

                              <div>
                                <p className="font-black text-slate-900">
                                  {item.nama}
                                </p>
                                <p className="text-xs font-medium text-slate-500">
                                  Program jurusan sekolah
                                </p>
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {used ? (
                            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                              Sudah Dipakai
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                              Belum Dipakai
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {isEditing ? (
                            <div className="inline-flex gap-2">
                              <button
                                type="button"
                                onClick={() => saveEdit(item)}
                                disabled={loadingThis}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                                title="Simpan jurusan"
                              >
                                <CheckIcon />
                              </button>

                              <button
                                type="button"
                                onClick={cancelEdit}
                                disabled={loadingThis}
                                className={secondaryButtonClass}
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                disabled={!editable || loadingThis}
                                title={
                                  !editable
                                    ? "Jurusan sudah dipakai dan tidak bisa diedit."
                                    : "Edit jurusan"
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <PencilIcon />
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteJurusan(item)}
                                disabled={!deletable || loadingThis}
                                title={
                                  !deletable
                                    ? "Jurusan sudah dipakai dan tidak bisa dihapus."
                                    : "Hapus jurusan"
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-14 text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                        <Icon name="graduation" className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        Belum ada jurusan.
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Tambahkan jurusan pertama melalui form di atas.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}