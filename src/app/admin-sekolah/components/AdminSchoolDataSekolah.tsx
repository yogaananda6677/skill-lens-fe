"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { FieldErrors, SchoolForm, AdminSchoolStatus } from "../types";
import { Field, StatusMessage } from "./AdminSchoolShared";
import { Icon } from "../../../components/ui/icons";

type SchoolDirectoryItem = {
  npsn: string;
  nama_sekolah: string;
  jenis_sekolah?: string | null;
  no_telp?: string | null;
  alamat?: string | null;
  provinsi?: string | null;
  kabupaten_kota?: string | null;
  kecamatan?: string | null;
};

type SchoolLookupData = {
  npsn: string;
  nama_sekolah: string;
  jenis_sekolah: string | null;
  status_sekolah?: string | null;
  no_hp_sekolah?: string | null;
  no_telp?: string | null;
  email_sekolah?: string | null;
  alamat_sekolah?: string | null;
  alamat?: string | null;
  desa?: string | null;
  kecamatan?: string | null;
  kabupaten_kota?: string | null;
  provinsi?: string | null;
};

const SCHOOL_TYPE_OPTIONS = [
  "SMA",
  "SMK",
  "MA",
  "MAK",
  "PAKET C",
  "PKBM",
  "SKB",
];

function cleanText(value: unknown) {
  const text = String(value ?? "").trim();
  return text.length ? text : "";
}

function cleanNpsn(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

function unique(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((item) => {
    const value = cleanText(item);
    const key = value.toLowerCase();

    if (!value || seen.has(key)) return;

    seen.add(key);
    result.push(value);
  });

  return result;
}

function normalizeSchoolType(value?: string | null, schoolName?: string | null) {
  const raw = `${value || ""} ${schoolName || ""}`.toUpperCase();

  if (raw.includes("SMK")) return "SMK";
  if (raw.includes("SMA")) return "SMA";
  if (raw.includes("MAK")) return "MAK";
  if (raw.includes("PAKET C")) return "PAKET C";
  if (raw.includes("PKBM")) return "PKBM";
  if (raw.includes("SKB")) return "SKB";

  const trimmed = cleanText(value).toUpperCase();

  if (trimmed === "MA") return "MA";
  if (trimmed.includes("MADRASAH ALIYAH")) return "MA";

  return trimmed || "";
}

function isAllowedSchoolType(value?: string | null, schoolName?: string | null) {
  const normalized = normalizeSchoolType(value, schoolName);

  return SCHOOL_TYPE_OPTIONS.some((type) => normalized.includes(type));
}

function getApiBaseUrl() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";

  return baseUrl.replace(/\/$/, "");
}

function getAuthToken() {
  if (typeof window === "undefined") return "";

  return (
    window.localStorage.getItem("accessToken") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("auth_token") ||
    ""
  );
}

function pick(source: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    const value = cleanText(source?.[key]);
    if (value) return value;
  }

  return "";
}

