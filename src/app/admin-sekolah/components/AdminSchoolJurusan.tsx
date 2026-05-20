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
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-xl bg-white p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
            <Icon name="graduation" className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Data Jurusan</p>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Kelola jurusan sekolah</h2>
        <p className="mt-1 text-sm text-slate-500">Jurusan digunakan saat import siswa dan filter data siswa.</p>

        <form onSubmit={onSubmitJurusan} className="mt-5 flex flex-col gap-3 md:flex-row">
          <input
            value={jurusanName}
            onChange={(event) => setJurusanName(event.target.value)}
            placeholder="Contoh: IPA, IPS, RPL, TKJ"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            required
          />
          <button
            type="submit"
            disabled={loadingJurusan}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
          >
            <Icon name="spark" className="h-4 w-4" />
            {loadingJurusan ? "Menyimpan..." : "Tambah Jurusan"}
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800 border-b border-blue-200">
              <tr>
                <th className="px-5 py-3">Nama Jurusan</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jurusanRows.length ? (
                jurusanRows.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3 font-semibold text-slate-800">{item.nama}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        Aktif
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-5 py-10 text-center text-sm text-slate-500">
                    Belum ada jurusan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70 rounded-b-xl" />
    </div>
  );
}