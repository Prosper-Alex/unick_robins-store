import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  getAuthUser,
  getUserForAccessToken,
  refreshSession,
  setAuthCookies,
} from "@/src/lib/auth-session";
import { authCookieNames } from "@/src/lib/supabase-server";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(authCookieNames.access)?.value ?? null;
  const refreshToken = cookieStore.get(authCookieNames.refresh)?.value ?? null;

  if (accessToken) {
    const user = await getUserForAccessToken(accessToken);

    if (user) {
      return NextResponse.json({
        authenticated: true,
        user: await getAuthUser(user, accessToken),
      });
    }
  }

  if (!refreshToken) {
    clearAuthCookies(cookieStore);
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const refreshed = await refreshSession(refreshToken);

  if (!refreshed) {
    clearAuthCookies(cookieStore);
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  setAuthCookies(cookieStore, refreshed.session);

  return NextResponse.json({
    authenticated: true,
    user: await getAuthUser(refreshed.user, refreshed.session.access_token),
  });
}
