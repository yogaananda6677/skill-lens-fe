"use client";

import { useState } from "react";
import { Icon } from "../../../components/ui/icons";
import { apiFetch } from "../../../lib/axios";
import type { JurusanRow, SiswaRow } from "../types";

type NilaiItem = {
  id_kurikulum_mapel: number;
  nama_mapel: string;
  nilai: number;
};

type Props = {
  siswaRows: SiswaRow[];
  jurusanRows: JurusanRow[];
  loadSiswa: (page?: number) => void; // opsional, untuk refresh jika perlu
};

export function AdminSchoolDataNilai({ siswaRows, jurusanRows, loadSiswa }: Props) {
  const [selectedJurusan, setSelectedJurusan] = useState<string>("semua");
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaRow | null>(null);
  const [nilaiList, setNilaiList] = useState<NilaiItem[]>([]);
  const [loadingNilai, setLoadingNilai] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const filteredSiswa = siswaRows.filter((siswa) => {
    if (selectedJurusan === "semua") return true;
    return String(siswa.id_jurusan ?? "") === selectedJurusan;
    });

  async function handleShowNilai(siswa: SiswaRow) {
    setSelectedSiswa(siswa);
    setLoadingNilai(true);
    setShowModal(true);
    try {
      const result = await apiFetch<{ data?: NilaiItem[] }>(`/admin-sekolah/siswa/${siswa.id}/nilai`, {
        method: "GET",
      });
      setNilaiList(result.data || []);
    } catch (err) {
      console.error("Gagal memuat nilai:", err);
      setNilaiList([]);
    } finally {
      setLoadingNilai(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setSelectedSiswa(null);
    setNilaiList([]);
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-xl bg-white p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
            <Icon name="chart" className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Data Nilai</p>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Kelola nilai siswa</h2>
        <p className="mt-1 text-sm text-slate-500">Lihat nilai keseluruhan siswa berdasarkan mata pelajaran.</p>

        {/* Filter jurusan */}
        <div className="mt-5 mb-5 flex flex-wrap gap-3">
          <select
            value={selectedJurusan}
            onChange={(e) => setSelectedJurusan(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white"
          >
            <option value="semua">Semua Jurusan</option>
            {jurusanRows.map((j) => (
              <option key={j.id} value={String(j.id)}>{j.nama}</option>
            ))}
          </select>
        </div>

        {/* Tabel data siswa */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800 border-b border-blue-200">
                <tr>
                  <th className="px-5 py-3">Nama Siswa</th>
                  <th className="px-5 py-3">NISN</th>
                  <th className="px-5 py-3">Kelas</th>
                  <th className="px-5 py-3">Jurusan</th>
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSiswa.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      Tidak ada siswa untuk jurusan ini.
                    </td>
                  </tr>
                ) : (
                  filteredSiswa.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3 font-semibold text-slate-800">{siswa.nama}</td>
                      <td className="px-5 py-3 text-slate-600">{siswa.nisn}</td>
                      <td className="px-5 py-3 text-slate-600">{siswa.kelas || "-"}</td>
                      <td className="px-5 py-3 text-slate-600">{siswa.jurusan || "-"}</td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => handleShowNilai(siswa)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Lihat Nilai
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal detail nilai */}
      {showModal && selectedSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Nilai {selectedSiswa.nama} ({selectedSiswa.nisn})
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            {loadingNilai ? (
              <div className="py-8 text-center">Memuat nilai...</div>
            ) : nilaiList.length === 0 ? (
              <div className="py-8 text-center text-slate-500">Belum ada nilai untuk siswa ini.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                        <th className="px-4 py-2 text-left">Mata Pelajaran</th>
                        <th className="px-4 py-2 text-left">Nilai</th>
                    </tr>
                    </thead>
                    <tbody>
                    {nilaiList.map((item) => (
                        <tr key={item.id_kurikulum_mapel} className="border-t">
                        <td className="px-4 py-2">{item.nama_mapel}</td>
                        <td className="px-4 py-2 font-medium">{item.nilai}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}