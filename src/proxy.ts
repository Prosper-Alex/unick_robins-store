import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const accessCookie = "ur-access-token";
const refreshCookie = "ur-refresh-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
      response.cookies.set(accessCookie, data.session.access_token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: data.session.expires_in,
      });
      
      response.cookies.set(refreshCookie, data.session.refresh_token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    } else {
      // Refresh failed, clear session
      response.cookies.delete(accessCookie);
      response.cookies.delete(refreshCookie);
    }
  }

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    if (!isValidSession || !currentAccessToken) {
      return redirectToLogin(request, response);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(currentAccessToken);

    if (!user) {
      return redirectToLogin(request, response);
    }

    const roleResponse = await fetch(`${url}/rest/v1/users?id=eq.${user.id}&select=role`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${currentAccessToken}`,
      },
    });

    if (!roleResponse.ok) {
      return redirectToLogin(request, response);
    }

    const roles = await roleResponse.json() as Array<{ role?: string }>;

    if (roles[0]?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

function redirectToLogin(request: NextRequest, response: NextResponse) {
  const url = new URL("/account/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  
  // Clone the cookies from the original response if any were set
  const redirectResponse = NextResponse.redirect(url);
  
  // Apply any deleted/set cookies to the redirect
  const setCookies = response.headers.get("Set-Cookie");
  if (setCookies) {
    redirectResponse.headers.set("Set-Cookie", setCookies);
  }
  
  return redirectResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
