import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";
import { RequestWorkflow } from "@/components/request-workflow";

export default function AdminNewWorkOrderPage() {
  return (
    <AppShell active="admin">
      <AdminOnly label="new work order">
        <RequestWorkflow mode="admin" />
      </AdminOnly>
    </AppShell>
  );
}
