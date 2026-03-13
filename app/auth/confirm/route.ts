import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "signup") as
    | "signup"
    | "email"
    | "recovery"
    | "invite"
    | "email_change";

  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      // Password recovery — redirect to set new password
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const programNumber = user.user_metadata?.program_number;
        if (programNumber) {
          await supabase.from("profiles").upsert(
            {
              id: user.id,
              email: user.email!,
              program_number: programNumber,
              verified: true,
            },
            { onConflict: "id" }
          );
        }
      }

      return NextResponse.redirect(`${origin}/dashboard?checkout=true`);
    }
  }

  return NextResponse.redirect(
    `${origin}/auth/login?error=Could+not+verify+email`
  );
}
