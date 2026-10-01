import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";
import { AdminTabs } from "@/components/admin-tabs";
import { ManualBook } from "@/components/manual-book";
import { ownerManual } from "@/lib/manual-content";

export default function AdminManualPage() {
  return (
    <AppShell active="admin">
      <AdminOnly label="owner manual">
        <AdminTabs />
        <ManualBook
          title="Owner manual"
          intro="How every part of the app works, when to use it, and where to find it. Search for anything, or jump in from the contents."
          chapters={ownerManual}
        />
      </AdminOnly>
    </AppShell>
  );
}
