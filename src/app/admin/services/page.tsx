import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";
import { AdminTabs } from "@/components/admin-tabs";
import { BusinessServicesManager } from "@/components/business-services-manager";

export default function AdminServicesPage() {
  return (
    <AppShell active="admin">
      <AdminOnly label="services and accounts">
        <AdminTabs />
        <BusinessServicesManager />
      </AdminOnly>
    </AppShell>
  );
}
