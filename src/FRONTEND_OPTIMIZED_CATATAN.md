# Catatan Optimasi Frontend SkillLens

## Status Revisi

Versi ini adalah paket gabungan final yang sudah memuat folder `src/app` dan perbaikan arsitektur frontend. Patch sebelumnya hanya memperbaiki folder App Router, sedangkan paket ini menggabungkan router, layout, API client, navigasi role, dan penyesuaian endpoint backend.

## Fokus Perbaikan

1. **App Router lengkap**: `src/app/layout.tsx`, `src/app/page.tsx`, halaman login, register, siswa, roadmap, guru, admin, dan superadmin tersedia.
2. **Sidebar konsisten**: daftar menu dipusatkan di `src/config/navigation.ts`, tidak ditulis berulang di setiap halaman.
3. **Role baru**: frontend mendukung `admin_sekolah` dan mengarahkannya ke ruang kerja sekolah `/guru`.
4. **API client terpusat**: seluruh request memakai `apiFetch` dari `src/lib/axios.ts`, termasuk token Bearer, timeout request, error parser, dan auto-clear sesi saat 401/403.
5. **SPK sesuai backend**: proses rekomendasi memakai endpoint `/siswa/spk`, tidak melakukan double request profil, dan menerima hasil yang disimpan dari backend.
6. **Roadmap sesuai backend**: roadmap diambil dari `/roadmaps/published`, siswa memilih lewat `/roadmaps/student/select`, progress lewat `/roadmaps/student/progress/:id`.
7. **Data dummy roadmap dihapus**: halaman roadmap tidak lagi memakai state lokal sebagai sumber utama.
8. **Mobile sidebar diperbaiki**: menu bawah hanya menampilkan item utama, sedangkan tombol Menu membuka sidebar lengkap.
9. **Struktur lebih bersih**: auth helper, navigation config, API feature, dan layout shell dipisahkan agar kode halaman tidak terlalu berat.

## Endpoint Utama yang Dipakai

```text
POST /auth/login
GET  /siswa/me
PUT  /siswa/profil
POST /siswa/spk
GET  /roadmaps/published
POST /roadmaps/student/select
GET  /roadmaps/student/active
PATCH /roadmaps/student/progress/:id
GET  /guru/workspace
GET  /guru/guidance-cases
POST /nilai-siswa/import-excel
GET  /sekolah/approved
GET  /jurusan
```

## Cara Pasang

Dari root project Next.js:

```bash
unzip skilllens_frontend_final_optimized.zip -d .
npm run dev
```

Pastikan struktur akhirnya:

```text
skilllens/
├── package.json
├── next.config.ts
├── tsconfig.json
└── src/
    ├── app/
    ├── components/
    ├── config/
    ├── features/
    ├── lib/
    └── data/
```

## Environment

Jika backend NestJS berjalan di port 3000:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Jika backend memakai global prefix `/api`, gunakan:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Catatan Evaluasi

Frontend ini sudah diarahkan untuk arsitektur yang lebih matang. Namun build final tetap harus diuji di project utama yang memiliki `package.json`, dependency, dan konfigurasi Tailwind/Next lengkap.