function normalizeLookupResponse(json: any): SchoolLookupData {
  const data = json?.data ?? json ?? {};

  const npsn = pick(data, ["npsn", "NPSN"]);
  const namaSekolah = pick(data, [
    "nama_sekolah",
    "namaSekolah",
    "nama",
    "sekolah",
    "namaSatuanPendidikan",
  ]);

  const jenisSekolah = normalizeSchoolType(
    pick(data, [
      "jenis_sekolah",
      "jenisSekolah",
      "bentuk",
      "bentukPendidikan",
      "bentuk_pendidikan",
    ]),
    namaSekolah,
  );

  const alamatJalan = pick(data, [
    "alamat_sekolah",
    "alamatSekolah",
    "alamatJalan",
    "alamat_jalan",
    "alamat",
  ]);

  const desa = pick(data, [
    "desa",
    "namaDesa",
    "desaKelurahan",
    "kelurahan",
    "namaDesaKelurahan",
  ]);

  const kecamatan = pick(data, [
    "kecamatan",
    "namaKecamatan",
  ]);

  const kabupatenKota = pick(data, [
    "kabupaten_kota",
    "kabupatenKota",
    "namaKabupaten",
    "namaKabupatenKota",
    "kabupaten",
  ]);

  const provinsi = pick(data, [
    "provinsi",
    "namaProvinsi",
    "propinsi",
  ]);

  const generatedAddress = [
    alamatJalan,
    desa,
    kecamatan,
    kabupatenKota,
    provinsi,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    npsn,
    nama_sekolah: namaSekolah,
    jenis_sekolah: jenisSekolah || null,
    status_sekolah: pick(data, [
      "status_sekolah",
      "statusSekolah",
      "statusSatuanPendidikan",
      "status",
    ]) || null,
    no_hp_sekolah: pick(data, [
      "no_hp_sekolah",
      "noHpSekolah",
      "noHp",
      "telepon",
      "telp",
      "noTelepon",
    ]) || null,
    email_sekolah: pick(data, [
      "email_sekolah",
      "emailSekolah",
      "email",
    ]) || null,
    alamat_sekolah: generatedAddress || alamatJalan || null,
    desa: desa || null,
    kecamatan: kecamatan || null,
    kabupaten_kota: kabupatenKota || null,
    provinsi: provinsi || null,
  };
}

async function lookupSchoolByNpsn(npsn: string) {
  const apiBaseUrl = getApiBaseUrl();
  const token = getAuthToken();

  const endpoint = `${apiBaseUrl}/school-lookup?npsn=${encodeURIComponent(npsn)}`;

  console.log("HIT SCHOOL LOOKUP:", endpoint);

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      json?.message ||
        json?.error ||
        `Gagal mengambil data sekolah dari server. Endpoint: ${endpoint}`,
    );
  }

  return normalizeLookupResponse(json);
}

