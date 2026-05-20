# Catatan Revisi Frontend SkillLens

## Fokus revisi

Frontend direvisi agar lebih sesuai dengan backend final SkillLens, terutama pada bagian role, sidebar, integrasi SPK, roadmap, dan konsistensi API.

## Perubahan arsitektur

1. Navigasi dashboard dipusatkan di `src/config/navigation.ts`.
   - `studentNav`
   - `guruNav`
   - `adminNav`
   - `superadminNav`

2. Role frontend sudah ditambah `admin_sekolah` di `src/lib/auth.ts`.
   - `admin_sekolah` diarahkan ke `/guru` karena memakai ruang kerja sekolah.
   - `DashboardShell` sudah mengenali label `Admin Sekolah`.

3. API client diseragamkan memakai `src/lib/axios.ts`.
   - `features/superadmin/api.ts` tidak lagi membuat fetch client sendiri.
   - Response 401/403 otomatis membersihkan local storage auth.

## Perbaikan sidebar

1. Menu mobile tidak lagi hanya memotong 4 menu tanpa akses lanjutan.
2. Jika menu lebih dari 4, menu keempat menjadi tombol `Menu` untuk membuka sidebar lengkap.
3. Navigasi hash dibuat lebih aman dengan delay scroll setelah state section berubah.
4. Navigasi dashboard tiap role diambil dari satu sumber agar label dan urutan tidak beda-beda antar halaman.

## Penyesuaian fitur siswa

1. Field siswa disesuaikan dengan backend final:
   - `minat`
   - `hobi`
   - `bakat`
   - `pengalaman`
   - `prestasi`
   - `tujuan_karir`

2. Field `skill` yang sebelumnya berdiri sendiri tidak lagi dikirim sebagai field utama SPK.
   - Bakat tetap masuk `bakat`.
   - Pengalaman masuk `pengalaman`.
   - Prestasi dikirim sebagai array berdasarkan teks yang dipisahkan koma/baris baru.

3. `handleProcessSpk()` tidak lagi memanggil `saveSiswaProfile()` dua kali.
   - Sekarang cukup memanggil `/siswa/spk` karena backend SPK sudah menyimpan profil dan hasil rekomendasi.

4. Praktik ditambahkan sebagai komponen nilai akademik untuk jalur SMK.

## Penyesuaian roadmap

1. Dummy roadmap frontend dihapus.
2. Roadmap sekarang membaca endpoint backend:
   - `GET /roadmaps/published`
   - `POST /roadmaps/student/select`
   - `GET /roadmaps/student/active`
   - `PATCH /roadmaps/student/progress/:id`

3. Progress siswa dikirim ke backend, bukan disimpan lokal di state saja.
4. Detail roadmap mendukung referensi link dan catatan guru.

## Endpoint frontend yang digunakan

### Auth
- `POST /auth/login`

### Siswa
- `GET /siswa/me`
- `PUT /siswa/profil`
- `POST /siswa/spk`

### Roadmap Siswa
- `GET /roadmaps/published`
- `POST /roadmaps/student/select`
- `GET /roadmaps/student/active`
- `PATCH /roadmaps/student/progress/:id`

### Guru/Admin Sekolah
- `GET /guru/workspace`
- `GET /sekolah/approved`
- `POST /guru/pilih-sekolah`
- `POST /guru/ajukan-sekolah`
- `GET /guru/guidance-cases`
- `POST /nilai-siswa/import-excel`
- `GET /guru/jurusan`
- `POST /guru/jurusan`
- `PUT /guru/jurusan/:id`
- `DELETE /guru/jurusan/:id`

### Admin Pusat
- `GET /admin/dashboard`
- `GET /admin/verifikasi`
- `PUT /admin/verifikasi/:id`
- `GET /admin/sekolah`

### Superadmin
- `GET /superadmin/admin`
- `POST /superadmin/admin`
- `PUT /superadmin/admin/:id`
- `DELETE /superadmin/admin/:id`

## Catatan menjalankan

Pastikan `.env.local` frontend mengarah ke backend NestJS:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Jalankan frontend seperti biasa:

```bash
npm install
npm run dev
```

Jika backend memakai global prefix `/api`, maka ubah menjadi:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Catatan untuk tim

Frontend ini masih menyesuaikan bentuk response backend dengan normalizer yang toleran. Jika backend sudah stabil, normalizer dapat dipersempit agar type lebih ketat dan lebih mudah dites.
