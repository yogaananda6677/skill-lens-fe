import type {
  StudentAchievement,
  StudentProfileForm,
} from "../../../features/siswa/types";

const PROFILE_CHOICE_MAX = 4;

function cleanLimited(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const label = String(value ?? "").trim();
    const key = label.toLowerCase();
    if (!label || seen.has(key)) continue;

    seen.add(key);
    result.push(label);

    if (result.length >= PROFILE_CHOICE_MAX) break;
  }

  return result;
}

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
    minat: cleanLimited(profile.interests),
    hobi: cleanLimited(profile.hobbies),
    bakat: cleanLimited(profile.talents),
    pengalaman: cleanLimited(profile.experiences),

    // Prestasi berasal dari tabel prestasi_siswa, tetap opsional.
    prestasi: prestasiSpk,
    prestasi_detail: prestasiRows,

    tujuan_karir: profile.goal || "kuliah",
    top_n: 3,
  };
}
