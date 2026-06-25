"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ShieldCheck } from "lucide-react";

import { AuthPanel } from "@/components/auth-panel";
import { isAdminSession } from "@/lib/auth-roles";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session ?? null); setReady(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  return { ready, session };
}

export function AdminOnly({ children, label = "admin workspace" }: { children: React.ReactNode; label?: string }) {
  const { ready, session } = useAuthSession();

  if (!ready) return <section className="panel"><p>Checking access...</p></section>;
  if (!isAdminSession(session)) {
    return (
      <div className="admin-locked-page">
        <section className="panel auth-required-card">
          <div className="panel-title"><div><p className="section-label">Admin sign-in required</p><h2>Sign in as IbbyAdmin to open the {label}.</h2></div><ShieldCheck /></div>
          <p className="legal-note">Customer accounts can see their account/request records only. Admin and service tools unlock only for the IbbyAdmin Supabase Auth user.</p>
        </section>
        <AuthPanel />
      </div>
    );
  }
  return <>{children}</>;
}

export function CustomerOrAdminOnly({ children, label = "customer settings" }: { children: React.ReactNode; label?: string }) {
  const { ready, session } = useAuthSession();

  if (!ready) return <section className="panel"><p>Checking access...</p></section>;
  if (!session && !isAdminSession(session)) {
    return (
      <div className="admin-locked-page">
        <section className="panel auth-required-card">
          <div className="panel-title"><div><p className="section-label">Account sign-in required</p><h2>Sign in to open {label}.</h2></div><ShieldCheck /></div>
          <p className="legal-note">Guest requests can still be submitted from the request page. Saved customer settings unlock only for signed-in customers or IbbyAdmin.</p>
        </section>
        <AuthPanel />
      </div>
    );
  }
  return <>{children}</>;
}
