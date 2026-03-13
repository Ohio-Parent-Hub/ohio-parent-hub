import { NextRequest, NextResponse } from "next/server";

const LEGACY_DETAIL_QUERY_PARAMS = ["context", "returnTo"] as const;

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/daycare/")) {
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

  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/daycare/:path*", "/draft/:path*", "/design-preview/:path*"],
};
