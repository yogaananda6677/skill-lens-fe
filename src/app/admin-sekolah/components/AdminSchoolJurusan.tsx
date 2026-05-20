import { Icon } from "../../../components/ui/icons";
import type { JurusanRow } from "../types";
import { PageCard } from "./AdminSchoolShared";

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
    <PageCard
      eyebrow="Data Jurusan"
      title="Kelola jurusan sekolah"
      description="Jurusan digunakan saat import siswa dan filter data siswa."
      icon="graduation"
    >
      <form onSubmit={onSubmitJurusan} className="flex flex-col gap-3 md:flex-row">
        <input
          value={jurusanName}
          onChange={(event) => setJurusanName(event.target.value)}
          placeholder="Contoh: IPA, IPS, RPL, TKJ"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />

        <button
          type="submit"
          disabled={loadingJurusan}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 disabled:opacity-60"
        >
          <Icon name="graduation" className="h-4 w-4" />
          {loadingJurusan ? "Menyimpan..." : "Tambah Jurusan"}
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Nama Jurusan</th>
              <th className="px-5 py-4 text-right">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {jurusanRows.length ? (
              jurusanRows.map((item) => (
                <tr key={item.id} className="hover:bg-sky-50/50">
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {item.nama}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      Aktif
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="px-5 py-10 text-center text-sm font-medium text-slate-400"
                >
                  Belum ada jurusan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageCard>
  );
}