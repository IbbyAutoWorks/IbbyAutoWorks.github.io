import { AppShell } from "@/components/chrome";
import { ServicePortal } from "@/components/service-portal";

export default function ServicePage() {
  return (
    <AppShell active="service">
      <ServicePortal />
    </AppShell>
  );
}
