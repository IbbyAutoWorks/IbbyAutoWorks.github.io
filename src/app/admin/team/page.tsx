import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";
import { AdminTabs } from "@/components/admin-tabs";
import { StaffManager } from "@/components/staff-manager";

export default function AdminTeamPage() {
  return (
    <AppShell active="admin">
      <AdminOnly label="team">
        <AdminTabs />
        <StaffManager />
      </AdminOnly>
    </AppShell>
  );
}
