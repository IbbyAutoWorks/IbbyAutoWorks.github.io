import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";
import { ServicePortal } from "@/components/service-portal";

export default function ServicePage() {
  return (
    <AppShell active="service">
      <AdminOnly label="service portal">
        <ServicePortal />
      </AdminOnly>
    </AppShell>
  );
}
