import { AppShell } from "@/components/chrome";
import { CustomerAccount } from "@/components/customer-account";

export default function AccountPage() {
  return (
    <AppShell active="account">
      <CustomerAccount />
    </AppShell>
  );
}
