import { AdminDashboard } from "@/components/admin-dashboard";
import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";

export default function AdminPage() {
  return (
    <AppShell active="admin">
      <AdminOnly label="admin dashboard">
        <AdminDashboard />
      </AdminOnly>
    </AppShell>
  );
}
