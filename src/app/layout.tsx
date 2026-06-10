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
  title: {
    default: "SkillLens - Career Decision Support",
    template: "%s | SkillLens",
  },
  description: "Sistem pendukung perencanaan karier siswa berbasis web.",
icons: {
  icon: [
    {
      url: "/images/logo-skilllens.png",
      type: "image/png",
    },
  ],
  shortcut: "/images/logo-skilllens.png",
  apple: "/images/logo-skilllens.png",
},
  applicationName: "SkillLens",
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
    <html lang="id" data-scroll-behavior="smooth" className="h-full scroll-smooth">
      <body className={`${jakarta.variable} min-h-full flex flex-col antialiased`}>
        <AppAlertProvider>{children}</AppAlertProvider>
      </body>
    </html>
  );
}