"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  History,
  Home,
  KeyRound,
  Search,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNavToggle } from "@/components/shared/mobile-nav-toggle";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/src/store/cart-store";

const links = [
  { href: "/", label: "Home", icon: <Home className="size-4" /> },
  { href: "/products", label: "Shop", icon: <Store className="size-4" /> },
  {
    href: "/products?category=Growth%20Oils",
    label: "Growth Oils",
    icon: <Search className="size-4" />,
  },
  {
    href: "/account/dashboard",
    label: "Account",
    icon: <UserRound className="size-4" />,
  },
  {
    href: "/account/orders",
    label: "Orders",
    icon: <History className="size-4" />,
  },
  {
    href: "/account/update-password",
    label: "Password",
    icon: <KeyRound className="size-4" />,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const count = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <header className="sticky top-0 z-100 isolate bg-[#1a0824]/80 px-3 py-3 text-white shadow-lg shadow-black/10 backdrop-blur-2xl sm:px-4">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/8 px-3 shadow-sm shadow-black/20 ring-1 ring-white/5 sm:px-4 lg:px-5">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2"
          aria-label="Unick Robins home">
          <span className="relative size-9 overflow-hidden rounded-full bg-[#f6e7b7] ring-1 ring-white/20">
            <Image
              src="/favicon.jpg"
              alt=""
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </span>
          <span className="font-heading text-lg font-semibold tracking-[0.18em] text-white">
            UNICK
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-[#16071f]/35 p-1 text-sm font-medium text-violet-100 md:flex">
          {links.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-[#f6e7b7]",
                isActivePath(pathname, link.href) &&
                  "bg-white/12 text-[#f6e7b7] shadow-sm shadow-black/10",
              )}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full text-violet-50 hover:bg-white/10 hover:text-[#f6e7b7]"
            aria-label="Search products">
            <Link href="/products">
              <Search />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full text-violet-50 hover:bg-white/10 hover:text-[#f6e7b7]"
            aria-label="Account dashboard">
            <Link href="/account/dashboard">
              <UserRound />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="relative rounded-full border-white/20 bg-[#f6e7b7]/10 text-white hover:bg-[#f6e7b7] hover:text-[#24102f]"
            aria-label="Shopping cart">
            <Link href="/cart">
              <ShoppingBag />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#d6b25e] text-[11px] font-semibold text-[#24102f]">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          <MobileNavToggle
            links={links}
            title="UNICK"
            description="Navigate the store, account, and cart pages."
            className="md:hidden"
          />
        </div>
      </div>
    </header>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  const basePath = href.split("?")[0];
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}
