import { AppShell } from "@/components/chrome";
import { StaffOnly } from "@/components/auth-gate";
import { ManualBook } from "@/components/manual-book";
import { techManual } from "@/lib/manual-content";

export default function TechManualPage() {
  return (
    <AppShell active="service">
      <StaffOnly label="technician manual">
        <ManualBook
          title="Technician manual"
          intro="The job workflow step by step, plus how to find specs, read trouble codes, scan VINs, order parts and take payment."
          chapters={techManual}
        />
      </StaffOnly>
    </AppShell>
  );
}
