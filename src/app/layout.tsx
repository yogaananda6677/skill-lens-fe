import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SkillLens - Career Planning System",
  description: "Sistem pendukung perencanaan karier siswa berbasis web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full scroll-smooth">
      <body className={`${poppins.variable} min-h-full flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
