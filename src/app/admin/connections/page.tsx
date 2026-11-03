import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";
import { AdminTabs } from "@/components/admin-tabs";
import { ConnectionsPanel } from "@/components/connections-panel";

export default function AdminConnectionsPage() {
  return (
    <AppShell active="admin">
      <AdminOnly label="connections">
        <AdminTabs />
        <ConnectionsPanel />
      </AdminOnly>
    </AppShell>
  );
}
