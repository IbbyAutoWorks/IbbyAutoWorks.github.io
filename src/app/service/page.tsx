import { AppShell } from "@/components/chrome";
import { StaffOnly } from "@/components/auth-gate";
import { ServicePortal } from "@/components/service-portal";

export default function ServicePage() {
  return (
    <AppShell active="service">
      <StaffOnly label="service portal">
        <ServicePortal />
      </StaffOnly>
    </AppShell>
  );
}
