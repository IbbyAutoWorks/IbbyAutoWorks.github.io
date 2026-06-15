"use client";

import { useEffect, useState } from "react";
import { KeyRound, LogOut, UserPlus } from "lucide-react";

import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client";
import { loginIdentifierToEmail } from "@/lib/auth-roles";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Checking account session...");
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setStatus("Cloud accounts are not configured in this build yet.");
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSignedInEmail(data.session?.user.email ?? null);
      setStatus(data.session?.user.email ? "Signed in and ready for cloud sync." : "Sign in to sync requests and records to Ibby cloud storage.");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedInEmail(session?.user.email ?? null);
      setStatus(session?.user.email ? "Signed in and ready for cloud sync." : "Signed out. Local prototype records stay in this browser.");
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signUp() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setStatus("Creating account...");
    const authEmail = loginIdentifierToEmail(email);
    const { error } = await supabase.auth.signUp({ email: authEmail, password, options: { data: { display_name: authEmail.split("@")[0] } } });
    setStatus(error ? error.message : "Signup started. Check email if confirmation is required, then sign in.");
  }

  async function signIn() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setStatus("Signing in...");
    const { error } = await supabase.auth.signInWithPassword({ email: loginIdentifierToEmail(email), password });
    setStatus(error ? error.message : "Signed in. Future requests can sync to Supabase.");
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <section className="panel auth-panel">
      <div className="panel-title">
        <div>
          <p className="section-label">Cloud account</p>
          <h2>{signedInEmail ? `Signed in as ${signedInEmail}` : "Sign in or create an account"}</h2>
        </div>
        <KeyRound />
      </div>
      <p>{status}</p>
      {!isSupabaseConfigured() ? null : signedInEmail ? (
        <button className="secondary-button" onClick={signOut}><LogOut size={16} /> Sign out</button>
      ) : (
        <div className="customer-edit-grid auth-grid">
          <label><span>Email or admin username</span><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com or IbbyAdmin" /></label>
          <label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8+ characters" /></label>
          <div className="hero-actions">
            <button className="primary-button" onClick={signIn}><KeyRound size={16} /> Sign in</button>
            <button className="secondary-button" onClick={signUp}><UserPlus size={16} /> Create account</button>
          </div>
        </div>
      )}
    </section>
  );
}
