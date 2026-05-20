# Catatan Revisi UX Frontend SkillLens

## Fokus perbaikan

1. Web profile memakai slot gambar hero dari `public/images/skilllens-hero.png`.
2. Navbar login dan register diseragamkan dengan navbar web profile melalui `components/layout/PublicNavbar.tsx`.
3. Sidebar dashboard dipusatkan ulang di `DashboardShell` dan `config/navigation.ts` agar role superadmin, admin, admin_sekolah, dan guru tidak bentrok.
4. Icon ditambah dan dirapikan pada `components/ui/icons.tsx`.
5. Halaman siswa memakai top navbar melalui `StudentTopNav`, bukan sidebar.
6. Halaman guru difokuskan untuk melihat progress roadmap siswa dan memberi catatan bimbingan.
7. Import Excel admin sekolah memakai `uploadWithProgress()` agar ada progress 1-100 dan estimasi upload.
8. Bahasa UI dibuat lebih natural dan sesuai role.
9. Setelah rekomendasi siswa berhasil diproses, muncul modal notifikasi `FeedbackModal`.

## Gambar hero web profile

Letakkan gambar yang sudah disiapkan ke path:

```text
public/images/skilllens-hero.png
```

Jika nama file berbeda, ubah konstanta `HERO_IMAGE` di `src/app/page.tsx`.

## Endpoint yang dipakai

- `POST /auth/login`
- `POST /auth/register-admin-sekolah`
- `POST /sekolah`
- `POST /auth/register-guru`
- `POST /siswa/import`
- `GET /siswa/me`
- `PUT /siswa/profil`
- `POST /siswa/spk`
- `GET /guru/guidance-cases`
- `GET /roadmaps/guru/siswa/:idSiswa`
- `POST /roadmaps/guru/step-notes`
- `GET /roadmaps/student/active`
- `PATCH /roadmaps/student/progress/:id`

## Catatan upload progress

Browser hanya bisa menghitung progress upload file secara nyata. Setelah file selesai upload, frontend menampilkan fase `Memproses data` sampai backend mengembalikan response. Jika ingin progress pemrosesan database benar-benar real-time, backend perlu menyediakan job status endpoint atau WebSocket/SSE.
