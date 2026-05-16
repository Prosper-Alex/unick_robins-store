import type { NextRequest } from "next/server";
import { proxy as appProxy } from "./src/proxy";

export function proxy(request: NextRequest) {
  return appProxy(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
