import { AppShell } from "@/components/chrome";
import { RequestWorkflow } from "@/components/request-workflow";

export default function RequestPage() {
  return (
    <AppShell active="request">
      <RequestWorkflow />
    </AppShell>
  );
}
