import { AppShell } from "@/components/chrome";
import { ServiceSettings } from "@/components/service-settings";

export default function ServiceSettingsPage() {
  return (
    <AppShell active="service-settings">
      <ServiceSettings />
    </AppShell>
  );
}
