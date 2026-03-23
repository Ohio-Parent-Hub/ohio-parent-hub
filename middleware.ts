import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const promoCode = request.nextUrl.searchParams.get("promo");

  if (promoCode && /^[a-zA-Z0-9_-]+$/.test(promoCode)) {
    const response = NextResponse.next();
    response.cookies.set("promo_code", promoCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
