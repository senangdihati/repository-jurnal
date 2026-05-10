import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: prof } = await supabase
      .from("profiles")
      .select("verification_status")
      .eq("id", user.id)
      .maybeSingle();

    const status = prof?.verification_status ?? "pending";
    if (status !== "approved") {
      const pendingUrl = request.nextUrl.clone();
      pendingUrl.pathname = "/pending-verification";
      if (status === "rejected") pendingUrl.searchParams.set("status", "rejected");
      return NextResponse.redirect(pendingUrl);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: prof } = await supabase
      .from("profiles")
      .select("role, verification_status")
      .eq("id", user.id)
      .maybeSingle();

    if (prof?.role !== "admin" || prof?.verification_status !== "approved") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname === "/pending-verification") {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", "/pending-verification");
      return NextResponse.redirect(loginUrl);
    }

    const { data: prof } = await supabase
      .from("profiles")
      .select("verification_status")
      .eq("id", user.id)
      .maybeSingle();

    if ((prof?.verification_status ?? "pending") === "approved") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/pending-verification"],
};

