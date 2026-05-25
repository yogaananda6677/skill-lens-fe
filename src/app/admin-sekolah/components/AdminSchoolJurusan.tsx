import { Icon } from "../../../components/ui/icons";
import type { JurusanRow } from "../types";

export function AdminSchoolJurusan({
  jurusanRows,
  jurusanName,
  loadingJurusan,
  setJurusanName,
  onSubmitJurusan,
}: {
  jurusanRows: JurusanRow[];
  jurusanName: string;
  loadingJurusan: boolean;
  setJurusanName: (value: string) => void;
  onSubmitJurusan: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      {/* Latar gradasi biru lembut */}
      <div className="rounded-2xl bg-gradient-to-b from-blue-50/90 to-white p-6">
        {/* Header biru tua gradasi */}
        <div className="-mx-6 -mt-6 mb-6 rounded-t-2xl bg-gradient-to-r from-[#0a1a3a] to-[#0f2a5f] px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/20 p-1.5 text-white">
              <Icon name="graduation" className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Data Jurusan</p>
          </div>
          <h2 className="mt-2 text-xl font-bold text-white">Kelola jurusan sekolah</h2>
          <p className="mt-1 text-sm text-blue-100">
            Jurusan digunakan saat import siswa dan filter data siswa.
          </p>
        </div>

        {/* Form tambah jurusan */}
        <form onSubmit={onSubmitJurusan} className="mt-2 flex flex-col gap-3 md:flex-row">
          <input
            value={jurusanName}
            onChange={(event) => setJurusanName(event.target.value)}
            placeholder="Contoh: IPA, IPS, RPL, TKJ"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            required
          />
          <button
            type="submit"
            disabled={loadingJurusan}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
          >
            <Icon name="spark" className="h-4 w-4" />
            {loadingJurusan ? "Menyimpan..." : "Tambah Jurusan"}
          </button>
        </form>

        {/* Tabel jurusan */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/50">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-blue-200 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800">
              <tr>
                <th className="px-5 py-3">Nama Jurusan</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/50">
              {jurusanRows.length ? (
                jurusanRows.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50/80">
                    <td className="px-5 py-3 font-semibold text-slate-800">{item.nama}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Aktif
                      </span>
                    </td>
                  </tr>
                ))
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

      {/* Dekorasi bottom gradient */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-b-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70" />
    </div>
  );
}