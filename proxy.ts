import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const LEGACY_DETAIL_QUERY_PARAMS = ["context", "returnTo"] as const;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // SEO: strip legacy detail query params (?context=...&returnTo=...)
  if (pathname === "/daycare" || pathname.startsWith("/daycare/")) {
    const cleanedUrl = request.nextUrl.clone();
    let removedLegacyParam = false;

    for (const param of LEGACY_DETAIL_QUERY_PARAMS) {
      if (cleanedUrl.searchParams.has(param)) {
        cleanedUrl.searchParams.delete(param);
        removedLegacyParam = true;
      }
    }

    if (removedLegacyParam) {
      return NextResponse.redirect(cleanedUrl, 308);
    }
  }

  // Block draft/preview routes in production
  if (
    process.env.NODE_ENV === "production" &&
    (pathname.startsWith("/draft") || pathname.startsWith("/design-preview"))
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  let response = NextResponse.next({ request });

  // Capture ?promo= URL param into cookie for promo code flow
  const promoCode = request.nextUrl.searchParams.get("promo");

  // Noindex draft/preview routes in dev
  if (pathname.startsWith("/draft") || pathname.startsWith("/design-preview")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  // Refresh the Supabase auth session — required for Server Components
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  // Set promo cookie AFTER Supabase auth refresh (which may reassign response)
  if (promoCode && /^[a-zA-Z0-9_-]+$/.test(promoCode)) {
    response.cookies.set("promo_code", promoCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
