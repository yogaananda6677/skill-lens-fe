import type {
  StudentAchievement,
  StudentProfileForm,
} from "../../../features/siswa/types";

export function buildStudentPayload(
  profile: StudentProfileForm,
  prestasiRows: StudentAchievement[],
) {
  const prestasiSpk = prestasiRows.map((item) =>
    [
      item.nama_prestasi,
      item.tingkat,
      item.tahun,
      item.penyelenggara,
    ]
      .filter(Boolean)
      .join(" - "),
  );

  return {
    minat: profile.interests,
    hobi: profile.hobbies,
    bakat: profile.talents,
    pengalaman: profile.experiences,

    // Prestasi berasal dari tabel prestasi_siswa
    prestasi: prestasiSpk,
    prestasi_detail: prestasiRows,

    tujuan_karir: profile.goal || "kuliah",
    top_n: 3,
  };
}