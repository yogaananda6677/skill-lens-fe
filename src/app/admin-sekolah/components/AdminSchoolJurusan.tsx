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

function getUsageDetailText(item: JurusanRow) {
  const usage = item.usage;

  if (!usage || !usage.total) {
    return "Jurusan ini belum dipakai.";
  }

  const parts = [];

  if (usage.siswa) parts.push(`${usage.siswa} siswa`);
  if (usage.mapel) parts.push(`${usage.mapel} mapel`);
  if (usage.kurikulum) parts.push(`${usage.kurikulum} kurikulum`);

  return parts.length
    ? `Sudah dipakai oleh ${parts.join(", ")}.`
    : "Jurusan ini sudah pernah dipakai.";
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-2xl bg-gradient-to-b from-blue-50/90 to-white p-6">
        <div className="-mx-6 -mt-6 mb-6 rounded-t-2xl bg-gradient-to-r from-[#0a1a3a] to-[#0f2a5f] px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/20 p-1.5 text-white">
              <Icon name="graduation" className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
              Data Jurusan
            </p>
          </div>
          <h2 className="mt-2 text-xl font-bold text-white">
            Kelola jurusan sekolah
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            Jurusan digunakan saat import siswa, mapel, template nilai, dan filter data siswa.
          </p>
        </div>

        <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium leading-6 text-blue-700">
          {isSma ? (
            <>
              Untuk SMA, jurusan hanya boleh <b>IPA</b>, <b>IPS</b>, atau <b>BAHASA</b>. Jurusan yang sudah pernah dipakai oleh siswa, mapel, atau kurikulum tidak bisa diedit dan tidak bisa dihapus.
            </>
          ) : (
            <>
              Untuk SMK, nama jurusan mengikuti program keahlian sekolah, misalnya RPL, TKJ, TKRO, DKV, TPM, dan sejenisnya. Jurusan yang sudah dipakai tidak bisa diedit dan tidak bisa dihapus.
            </>
          )}
        </div>

        <form onSubmit={onSubmitJurusan} className="mt-2 flex flex-col gap-3 md:flex-row">
          {isSma ? (
            <select
              value={jurusanName}
              onChange={(event) => setJurusanName(event.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              required
            >
              <option value="">Pilih jurusan SMA</option>
              {SMA_JURUSAN_OPTIONS.map((option) => (
                <option key={option} value={option} disabled={usedSmaOptions.has(option)}>
                  {option} {usedSmaOptions.has(option) ? "(sudah ada)" : ""}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={jurusanName}
              onChange={(event) => setJurusanName(event.target.value.toUpperCase())}
              placeholder="Contoh: RPL, TKJ, TKRO, DKV"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              required
            />
          )}

          <button
            type="submit"
            disabled={loadingJurusan || (isSma && (!formJurusanName || availableSmaOptions.length === 0))}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="spark" className="h-4 w-4" />
            {loadingJurusan ? "Menyimpan..." : "Tambah Jurusan"}
          </button>
        </form>

        {isSma && availableSmaOptions.length === 0 && (
          <p className="mt-2 text-xs font-medium text-emerald-700">
            Semua jurusan SMA yang diizinkan sudah tersedia.
          </p>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/50">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-blue-200 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800">
              <tr>
                <th className="px-5 py-3">Nama Jurusan</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/50">
              {jurusanRows.length ? (
                jurusanRows.map((item) => {
                  const used = isJurusanUsed(item);
                  const editable = canEditJurusan(item);
                  const deletable = canDeleteJurusan(item);
                  const isEditing = editingId === Number(item.id);
                  const loadingThis = loadingActionId === Number(item.id);

                  return (
                    <tr key={item.id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        {isEditing ? (
                          isSma ? (
                            <select
                              value={editingName}
                              onChange={(event) => setEditingName(event.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                            >
                              {SMA_JURUSAN_OPTIONS.map((option) => {
                                const alreadyUsedByOther = jurusanRows.some(
                                  (row) => Number(row.id) !== Number(item.id) && normalizeJurusanName(row.nama) === option,
                                );

                                return (
                                  <option key={option} value={option} disabled={alreadyUsedByOther}>
                                    {option} {alreadyUsedByOther ? "(sudah ada)" : ""}
                                  </option>
                                );
                              })}
                            </select>
                          ) : (
                            <input
                              value={editingName}
                              onChange={(event) => setEditingName(event.target.value.toUpperCase())}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                            />
                          )
                        ) : (
                          item.nama
                        )}
                      </td>

                      <td className="px-5 py-3 text-right">
                        {isEditing ? (
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(item)}
                              disabled={loadingThis}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={loadingThis}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-2">
                            {used && (
                              <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs font-medium leading-5 text-amber-700">
                                Jurusan ini tidak bisa diedit atau dihapus karena sudah pernah dipakai.
                                <span className="mt-0.5 block text-amber-600">
                                  {getUsageDetailText(item)}
                                </span>
                              </div>
                            )}

                            <div className="inline-flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                disabled={!editable || loadingThis}
                                title={!editable ? "Jurusan sudah dipakai dan tidak bisa diedit." : "Edit jurusan"}
                                className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteJurusan(item)}
                                disabled={!deletable || loadingThis}
                                title={!deletable ? "Jurusan sudah dipakai dan tidak bisa dihapus." : "Hapus jurusan"}
                                className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={2} className="px-5 py-12 text-center text-slate-500">
                    Belum ada jurusan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-b-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70" />
    </div>
  );
}
