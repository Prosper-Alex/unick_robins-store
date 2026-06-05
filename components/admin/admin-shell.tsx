"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useLinkStatus } from "next/link";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Loader2,
  LogOut,
  ReceiptText,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNavToggle } from "@/components/shared/mobile-nav-toggle";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const mobileLinks = items.map((item) => {
    const Icon = item.icon;
    return {
      href: item.href,
      label: item.label,
      icon: <Icon className="size-4" />,
      exact: item.exact,
    };
  });
  const activeHref = getActiveAdminHref(pathname);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/account/login");
  }

  return (
    <div className="min-h-screen bg-[#13091d] text-[#f8f3e7] lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-white/10 bg-[#1a0824] px-5 py-6 shadow-2xl shadow-black/30 lg:sticky lg:top-0 lg:flex lg:flex-col">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="relative size-9 overflow-hidden rounded-full bg-[#f6e7b7] ring-1 ring-[#d6b25e]/50">
            <Image
              src="/favicon.jpg"
              alt=""
              fill
              sizes="36px"
              className="object-cover"
            />
          </span>
          <span className="text-lg font-semibold text-white">Unick Admin</span>
        </Link>
        <div className="mt-6 rounded-2xl border border-[#d6b25e]/20 bg-white/6 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d6b25e]">
            Control room
          </p>
          <p className="mt-2 text-sm leading-5 text-violet-100/80">
            Catalog, orders, and customer operations.
          </p>
        </div>
        <nav className="mt-10 grid gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-[#d6b25e] text-[#24102f] shadow-lg shadow-black/20"
                    : "text-violet-100/70 hover:bg-white/8 hover:text-white"
                }`}>
                <Icon className="size-4" />
                <span className="min-w-0 flex-1">{item.label}</span>
                <AdminLinkPendingIndicator />
              </Link>
            );
          })}
        </nav>
        <Button
          variant="outline"
          className="mt-auto border-white/15 bg-white/6 text-white hover:bg-white/10 hover:text-white"
          onClick={logout}>
          <LogOut /> Logout
        </Button>
      </aside>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#1a0824]/90 px-4 py-3 text-white backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span className="relative size-8 overflow-hidden rounded-full bg-[#f6e7b7]">
              <Image
                src="/favicon.jpg"
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            </span>
            Unick Admin
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Logout"
              className="border-white/15 bg-white/6 text-white hover:bg-white/10 hover:text-white"
              onClick={logout}>
              <LogOut className="size-4" />
            </Button>
            <MobileNavToggle
              links={mobileLinks}
              title="Unick Admin"
              description="Move through admin pages and operational tools."
              footer={
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/6 text-white hover:bg-white/10 hover:text-white"
                  onClick={logout}>
                  <LogOut />
                  Logout
                </Button>
              }
            />
          </div>
        </div>
      </header>
      <main className="min-w-0">
        <div className="mx-auto w-full max-w-310 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function getActiveAdminHref(pathname: string) {
  if (pathname === "/admin") {
    return "/admin";
  }

  const matchingItems = items
    .filter((item) => item.href !== "/admin")
    .filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length);

  return matchingItems[0]?.href ?? null;
}

function AdminLinkPendingIndicator() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={`flex size-4 shrink-0 items-center justify-center transition-opacity ${
        pending ? "opacity-100" : "opacity-0"
      }`}>
      <Loader2 className="size-3.5 animate-spin" />
    </span>
  );
}
