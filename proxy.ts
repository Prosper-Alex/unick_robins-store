import type { NextRequest } from "next/server";
import { proxy as appProxy } from "./src/proxy";

export function proxy(request: NextRequest) {
  return appProxy(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
