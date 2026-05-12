"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  History,
  Home,
  Search,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNavToggle } from "@/components/shared/mobile-nav-toggle";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/src/store/cart-store";

const primaryLinks = [
  { href: "/", label: "Home", icon: <Home className="size-4" /> },
  { href: "/products", label: "Shop", icon: <Store className="size-4" /> },
  {
    href: "/products?category=Hair%20Oil",
    label: "Hair Oil",
    icon: <Search className="size-4" />,
  },
];

const accountLinks = [
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
];

export function Navbar() {
  const pathname = usePathname();
  const count = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const mobileLinks = [
    ...primaryLinks,
    {
      href: "/cart",
      label: count > 0 ? `Cart (${count})` : "Cart",
      icon: <ShoppingBag className="size-4" />,
    },
    ...accountLinks,
  ];

  return (
    <header className="sticky top-0 z-100 isolate bg-[#1a0824]/84 px-3 py-3 text-white shadow-lg shadow-black/10 backdrop-blur-2xl sm:px-4">
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
          <span className="min-w-0 leading-none">
            <span className="block font-heading text-base font-semibold tracking-[0.18em] text-white sm:text-lg">
              UNICK
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-violet-100/55 sm:block">
              Robins Store
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-[#16071f]/35 p-1 text-sm font-medium text-violet-100 md:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                isActivePath(pathname, link.href) ? "page" : undefined
              }
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-[#f6e7b7]",
                isActivePath(pathname, link.href) &&
                  "bg-white/12 text-[#f6e7b7] shadow-sm shadow-black/10",
              )}>
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden rounded-full text-violet-50 hover:bg-white/10 hover:text-[#f6e7b7] sm:inline-flex"
            aria-label="Search products">
            <Link href="/products">
              <Search />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn(
              "hidden rounded-full text-violet-50 hover:bg-white/10 hover:text-[#f6e7b7] sm:inline-flex",
              isActivePath(pathname, "/account/dashboard") &&
                "bg-white/12 text-[#f6e7b7]",
            )}
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
            links={mobileLinks}
            title="UNICK"
            description="Shop, review your cart, and manage your account."
            className="md:hidden"
            footer={
              <div className="grid w-full grid-cols-2 gap-2">
                <Button
                  asChild
                  className="rounded-full bg-[#d6b25e] text-[#24102f] hover:bg-[#f6e7b7]">
                  <Link href="/products">Shop now</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/6 text-white hover:bg-white/10 hover:text-white">
                  <Link href="/cart">Cart {count > 0 ? `(${count})` : ""}</Link>
                </Button>
              </div>
            }
          />
        </div>
      </div>
      <MobileBottomNav count={count} pathname={pathname} />
    </header>
  );
}

function MobileBottomNav({
  count,
  pathname,
}: {
  count: number;
  pathname: string;
}) {
  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Shop", icon: Store },
    { href: "/cart", label: "Cart", icon: ShoppingBag, badge: count },
    { href: "/account/dashboard", label: "Account", icon: UserRound },
  ];

  return (
    <nav className="mobile-bottom-nav fixed inset-x-3 bottom-3 z-100 rounded-2xl border border-white/10 bg-[#1a0824]/92 px-2 py-2 text-white shadow-2xl shadow-black/30 backdrop-blur-2xl md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-medium text-violet-100/70 transition hover:bg-white/10 hover:text-[#f6e7b7]",
                active &&
                  "bg-[#d6b25e] text-[#24102f] hover:bg-[#d6b25e] hover:text-[#24102f]",
              )}>
              <Icon className="size-4" />
              <span>{item.label}</span>
              {item.badge ? (
                <span className="absolute right-3 top-1 flex size-4 items-center justify-center rounded-full bg-[#f6e7b7] text-[10px] font-semibold text-[#24102f]">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  const basePath = href.split("?")[0];
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}
