"use client";

import { useEffect, useState } from "react";
import { UserPlus, Users, UserX } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase-client";

type StaffRow = { user_id: string; email: string; role: "admin" | "staff"; active: boolean; created_at: string };

// Owner-only: grant or remove technician access. Techs create their own account
// on the Account page first; the owner then adds that email here.
export function StaffManager() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return setStatus("Supabase is not configured.");
    const { data, error } = await supabase.rpc("list_staff");
    if (error) return setStatus(error.message);
    setStaff((data ?? []) as StaffRow[]);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function setRole(targetEmail: string, makeStaff: boolean) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !targetEmail.trim()) return;
    setBusy(true);
    const { error } = await supabase.rpc("set_staff_role", { target_email: targetEmail.trim(), make_staff: makeStaff });
    setBusy(false);
    if (error) return setStatus(error.message);
    setStatus(makeStaff ? `${targetEmail.trim()} can now open the Service portal.` : `Removed technician access for ${targetEmail}.`);
    if (makeStaff) setEmail("");
    await refresh();
  }

  return (
    <div className="panel">
      <div className="panel-title">
        <div>
          <p className="section-label">Team</p>
          <h2>Technicians</h2>
        </div>
        <Users />
      </div>
      <p className="legal-note">
        Technicians see the shared job board and Service portal, but not pricing, payments, expenses, or settings.
        Have the technician create an account on the Account page, then add their email here.
      </p>
      <div className="supply-custom-row">
        <label className="wide-field">
          <span>Technician email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tech@example.com" />
        </label>
        <button className="primary-button" disabled={busy || !email.trim()} onClick={() => setRole(email, true)}>
          <UserPlus size={16} /> Add technician
        </button>
      </div>
      <div className="part-request-list">
        {staff.map((member) => (
          <div className="part-request-row" key={member.user_id}>
            <span>
              <strong>{member.email}</strong> - {member.role === "admin" ? "Owner" : "Technician"}{member.active ? "" : " (inactive)"}
            </span>
            {member.role === "staff" ? (
              <button className="secondary-button" disabled={busy} onClick={() => setRole(member.email, false)}>
                <UserX size={15} /> Remove
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {status ? <p className="legal-note">{status}</p> : null}
    </div>
  );
}
