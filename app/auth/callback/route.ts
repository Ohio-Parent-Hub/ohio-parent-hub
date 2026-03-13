import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard?checkout=true";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const programNumber = user.user_metadata?.program_number;
        if (programNumber) {
          // Create/update profile row on first confirmation
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

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/auth/login?error=Could+not+verify+email`
  );
}
