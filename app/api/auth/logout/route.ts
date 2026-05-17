import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/src/lib/auth-session";
import { authCookieNames, getAuthenticatedSupabaseServerClient } from "@/src/lib/supabase-server";

export async function POST(request: Request) {
  await signOutAndClear();

  if (expectsDocument(request)) {
    return NextResponse.redirect(new URL("/account/logout", request.url), 303);
  }

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  await signOutAndClear();
  return NextResponse.redirect(new URL("/account/logout", request.url));
}

async function signOutAndClear() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(authCookieNames.access)?.value;
  const supabase = accessToken ? getAuthenticatedSupabaseServerClient(accessToken) : null;

  if (supabase && accessToken) {
    await supabase.auth.signOut({ scope: "local" });
  }

  clearAuthCookies(cookieStore);
}

function expectsDocument(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  const destination = request.headers.get("sec-fetch-dest") ?? "";

  return destination === "document" || accept.includes("text/html");
}
