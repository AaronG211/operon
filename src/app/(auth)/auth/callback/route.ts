import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Only allow redirects to internal paths (no protocol/host)
const ALLOWED_PREFIXES = ["/dashboard", "/onboarding", "/report", "/chat", "/data", "/weekly-summary"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Validate redirect target — must be a relative path starting with an allowed prefix
  const isValidRedirect =
    next.startsWith("/") &&
    !next.startsWith("//") &&
    ALLOWED_PREFIXES.some((p) => next.startsWith(p));

  const safeNext = isValidRedirect ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
