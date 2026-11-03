import { getSupabaseBrowserClient } from "@/lib/supabase-client";

const functionUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ibby-integrations` : "";

async function call<T>(body: Record<string, unknown>): Promise<T> {
  if (!functionUrl) throw new Error("Connections aren't available in this copy of the app.");
  const { data } = await getSupabaseBrowserClient()!.auth.getSession();
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify(body)
  });
  const result = await response.json().catch(() => ({}));
  if (result.ok === false && !result.needsSetup) throw new Error(result.error || "That didn't work. Please try again.");
  return result as T;
}

export type ConnectionStatus = {
  saved: { name: string; updatedAt: string }[];
  email: { queued: number; sent: number; failed: number; lastFailure: string; connectionError: string };
  specFill?: { waiting: number; done: number; values: number; endsOn: string };
  usage?: { id: string; name: string; used: number; limit: number | null; stopsAt: number | null; unit: string; period: string; note: string }[];
};

export const connectionStatus = () => call<ConnectionStatus>({ action: "status" });
export const saveConnection = (name: string, value: string) => call({ action: "save", name, value });
export const sendTestEmail = () => call<{ sentTo: string }>({ action: "test_email" });

export type SpecAnswer = { value: string; quote: string; url: string; title: string; appliesTo?: string };

export const lookupSpec = (vehicle: string, question: string) =>
  call<{ ok: boolean; needsSetup?: boolean; error?: string; answers?: SpecAnswer[] }>({ action: "lookup", vehicle, question });
