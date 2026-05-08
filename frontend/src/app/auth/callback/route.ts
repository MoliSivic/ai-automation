import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_AUTH_DESTINATION = "/dashboard";
const PASSWORD_RESET_DESTINATION = "/reset-password";
const EMAIL_OTP_TYPES = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

type EmailOtpType = (typeof EMAIL_OTP_TYPES)[number];

function isEmailOtpType(type: string | null): type is EmailOtpType {
  return EMAIL_OTP_TYPES.some((allowedType) => allowedType === type);
}

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_AUTH_DESTINATION;
  }

  try {
    const nextUrl = new URL(next, "https://flashgenius.local");
    return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
  } catch {
    return DEFAULT_AUTH_DESTINATION;
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = getSafeNextPath(searchParams.get("next"));

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
    if (!isEmailOtpType(type)) {
      const errorUrl = new URL("/login", origin);
      errorUrl.searchParams.set(
        "error",
        "Invalid verification type. Please request a new email link.",
      );
      return NextResponse.redirect(errorUrl.toString());
    }

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (!error) {
      // For password recovery, redirect to reset-password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}${PASSWORD_RESET_DESTINATION}`);
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
