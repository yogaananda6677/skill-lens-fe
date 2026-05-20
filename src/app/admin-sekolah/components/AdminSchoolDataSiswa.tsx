import type { JurusanRow, SiswaRow } from "../types";
import { Icon } from "../../../components/ui/icons";

function getPasswordAwal(siswa: SiswaRow) {
  return (
    siswa.password_awal ||
    siswa.password_default ||
    siswa.password ||
    siswa.nisn ||
    "-"
  );
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function downloadExcel(rows: SiswaRow[]) {
  const tableRows = rows
    .map((siswa, index) => {
      const passwordAwal = getPasswordAwal(siswa);
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(siswa.nama)}</td>
          <td>${escapeHtml(siswa.nisn)}</td>
          <td>${escapeHtml(siswa.kelas)}</td>
          <td>${escapeHtml(siswa.jurusan || "-")}</td>
          <td>${escapeHtml(siswa.username)}</td>
          <td>${escapeHtml(passwordAwal)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Siswa</th>
              <th>NISN</th>
              <th>Kelas</th>
              <th>Jurusan</th>
              <th>Username</th>
              <th>Password Awal</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `data-siswa-${date}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function AdminSchoolDataSiswa({
  siswaRows,
  siswaTotal,
  siswaPage,
  siswaLimit,
  siswaSearch,
  siswaJurusanFilter,
  jurusanRows,
  setSiswaSearch,
  setSiswaJurusanFilter,
  setSiswaPage,
  loadSiswa,
}: {
  siswaRows: SiswaRow[];
  siswaTotal: number;
  siswaPage: number;
  siswaLimit: number;
  siswaSearch: string;
  siswaJurusanFilter: string;
  jurusanRows: JurusanRow[];
  setSiswaSearch: (value: string) => void;
  setSiswaJurusanFilter: (value: string) => void;
  setSiswaPage: (value: number) => void;
  loadSiswa: (page?: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(siswaTotal / siswaLimit));
  const hasRows = siswaRows.length > 0;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-xl bg-white p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-full bg-blue-100 p-1.5 text-blue-600">
            <Icon name="profile" className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Data Siswa</p>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Kelola data siswa</h2>
        <p className="mt-1 text-sm text-slate-500">Lihat data siswa hasil import berdasarkan nama, NISN, username, dan jurusan.</p>

        <div className="mt-5 mb-5 grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto]">
          <input
            value={siswaSearch}
            onChange={(event) => setSiswaSearch(event.target.value)}
            placeholder="Cari nama, NISN, username..."
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />

          <select
            value={siswaJurusanFilter}
            onChange={(event) => setSiswaJurusanFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="semua">Semua jurusan</option>
            {jurusanRows.map((jurusan) => (
              <option key={jurusan.id} value={jurusan.id}>
                {jurusan.nama}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!hasRows}
            onClick={() => downloadExcel(siswaRows)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
          >
            <Icon name="download" className="h-4 w-4" />
            Export Excel
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-xs font-semibold uppercase tracking-wider text-blue-800 border-b border-blue-200">
                <tr>
                  <th className="px-5 py-3">Siswa</th>
                  <th className="px-5 py-3">NISN</th>
                  <th className="px-5 py-3">Kelas</th>
                  <th className="px-5 py-3">Jurusan</th>
                  <th className="px-5 py-3">Username</th>
                  <th className="px-5 py-3">Password Awal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hasRows ? (
                  siswaRows.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">{siswa.nama}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{siswa.status || "Aktif"}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{siswa.nisn}</td>
                      <td className="px-5 py-3 text-slate-600">{siswa.kelas || "-"}</td>
                      <td className="px-5 py-3 text-slate-600">{siswa.jurusan || "-"}</td>
                      <td className="px-5 py-3 text-slate-600">{siswa.username || "-"}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {getPasswordAwal(siswa)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                      Belum ada data siswa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-slate-500">Total {siswaTotal} data</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={siswaPage <= 1}
              onClick={() => {
                const next = siswaPage - 1;
                setSiswaPage(next);
                loadSiswa(next);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              {siswaPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={siswaPage >= totalPages}
              onClick={() => {
                const next = siswaPage + 1;
                setSiswaPage(next);
                loadSiswa(next);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70 rounded-b-xl" />
    </div>
  );
}