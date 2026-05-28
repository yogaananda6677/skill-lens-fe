"use client";

import { useEffect, useState } from "react";
import { Icon } from "../../../components/ui/icons";

const messages = [
  "Menyiapkan ruang belajarmu...",
  "Membaca data siswa...",
  "Dashboard siap digunakan...",
];

export function StudentPreparingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 550);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-[#061329] text-white">
      <div className="grid min-h-screen place-items-center px-5">
        <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl shadow-blue-950/30 backdrop-blur-xl">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-blue-500/25 blur-3xl" />

          <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white/10 text-cyan-200 ring-1 ring-white/10">
            <Icon name="sparkles" className="h-7 w-7 animate-pulse" />
          </div>

          <p className="relative mt-6 text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-300">
            SkillLens sedang memproses
          </p>

          <h1 className="relative mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">
            {messages[index]}
          </h1>

          <p className="relative mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-sky-100/70">
            Sistem hanya menyiapkan data awal sebentar. Setelah itu perpindahan halaman dibuat lebih ringan.
          </p>

          <div className="relative mt-7 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-300 to-blue-500" />
          </div>
        </div>
      </div>
    </main>
  );
}
