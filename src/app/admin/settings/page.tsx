import { AdminSettings } from "@/components/admin-settings";
import { AppShell } from "@/components/chrome";

export default function AdminSettingsPage() {
  return (
    <AppShell active="settings">
      <AdminSettings />
    </AppShell>
  );
}
