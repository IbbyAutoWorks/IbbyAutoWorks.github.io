import { AppShell } from "@/components/chrome";
import { FeedbackForm } from "@/components/feedback-form";

export default function FeedbackPage() {
  return (
    <AppShell active="home">
      <div className="manual-book">
        <FeedbackForm />
      </div>
    </AppShell>
  );
}
