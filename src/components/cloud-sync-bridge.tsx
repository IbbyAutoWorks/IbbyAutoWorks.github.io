"use client";

import { useEffect } from "react";

import { subscribeToCloudWorkOrders } from "@/lib/cloud-sync";
import { mergeCloudWorkOrders, syncWorkOrdersWithCloud } from "@/lib/local-store";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

// Keeps this browser's work-order board in step with the shared cloud board:
// full pull on load, sign-in, tab focus, and every minute; live row changes in between.
export function CloudSyncBridge() {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let unsubscribe = subscribeToCloudWorkOrders((order) => mergeCloudWorkOrders([order]));
    const pull = () => { void syncWorkOrdersWithCloud(); };
    pull();

    const { data: auth } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") return;
      // Re-open the live channel under the new session so row-level access matches.
      unsubscribe();
      unsubscribe = subscribeToCloudWorkOrders((order) => mergeCloudWorkOrders([order]));
      pull();
    });
    const onVisible = () => { if (document.visibilityState === "visible") pull(); };
    document.addEventListener("visibilitychange", onVisible);
    const interval = window.setInterval(pull, 60_000);

    return () => {
      unsubscribe();
      auth.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
