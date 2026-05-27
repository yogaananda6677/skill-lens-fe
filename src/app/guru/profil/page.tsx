"use client";

import { DashboardShell } from "../../../components/layout/DashboardShell";
import { UserProfilePanel } from "../../../components/profile/UserProfilePanel";
import { guruNav } from "../../../config/navigation";

export default function GuruProfilePage() {
  return (
    <DashboardShell
      requiredRole="guru"
      activeKey="profil"
      navItems={guruNav}
      title="Profil Guru BK"
      subtitle="Kelola data diri dan ubah password akun guru."
      onNavigate={() => {}}
      rightSlot={null}
    >
      <UserProfilePanel
        title="Profil Guru BK"
        subtitle="Kelola informasi akun Guru BK dan keamanan password dengan OTP."
      />
    </DashboardShell>
  );
}