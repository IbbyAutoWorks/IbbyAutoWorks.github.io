import { AppShell } from "@/components/chrome";
import { StaffOnly } from "@/components/auth-gate";
import { ServiceSettings } from "@/components/service-settings";

export default function ServiceSettingsPage() {
  return (
    <AppShell active="service-settings">
      <StaffOnly label="service settings">
        <ServiceSettings />
      </StaffOnly>
    </AppShell>
  );
}
