import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";
import { ServiceSettings } from "@/components/service-settings";

export default function ServiceSettingsPage() {
  return (
    <AppShell active="service-settings">
      <AdminOnly label="service settings">
        <ServiceSettings />
      </AdminOnly>
    </AppShell>
  );
}
