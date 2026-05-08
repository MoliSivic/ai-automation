import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  // Handle Supabase error params (e.g. expired link, invalid token)
  const error_param = searchParams.get("error");
  const error_description = searchParams.get("error_description");
  if (error_param) {
    const errorUrl = new URL("/login", origin);
    errorUrl.searchParams.set(
      "error",
      error_description || error_param || "Authentication failed.",
    );
    return NextResponse.redirect(errorUrl.toString());
  }

  const supabase = await createClient();

  // Handle OAuth and PKCE callbacks (code-based flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // For password recovery, the `next` param will be `/reset-password`
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Code exchange failed
    const errorUrl = new URL("/login", origin);
    errorUrl.searchParams.set(
      "error",
      error.message || "Code exchange failed. Please try again.",
    );
    return NextResponse.redirect(errorUrl.toString());
  }

  // Handle email confirmation and password reset (token_hash-based flow — legacy/implicit)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "recovery" | "email",
    });

    if (!error) {
      // For password recovery, redirect to reset-password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      // For email confirmation, redirect to dashboard (or next)
      return NextResponse.redirect(`${origin}${next}`);
    }

    // OTP verification failed
    const errorUrl = new URL("/login", origin);
    errorUrl.searchParams.set(
      "error",
      error.message || "Verification failed. The link may have expired.",
    );
    return NextResponse.redirect(errorUrl.toString());
  }

  // No valid params — redirect to login with error
  const errorUrl = new URL("/login", origin);
  errorUrl.searchParams.set(
    "error",
    "Invalid authentication callback. Please try again.",
  );
  return NextResponse.redirect(errorUrl.toString());
}
