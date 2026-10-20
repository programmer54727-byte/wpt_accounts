import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isProtectedApp =
    path.startsWith("/dashboard") ||
    path.startsWith("/invoices") ||
    path.startsWith("/bills") ||
    path.startsWith("/payments") ||
    path.startsWith("/receipts") ||
    path.startsWith("/journals") ||
    path.startsWith("/customers") ||
    path.startsWith("/vendors") ||
    path.startsWith("/ledgers") ||
    path.startsWith("/reports") ||
    path.startsWith("/settings");

  const isCompanyFlow =
    path.startsWith("/onboarding") || path.startsWith("/select-company");

  const isAuthPage =
    path.startsWith("/login") || path.startsWith("/register");

  if ((isProtectedApp || isCompanyFlow) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/select-company";
    return NextResponse.redirect(url);
  }

  if (isProtectedApp && user) {
    const { count } = await supabase
      .from("company_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!count || count === 0) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
