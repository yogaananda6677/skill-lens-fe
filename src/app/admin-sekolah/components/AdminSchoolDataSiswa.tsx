import type { JurusanRow, SiswaRow } from "../types";
import { PageCard } from "./AdminSchoolShared";

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
    <PageCard
      eyebrow="Data Siswa"
      title="Kelola data siswa"
      description="Lihat data siswa hasil import berdasarkan nama, NISN, username, dan jurusan."
      icon="profile"
    >
      <div className="mb-5 grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto]">
        <input
          value={siswaSearch}
          onChange={(event) => setSiswaSearch(event.target.value)}
          placeholder="Cari nama, NISN, username..."
          className="rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />

        <select
          value={siswaJurusanFilter}
          onChange={(event) => setSiswaJurusanFilter(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
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
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export Excel
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Siswa</th>
                <th className="px-5 py-4">NISN</th>
                <th className="px-5 py-4">Kelas</th>
                <th className="px-5 py-4">Jurusan</th>
                <th className="px-5 py-4">Username</th>
                <th className="px-5 py-4">Password Awal</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {hasRows ? (
                siswaRows.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-sky-50/50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {siswa.nama}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {siswa.status || "Aktif"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {siswa.nisn}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {siswa.kelas || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {siswa.jurusan || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {siswa.username || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {getPasswordAwal(siswa)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm font-medium text-slate-400"
                  >
                    Belum ada data siswa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-medium text-slate-500">
          Total {siswaTotal} data
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={siswaPage <= 1}
            onClick={() => {
              const next = siswaPage - 1;
              setSiswaPage(next);
              loadSiswa(next);
            }}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Sebelumnya
          </button>

          <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
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
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </PageCard>
  );
}