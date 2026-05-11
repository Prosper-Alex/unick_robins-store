"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, Boxes, LayoutDashboard, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/account/login");
  }

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-stone-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-stone-200 bg-white px-5 py-6 lg:block">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="relative size-9 overflow-hidden rounded-full bg-stone-950 ring-1 ring-stone-200">
            <Image
              src="/favicon.jpg"
              alt=""
              fill
              sizes="36px"
              className="object-cover"
            />
          </span>
          <span className="text-lg font-semibold">Unick Admin</span>
        </Link>
        <nav className="mt-10 grid gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-stone-950 text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button variant="outline" className="absolute bottom-6 left-5 right-5" onClick={logout}>
          <LogOut /> Logout
        </Button>
      </aside>
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span className="relative size-8 overflow-hidden rounded-full bg-stone-950">
              <Image src="/favicon.jpg" alt="" fill sizes="32px" className="object-cover" />
            </span>
            Unick Admin
          </Link>
          <Button variant="outline" size="icon" aria-label="Logout" onClick={logout}>
            <LogOut className="size-4" />
          </Button>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${
                  active ? "bg-stone-950 text-white" : "bg-stone-100 text-stone-700"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
