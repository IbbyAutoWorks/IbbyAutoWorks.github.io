import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";
import { AdminTabs } from "@/components/admin-tabs";
import { TaxCenter } from "@/components/tax-center";

export default function AdminTaxesPage() {
  return (
    <AppShell active="admin">
      <AdminOnly label="taxes and books">
        <AdminTabs />
        <TaxCenter />
      </AdminOnly>
    </AppShell>
  );
}
