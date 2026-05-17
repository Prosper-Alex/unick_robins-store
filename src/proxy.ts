import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const accessCookie = "ur-access-token";
const refreshCookie = "ur-refresh-token";
const protectedRoutes = ["/account/dashboard", "/account/orders", "/account/update-password", "/admin", "/checkout", "/wishlist"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isAuthRoute = pathname === "/account/login";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(accessCookie)?.value;
  const refreshToken = request.cookies.get(refreshCookie)?.value;

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let response = NextResponse.next();
  let currentAccessToken = accessToken;
  let isValidSession = false;

  if (accessToken) {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!error && user) {
      isValidSession = true;
    }
  }

  // Attempt refresh if access token is invalid but refresh token exists
  if (!isValidSession && refreshToken) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (!error && data.session) {
      currentAccessToken = data.session.access_token;
      isValidSession = true;

      const requestHeaders = new Headers(request.headers);
      request.cookies.set(accessCookie, data.session.access_token);
      request.cookies.set(refreshCookie, data.session.refresh_token);
      requestHeaders.set("cookie", request.cookies.toString());
      response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
      // Update cookies
      response.cookies.set(accessCookie, data.session.access_token, getCookieOptions(data.session.expires_in));
      response.cookies.set(refreshCookie, data.session.refresh_token, getCookieOptions(60 * 60 * 24 * 30));
    } else {
      // Refresh failed, clear session
      response.cookies.delete(accessCookie);
      response.cookies.delete(refreshCookie);
    }
  }

  if (isAuthRoute && isValidSession) {
    return redirectWithPendingCookies(new URL("/account/dashboard", request.url), response);
  }

  if (isProtectedRoute) {
    if (!isValidSession || !currentAccessToken) {
      return redirectToLogin(request, response);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(currentAccessToken);

    if (!user) {
      return redirectToLogin(request, response);
    }

    const roleKey = serviceRoleKey ?? anonKey;
    const roleResponse = await fetch(`${url}/rest/v1/users?id=eq.${user.id}&select=role`, {
      headers: {
        apikey: roleKey,
        Authorization: `Bearer ${serviceRoleKey ? roleKey : currentAccessToken}`,
      },
    });

    if (!roleResponse.ok) {
      return redirectToLogin(request, response);
    }

    const roles = await roleResponse.json() as Array<{ role?: string }>;

    if (pathname.startsWith("/admin") && roles[0]?.role !== "admin") {
      return redirectWithPendingCookies(new URL("/", request.url), response);
    }
  }

  return response;
}

function redirectToLogin(request: NextRequest, response: NextResponse) {
  const url = new URL("/account/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return redirectWithPendingCookies(url, response);
}

function redirectWithPendingCookies(url: URL, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  const setCookies = response.headers.get("Set-Cookie");

  if (setCookies) {
    redirectResponse.headers.set("Set-Cookie", setCookies);
  }

  return redirectResponse;
}

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export const config = {
  matcher: [
    "/account/login",
    "/account/dashboard/:path*",
    "/account/orders/:path*",
    "/account/update-password",
    "/admin/:path*",
    "/checkout",
    "/wishlist/:path*",
  ],
};
