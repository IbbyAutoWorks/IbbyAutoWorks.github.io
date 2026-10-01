import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";
import { AdminTabs } from "@/components/admin-tabs";
import { BusinessDashboard } from "@/components/business-dashboard";

export default function AdminBusinessPage() {
  return (
    <AppShell active="admin">
      <AdminOnly label="business stats">
        <AdminTabs />
        <BusinessDashboard />
      </AdminOnly>
    </AppShell>
  );
}
