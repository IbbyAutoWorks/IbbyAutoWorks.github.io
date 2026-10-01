import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";
import { AdminTabs } from "@/components/admin-tabs";
import { VehicleImageManager } from "@/components/vehicle-image-manager";

export default function AdminVehiclesPage() {
  return (
    <AppShell active="admin">
      <AdminOnly label="vehicle library">
        <AdminTabs />
        <VehicleImageManager />
      </AdminOnly>
    </AppShell>
  );
}
