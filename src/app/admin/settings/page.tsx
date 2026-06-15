import { AdminSettings } from "@/components/admin-settings";
import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";

export default function AdminSettingsPage() {
  return (
    <AppShell active="settings">
      <AdminOnly label="admin settings">
        <AdminSettings />
      </AdminOnly>
    </AppShell>
  );
}
