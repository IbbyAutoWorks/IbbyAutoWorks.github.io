import { AdminDashboard } from "@/components/admin-dashboard";
import { AppShell } from "@/components/chrome";

export default function AdminPage() {
  return (
    <AppShell active="admin">
      <AdminDashboard />
    </AppShell>
  );
}
