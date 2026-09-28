"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ShieldCheck } from "lucide-react";

import { AuthPanel } from "@/components/auth-panel";
import { fetchStaffRole, type StaffRole } from "@/lib/auth-roles";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export function useAuthRole() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<StaffRole>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setReady(true); return; }
    let cancelled = false;
    async function apply(next: Session | null) {
      const nextRole = await fetchStaffRole(next);
      if (cancelled) return;
      setSession(next);
      setRole(nextRole);
      setReady(true);
    }
    supabase.auth.getSession().then(({ data }) => apply(data.session ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => { void apply(next); });
    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { ready, session, role };
}

function LockedPanel({ title, heading, note }: { title: string; heading: string; note: string }) {
  return (
    <div className="admin-locked-page">
      <section className="panel auth-required-card">
        <div className="panel-title"><div><p className="section-label">{title}</p><h2>{heading}</h2></div><ShieldCheck /></div>
        <p className="legal-note">{note}</p>
      </section>
      <AuthPanel />
    </div>
  );
}

// Owner-only: dashboard, settings, pricing, payments, and staff management.
export function AdminOnly({ children, label = "admin workspace" }: { children: React.ReactNode; label?: string }) {
  const { ready, role } = useAuthRole();

  if (!ready) return <section className="panel"><p>Checking access...</p></section>;
  if (role !== "admin") {
    return (
      <LockedPanel
        title="Owner sign-in required"
        heading={`Sign in as IbbyAdmin to open the ${label}.`}
        note={role === "staff" ? "Technician accounts can open the Service portal but not owner tools." : "Customer accounts can see their account/request records only. Owner tools unlock only for the IbbyAdmin account."}
      />
    );
  }
  return <>{children}</>;
}

// Owner and technicians: the job board and service workflow.
export function StaffOnly({ children, label = "service portal" }: { children: React.ReactNode; label?: string }) {
  const { ready, role } = useAuthRole();

  if (!ready) return <section className="panel"><p>Checking access...</p></section>;
  if (role !== "admin" && role !== "staff") {
    return (
      <LockedPanel
        title="Staff sign-in required"
        heading={`Sign in with a technician or owner account to open the ${label}.`}
        note="Technician access is granted by the owner in Admin settings. Customer accounts can see their own requests on the Account page."
      />
    );
  }
  return <>{children}</>;
}

export function CustomerOrAdminOnly({ children, label = "customer settings" }: { children: React.ReactNode; label?: string }) {
  const { ready, session } = useAuthRole();

  if (!ready) return <section className="panel"><p>Checking access...</p></section>;
  if (!session) {
    return (
      <LockedPanel
        title="Account sign-in required"
        heading={`Sign in to open ${label}.`}
        note="Guest requests can still be submitted from the request page. Saved customer settings unlock only for signed-in customers or IbbyAdmin."
      />
    );
  }
  return <>{children}</>;
}
