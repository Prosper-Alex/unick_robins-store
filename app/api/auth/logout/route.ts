import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookieNames } from "@/src/lib/supabase-server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(authCookieNames.access);
  cookieStore.delete(authCookieNames.refresh);

  return NextResponse.json({ ok: true });
}
