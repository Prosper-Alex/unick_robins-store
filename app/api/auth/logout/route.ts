import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookieNames } from "@/src/lib/supabase-server";

export async function POST(request: Request) {
  await clearAuthCookies();

  if (expectsDocument(request)) {
    return NextResponse.redirect(new URL("/account/logout", request.url), 303);
  }

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  await clearAuthCookies();
  return NextResponse.redirect(new URL("/account/logout", request.url));
}

async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(authCookieNames.access);
  cookieStore.delete(authCookieNames.refresh);
}

function expectsDocument(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  const destination = request.headers.get("sec-fetch-dest") ?? "";

  return destination === "document" || accept.includes("text/html");
}
