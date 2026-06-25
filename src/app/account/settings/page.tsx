import { CustomerOrAdminOnly } from "@/components/auth-gate";
import { AppShell } from "@/components/chrome";
import { CustomerSettings } from "@/components/customer-settings";

export default function CustomerSettingsPage() {
  return (
    <AppShell active="customer-settings">
      <CustomerOrAdminOnly label="customer settings">
        <CustomerSettings />
      </CustomerOrAdminOnly>
    </AppShell>
  );
}
