import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppAlertProvider } from "../components/ui/AppAlertProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SkillLens - Career Planning System",
  description: "Sistem pendukung perencanaan karier siswa berbasis web.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07142f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full scroll-smooth">
      <body className={`${jakarta.variable} min-h-full flex flex-col antialiased`}>
        <AppAlertProvider>{children}</AppAlertProvider>
      </body>
    </html>
  );
}