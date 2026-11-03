import { AppShell } from "@/components/chrome";
import { AdminOnly } from "@/components/auth-gate";
import { AdminTabs } from "@/components/admin-tabs";
import { FeedbackInbox } from "@/components/feedback-inbox";

export default function AdminFeedbackPage() {
  return (
    <AppShell active="admin">
      <AdminOnly label="feedback">
        <AdminTabs />
        <FeedbackInbox />
      </AdminOnly>
    </AppShell>
  );
}
