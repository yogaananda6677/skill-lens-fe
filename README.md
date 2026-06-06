## License

This project is licensed under the MIT License.

Copyright © 2026 VisionaryLens Team.

## Third-Party Libraries

This frontend project uses several open-source libraries:

| Library           | Usage                   | License               |
| ----------------- | ----------------------- | --------------------- |
| Next.js           | Frontend framework      | MIT                   |
| React             | UI library              | MIT                   |
| React DOM         | React renderer          | MIT                   |
| Tailwind CSS      | Styling                 | MIT                   |
| Heroicons React   | Icons                   | MIT                   |
| Onborda           | User guide / onboarding | Check package license |
| Plus Jakarta Sans | Font                    | SIL Open Font License |

Each third-party library follows its own license.

## Requirements

- Node.js 20 LTS or newer
- npm or pnpm
- Active backend API
- Modern browser

## Main Features

- Login and register
- Student dashboard
- Guru BK dashboard
- Admin sekolah dashboard
- Admin pusat dashboard
- Roadmap siswa
- Recommendation result
- Profile validation
- Guidance notification

# 🚀 SkillLens Frontend

Frontend aplikasi **SkillLens** untuk kebutuhan lomba Web Development.
Aplikasi ini digunakan sebagai tampilan utama untuk juri mencoba fitur SkillLens, mulai dari login, dashboard role, pengelolaan data, hingga melihat rekomendasi karier siswa.

---

## 📌 Isi Frontend

Frontend SkillLens berisi beberapa halaman utama:

| Halaman                  | Fungsi                                 |
| ------------------------ | -------------------------------------- |
| Landing Page             | Tampilan awal dan informasi aplikasi   |
| Login                    | Masuk ke sistem sesuai role            |
| Register Admin Sekolah   | Pendaftaran sekolah baru               |
| Dashboard Admin Platform | Verifikasi sekolah                     |
| Dashboard Admin Sekolah  | Kelola data guru, siswa, dan nilai     |
| Dashboard Guru           | Melihat data siswa dan rekomendasi     |
| Dashboard Siswa          | Isi profil dan lihat hasil rekomendasi |

---

## 🧰 Teknologi & Dependency Utama

Project ini menggunakan:

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Axios / Fetch API**
- **JWT Authentication**
- **Node.js**

Pastikan sudah menginstall:

```bash
node -v
npm -v
```

Disarankan menggunakan:

```bash
Node.js >= 18
npm >= 9
```

---

## ⚙️ Cara Install

Clone repository:

```bash
git clone <URL_REPOSITORY_FRONTEND>
```

Masuk ke folder project:

```bash
cd skill-lens-fe
```

Install dependency:

```bash
npm install
```

---

## 🔐 Konfigurasi Environment

Buat file `.env.local` di root project.

Isi dengan:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=SkillLens
```

> Sesuaikan `NEXT_PUBLIC_API_URL` dengan alamat backend yang digunakan.

---

## ▶️ Cara Menjalankan Project

Jalankan frontend:

```bash
npm run dev
```

Buka di browser:

```bash
http://localhost:3000
```

---

## 🏗️ Build Production

Untuk melakukan build:

```bash
npm run build
```

Menjalankan hasil build:

```bash
npm run start
```

---

## 🧪 Alur Coba untuk Juri

Juri dapat mencoba aplikasi dengan urutan berikut:

```text
1. Buka Landing Page
2. Login sesuai role
3. Masuk ke dashboard
4. Coba fitur sesuai role
5. Isi profil siswa
6. Lihat hasil rekomendasi karier
```

---

## 👤 Role Pengguna

| Role           | Akses                                  |
| -------------- | -------------------------------------- |
| Admin Platform | Verifikasi sekolah                     |
| Admin Sekolah  | Kelola guru, siswa, dan nilai          |
| Guru           | Melihat data dan rekomendasi siswa     |
| Siswa          | Mengisi profil dan melihat rekomendasi |

---

## 📂 Struktur Singkat Project

```text
skill-lens-fe/
├── app/
├── components/
├── features/
├── lib/
├── public/
├── .env.local
├── package.json
└── README.md
```

---

## ❗ Catatan

Agar aplikasi berjalan normal, pastikan:

- Backend SkillLens sudah berjalan
- URL API pada `.env.local` sudah benar
- Node.js dan npm sudah terinstall
- Dependency sudah diinstall dengan `npm install`

---

## 👨‍💻 Developer

**Skill**
Project: **SkillLens**
Kategori: **Web Development**

## Developed By

VisionaryLens Team

## Related Repositories

- Frontend: SkillLens Frontend
- Backend: SkillLens Backend
- Recommendation Service: SkillLens SPK Service
