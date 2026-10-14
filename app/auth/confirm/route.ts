import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeVerifiedClaim } from "@/lib/claims/verification";

const supportedTypes = ["signup", "email", "recovery", "invite", "email_change"] as const;
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") ?? "signup";
  if (tokenHash && supportedTypes.includes(type as typeof supportedTypes[number])) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as typeof supportedTypes[number],
    });
    if (!error) {
      if (type === "recovery") return NextResponse.redirect(`${origin}/auth/reset-password`);
      const claim = await completeVerifiedClaim(supabase);
      if (claim.status === "error") return NextResponse.redirect(`${origin}/auth/login?claim_error=${claim.reason}`);
      return NextResponse.redirect(`${origin}/dashboard?checkout=true`);
    }
  }
  return NextResponse.redirect(`${origin}/auth/login?error=Could+not+verify+email`);
}
