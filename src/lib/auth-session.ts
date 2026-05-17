import type { Session, User } from "@supabase/supabase-js";
import {
  authCookieNames,
  getAuthenticatedSupabaseServerClient,
  getSupabaseAdminClient,
  getSupabaseServerClient,
} from "@/src/lib/supabase-server";

type CookieWriter = {
  set: (name: string, value: string, options: Record<string, unknown>) => void;
  delete: (name: string) => void;
};

export type AuthUser = {
  id: string;
  email: string | null;
  role: string;
};

export function getAuthCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function setAuthCookies(cookieStore: CookieWriter, session: Session) {
  cookieStore.set(
    authCookieNames.access,
    session.access_token,
    getAuthCookieOptions(session.expires_in),
  );
  cookieStore.set(
    authCookieNames.refresh,
    session.refresh_token,
    getAuthCookieOptions(60 * 60 * 24 * 30),
  );
}

export function clearAuthCookies(cookieStore: CookieWriter) {
  cookieStore.delete(authCookieNames.access);
  cookieStore.delete(authCookieNames.refresh);
}

export async function refreshSession(refreshToken: string) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) {
    return null;
  }

  return { session: data.session, user: data.user };
}

export async function getUserForAccessToken(accessToken: string) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return user;
}

export function getAuthenticatedClient(accessToken: string) {
  return getAuthenticatedSupabaseServerClient(accessToken);
}

export async function getAuthUser(user: User, accessToken?: string): Promise<AuthUser> {
  const email = user.email?.trim().toLowerCase() ?? null;
  const adminSupabase = getSupabaseAdminClient();
  const roleClient = adminSupabase ?? (accessToken ? getAuthenticatedClient(accessToken) : null);
  let role = "customer";

  if (roleClient) {
    const { data } = await roleClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    role = (data?.role as string | undefined) ?? role;
  }

  return {
    id: user.id,
    email,
    role,
  };
}
