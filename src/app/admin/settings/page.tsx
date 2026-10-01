import { AdminSettings } from "@/components/admin-settings";
import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";
import { AdminTabs } from "@/components/admin-tabs";

export default function AdminSettingsPage() {
  return (
    <AppShell active="settings">
      <AdminOnly label="admin settings">
        <AdminTabs />
        <AdminSettings />
      </AdminOnly>
    </AppShell>
  );
}
