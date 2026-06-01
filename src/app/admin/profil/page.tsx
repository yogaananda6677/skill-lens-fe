"use client";

import { DashboardShell } from "../../../components/layout/DashboardShell";
import { UserProfilePanel } from "../../../components/profile/UserProfilePanel";
import { adminNav } from "../../../config/navigation";

export default function AdminProfilePage() {
  return (
    <DashboardShell
      requiredRole={["admin", "superadmin"]}
      activeKey="profil"
      navItems={adminNav}
      title="Profil Admin Platform"
      subtitle="Kelola data diri dan keamanan akun admin."
      onNavigate={() => {}}
      rightSlot={null}
    >
      <UserProfilePanel
        title="Profil Admin Platform"
        subtitle="Kelola informasi akun admin dan ubah password menggunakan kode OTP."
      />
    </DashboardShell>
  );
}
