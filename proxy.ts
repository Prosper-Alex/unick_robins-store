import { NextResponse, type NextRequest } from "next/server";

const accessCookie = "ur-access-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(accessCookie)?.value;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!accessToken || !supabaseUrl || !anonKey) {
    return redirectToLogin(request);
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userResponse.ok) {
    return redirectToLogin(request);
  }

  const user = await userResponse.json() as { id?: string };

  if (!user.id) {
    return redirectToLogin(request);
  }

  const roleResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}&select=role`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!roleResponse.ok) {
    return redirectToLogin(request);
  }

  const roles = await roleResponse.json() as Array<{ role?: string }>;

  if (roles[0]?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
