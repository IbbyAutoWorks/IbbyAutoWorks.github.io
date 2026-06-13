import { AppShell } from "@/components/chrome";
import { RequestWorkflow } from "@/components/request-workflow";

export default function AdminNewWorkOrderPage() {
  return (
    <AppShell active="admin">
      <RequestWorkflow mode="admin" />
    </AppShell>
  );
}
