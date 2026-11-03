const functionUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ibby-feedback` : "";

export type FeedbackKind = "issue" | "feature";

// The function stores it and, when configured, files it as a GitHub issue.
export async function sendFeedback(input: { kind: FeedbackKind; title: string; details: string; contact: string; page: string; website: string }) {
  if (!functionUrl) throw new Error("Feedback isn't available right now. Please email us instead.");
  const response = await fetch(functionUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || "That didn't send. Please try again.");
}