export function AdminSchoolDataSekolah({
  schoolStatus,
  schoolForm,
  schoolErrors,
  schoolTouched,
  schoolMessage,
  schoolError,
  loadingSchool,
  onUpdate,
  onSubmit,
  onBack,
  schoolOptions = [],
}: {
  schoolStatus: AdminSchoolStatus | null;
  schoolForm: SchoolForm;
  schoolErrors: FieldErrors<SchoolForm>;
  schoolTouched: boolean;
  schoolMessage: string;
  schoolError: string;
  loadingSchool: boolean;
  onUpdate: (key: keyof SchoolForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;

  /**
   * Optional.
   * Isi ini kalau kamu punya data sekolah di FE untuk dropdown:
   * provinsi -> kab/kota -> kecamatan -> sekolah.
   * Kalau tidak dikirim, bagian dropdown otomatis tidak muncul.
   */
  schoolOptions?: SchoolDirectoryItem[];
}) {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSchoolNpsn, setSelectedSchoolNpsn] = useState("");

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const [lookupError, setLookupError] = useState("");

  const normalizedDirectory = useMemo(() => {
    return schoolOptions
      .map((item) => {
        const npsn = cleanNpsn(item.npsn || "");
        const namaSekolah = cleanText(item.nama_sekolah);

        return {
          ...item,
          npsn,
          nama_sekolah: namaSekolah,
          jenis_sekolah: normalizeSchoolType(item.jenis_sekolah, namaSekolah),
          provinsi: cleanText(item.provinsi),
          kabupaten_kota: cleanText(item.kabupaten_kota),
          kecamatan: cleanText(item.kecamatan),
          no_telp: cleanText(item.no_telp),
          alamat: cleanText(item.alamat),
        };
      })
      .filter((item) => {
        return (
          item.npsn &&
          item.nama_sekolah &&
          isAllowedSchoolType(item.jenis_sekolah, item.nama_sekolah)
        );
      });
  }, [schoolOptions]);

  const provinceOptions = useMemo(() => {
    return unique(normalizedDirectory.map((item) => item.provinsi || ""));
  }, [normalizedDirectory]);

  const cityOptions = useMemo(() => {
    return unique(
      normalizedDirectory
        .filter((item) => !selectedProvince || item.provinsi === selectedProvince)
        .map((item) => item.kabupaten_kota || ""),
    );
  }, [normalizedDirectory, selectedProvince]);

  const districtOptions = useMemo(() => {
    return unique(
      normalizedDirectory
        .filter((item) => !selectedProvince || item.provinsi === selectedProvince)
        .filter((item) => !selectedCity || item.kabupaten_kota === selectedCity)
        .map((item) => item.kecamatan || ""),
    );
  }, [normalizedDirectory, selectedProvince, selectedCity]);

  const filteredSchoolOptions = useMemo(() => {
    return normalizedDirectory
      .filter((item) => !selectedProvince || item.provinsi === selectedProvince)
      .filter((item) => !selectedCity || item.kabupaten_kota === selectedCity)
      .filter((item) => !selectedDistrict || item.kecamatan === selectedDistrict);
  }, [normalizedDirectory, selectedProvince, selectedCity, selectedDistrict]);

  const hasDirectoryOptions = normalizedDirectory.length > 0;

  function resetLookupStatus() {
    setLookupMessage("");
    setLookupError("");
  }

  function updateNpsn(value: string) {
    const npsn = cleanNpsn(value);
    resetLookupStatus();
    onUpdate("npsn", npsn);
  }

  function applySchoolToForm(school: Partial<SchoolLookupData>) {
    const npsn = cleanNpsn(school.npsn || "");
    const namaSekolah = cleanText(school.nama_sekolah);
    const jenisSekolah = normalizeSchoolType(school.jenis_sekolah, namaSekolah);
    const noTelp = cleanText(school.no_hp_sekolah || school.no_telp || "");
    const alamat = cleanText(school.alamat_sekolah || school.alamat || "");

    if (namaSekolah) onUpdate("nama_sekolah", namaSekolah);
    if (npsn) onUpdate("npsn", npsn);
    if (jenisSekolah) onUpdate("jenis_sekolah", jenisSekolah);
    onUpdate("no_telp", noTelp);
    if (alamat) onUpdate("alamat", alamat);
  }

  async function handleLookup(npsnValue = schoolForm.npsn) {
    const npsn = cleanNpsn(npsnValue);

    setLookupMessage("");
    setLookupError("");

    if (!/^\d{8}$/.test(npsn)) {
      setLookupError("NPSN harus berisi 8 digit angka.");
      return;
    }

    onUpdate("npsn", npsn);
    setLookupLoading(true);

    try {
      const school = await lookupSchoolByNpsn(npsn);

      if (!school.npsn || !school.nama_sekolah) {
        throw new Error("Data sekolah tidak lengkap.");
      }

      if (!isAllowedSchoolType(school.jenis_sekolah, school.nama_sekolah)) {
        throw new Error("Sekolah yang dipilih bukan SMA/SMK/sederajat.");
      }

      applySchoolToForm(school);
      setLookupMessage("Data sekolah berhasil ditemukan dan otomatis diisi.");
    } catch (error) {
      setLookupError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data sekolah.",
      );
    } finally {
      setLookupLoading(false);
    }
  }

  function handleProvinceChange(value: string) {
    setSelectedProvince(value);
    setSelectedCity("");
    setSelectedDistrict("");
    setSelectedSchoolNpsn("");
    resetLookupStatus();
  }

  function handleCityChange(value: string) {
    setSelectedCity(value);
    setSelectedDistrict("");
    setSelectedSchoolNpsn("");
    resetLookupStatus();
  }

  function handleDistrictChange(value: string) {
    setSelectedDistrict(value);
    setSelectedSchoolNpsn("");
    resetLookupStatus();
  }

  function handleDirectorySchoolChange(npsn: string) {
    const cleanSelectedNpsn = cleanNpsn(npsn);
    setSelectedSchoolNpsn(cleanSelectedNpsn);
    resetLookupStatus();

    const selectedSchool = filteredSchoolOptions.find(
      (item) => item.npsn === cleanSelectedNpsn,
    );

    if (!selectedSchool) return;

    applySchoolToForm({
      npsn: selectedSchool.npsn,
      nama_sekolah: selectedSchool.nama_sekolah,
      jenis_sekolah: selectedSchool.jenis_sekolah || null,
      no_telp: selectedSchool.no_telp || null,
      alamat: selectedSchool.alamat || null,
      kecamatan: selectedSchool.kecamatan || null,
      kabupaten_kota: selectedSchool.kabupaten_kota || null,
      provinsi: selectedSchool.provinsi || null,
    });

    void handleLookup(selectedSchool.npsn);
  }

  if (schoolStatus?.school_status === "approved") {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
        <div className="rounded-2xl bg-gradient-to-b from-blue-50/90 to-white p-6">
          <div className="-mx-6 -mt-6 mb-6 rounded-t-2xl bg-gradient-to-r from-[#0a1a3a] to-[#0f2a5f] px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white/20 p-1.5 text-white">
                <Icon name="school" className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
                Data Sekolah
              </p>
            </div>
            <h2 className="mt-2 text-xl font-bold text-white">
              Sekolah sudah diverifikasi
            </h2>
            <p className="mt-1 text-sm text-blue-100">
              Data sekolah sudah disetujui. Pengajuan baru tidak diperlukan.
            </p>
          </div>

          <div className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
            <p className="text-sm font-semibold text-emerald-700">
              Status Aktif
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-950">
              {schoolStatus.nama_sekolah}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Sekolah sudah diverifikasi oleh superadmin. Fitur guru, jurusan,
              import siswa, dan data siswa sudah aktif.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Kembali ke dashboard
          </button>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-b-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70" />
      </div>
    );
  }

  if (schoolStatus?.school_status === "pending") {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
        <div className="rounded-2xl bg-gradient-to-b from-blue-50/90 to-white p-6">
          <div className="-mx-6 -mt-6 mb-6 rounded-t-2xl bg-gradient-to-r from-[#0a1a3a] to-[#0f2a5f] px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white/20 p-1.5 text-white">
                <Icon name="school" className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
                Data Sekolah
              </p>
            </div>
            <h2 className="mt-2 text-xl font-bold text-white">
              Pengajuan sedang diverifikasi
            </h2>
            <p className="mt-1 text-sm text-blue-100">
              Data sekolah sudah dikirim dan sedang menunggu persetujuan
              superadmin.
            </p>
          </div>

          <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white/50 p-1.5 text-amber-600">
                <Icon name="clock" className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Menunggu verifikasi
              </h3>
            </div>
            <p className="mt-2 text-sm text-amber-700">
              {schoolStatus.message}
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Kembali ke dashboard
          </button>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-b-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-[1px] shadow-md">
      <div className="rounded-2xl bg-gradient-to-b from-blue-50/90 to-white p-6">
        <div className="-mx-6 -mt-6 mb-6 rounded-t-2xl bg-gradient-to-r from-[#0a1a3a] to-[#0f2a5f] px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/20 p-1.5 text-white">
              <Icon name="school" className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
              Pengajuan Sekolah
            </p>
          </div>
          <h2 className="mt-2 text-xl font-bold text-white">
            Ajukan data sekolah
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            Pilih sekolah atau masukkan NPSN. Data sekolah akan diambil
            otomatis, lalu masih bisa kamu koreksi jika ada data yang kosong.
          </p>
        </div>

        {schoolStatus?.message ? (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            {schoolStatus.message}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-5">
          {hasDirectoryOptions ? (
            <div className="rounded-2xl border border-blue-100 bg-white/80 p-4">
              <div className="mb-4">
                <p className="text-sm font-bold text-slate-800">
                  Pilih sekolah dari daftar
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Filter dibuat bertahap: provinsi, kabupaten/kota, kecamatan,
                  lalu sekolah. Setelah sekolah dipilih, detail akan dicari
                  lagi lewat NPSN.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Provinsi
                  </span>
                  <select
                    value={selectedProvince}
                    onChange={(event) => handleProvinceChange(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="">Pilih provinsi</option>
                    {provinceOptions.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Kabupaten/Kota
                  </span>
                  <select
                    value={selectedCity}
                    onChange={(event) => handleCityChange(event.target.value)}
                    disabled={!selectedProvince}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">Pilih kabupaten/kota</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Kecamatan
                  </span>
                  <select
                    value={selectedDistrict}
                    onChange={(event) => handleDistrictChange(event.target.value)}
                    disabled={!selectedCity}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">Pilih kecamatan</option>
                    {districtOptions.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">
                    Sekolah
                  </span>
                  <select
                    value={selectedSchoolNpsn}
                    onChange={(event) =>
                      handleDirectorySchoolChange(event.target.value)
                    }
                    disabled={!selectedDistrict}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">Pilih sekolah</option>
                    {filteredSchoolOptions.map((school) => (
                      <option key={school.npsn} value={school.npsn}>
                        {school.nama_sekolah}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-blue-100 bg-white/80 p-4">
            <div className="mb-4">
              <p className="text-sm font-bold text-slate-800">
                Cari otomatis berdasarkan NPSN
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Gunakan ini kalau data dropdown belum tersedia. Masukkan NPSN 8
                digit, lalu klik Ambil Data.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <label className="block flex-1">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  NPSN
                </span>
                <input
                  value={schoolForm.npsn}
                  placeholder="Contoh: 20500435"
                  onChange={(event) => updateNpsn(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                />
                {schoolTouched && schoolErrors.npsn ? (
                  <p className="mt-1 text-xs text-rose-600">
                    {schoolErrors.npsn}
                  </p>
                ) : null}
              </label>

              <button
                type="button"
                disabled={lookupLoading || !schoolForm.npsn}
                onClick={() => handleLookup()}
                className="mt-0 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 md:mt-6"
              >
                <Icon name="search" className="h-4 w-4" />
                {lookupLoading ? "Mengambil..." : "Ambil Data"}
              </button>
            </div>

            {lookupMessage ? (
              <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-medium text-blue-700">
                {lookupMessage}
              </div>
            ) : null}

            {lookupError ? (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
                {lookupError}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nama sekolah"
              value={schoolForm.nama_sekolah}
              placeholder="SMAN 1 Contoh"
              error={schoolTouched ? schoolErrors.nama_sekolah : ""}
              onChange={(value) => onUpdate("nama_sekolah", value)}
            />

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Jenis sekolah
              </span>
              <select
                value={schoolForm.jenis_sekolah}
                onChange={(event) =>
                  onUpdate("jenis_sekolah", event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                <option value="">Pilih jenis sekolah</option>
                {SCHOOL_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {schoolTouched && schoolErrors.jenis_sekolah ? (
                <p className="mt-1 text-xs text-rose-600">
                  {schoolErrors.jenis_sekolah}
                </p>
              ) : null}
            </label>

            <Field
              label="Nomor telepon sekolah"
              value={schoolForm.no_telp}
              placeholder="Opsional, contoh: 0354xxxxxx"
              error={schoolTouched ? schoolErrors.no_telp : ""}
              onChange={(value) => onUpdate("no_telp", value)}
            />

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-700">
                Informasi pengisian
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Nomor telepon bisa kosong karena tidak semua data sekolah
                menyediakan nomor aktif. Alamat tetap boleh diedit kalau hasil
                dari API kurang lengkap.
              </p>
            </div>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Alamat sekolah
              </span>
              <textarea
                value={schoolForm.alamat}
                placeholder="Contoh: Jl. Pendidikan No. 1, Desa/Kelurahan, Kecamatan, Kabupaten/Kota, Provinsi"
                onChange={(event) => onUpdate("alamat", event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
              {schoolTouched && schoolErrors.alamat ? (
                <p className="mt-1 text-xs text-rose-600">
                  {schoolErrors.alamat}
                </p>
              ) : null}
            </label>
          </div>

          <StatusMessage message={schoolMessage} error={schoolError} />

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loadingSchool || lookupLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
            >
              <Icon name="spark" className="h-4 w-4" />
              {loadingSchool ? "Mengirim..." : "Ajukan Sekolah"}
            </button>

            <button
              type="button"
              onClick={onBack}
              disabled={loadingSchool || lookupLoading}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Kembali
            </button>
          </div>
        </form>
      </div>

      <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-b-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-70" />
    </div>
  );
}