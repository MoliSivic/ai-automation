"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";

const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export function AuthInitializer() {
  const initialize = useAppStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Listen for Supabase auth state changes (real mode only)
  useEffect(() => {
    if (IS_MOCK) return;

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Re-initialize to pick up the new session (e.g. after email verification or OAuth)
        initialize();
      } else if (event === "SIGNED_OUT") {
        // State is already cleared by the logout() call in the page handler.
        // No additional redirect needed here — the page handler does window.location.href.
      } else if (event === "TOKEN_REFRESHED") {
        // Session token was refreshed — no action needed, middleware handles cookies
      } else if (event === "PASSWORD_RECOVERY") {
        // User arrived via a password recovery link
        // The reset-password page handles this flow
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize]);

  return null;
}
