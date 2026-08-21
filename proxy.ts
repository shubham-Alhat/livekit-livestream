import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  console.log("Every request passes through here:", request.nextUrl.pathname);
  const hasCookie = request.cookies.has("accessToken");
  if (!hasCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/live/:path*", "/dashboard/:path*", "/"],
};
