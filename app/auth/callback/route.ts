import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeVerifiedClaim, safeNextPath } from "@/lib/claims/verification";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const claim = await completeVerifiedClaim(supabase);
      if (claim.status === "error") {
        return NextResponse.redirect(`${origin}/auth/login?claim_error=${claim.reason}`);
      }
      return NextResponse.redirect(`${origin}${safeNextPath(searchParams.get("next"))}`);
    }
  }
  return NextResponse.redirect(`${origin}/auth/login?error=Could+not+verify+email`);
}
