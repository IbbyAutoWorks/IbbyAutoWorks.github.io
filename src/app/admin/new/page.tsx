import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";
import { AdminTabs } from "@/components/admin-tabs";
import { RequestWorkflow } from "@/components/request-workflow";

export default function AdminNewWorkOrderPage() {
  return (
    <AppShell active="admin">
      <AdminOnly label="new work order">
        <AdminTabs />
        <RequestWorkflow mode="admin" />
      </AdminOnly>
    </AppShell>
  );
}
