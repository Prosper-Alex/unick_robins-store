"use client";

import Image from "next/image";
import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MobileNavLink = {
  href: string;
  label: string;
  icon?: ReactNode;
};

export function MobileNavToggle({
  links,
  title,
  description,
  footer,
  className,
  panelClassName,
}: {
  links: MobileNavLink[];
  title: string;
  description: string;
  footer?: ReactNode;
  className?: string;
  panelClassName?: string;
}) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "group rounded-full border border-white/15 bg-[#f6e7b7]/12 text-[#fff8df] shadow-sm shadow-black/20 hover:border-[#d6b25e]/50 hover:bg-[#f6e7b7]/20 hover:text-[#fff8df] data-[state=open]:border-[#d6b25e]/60 data-[state=open]:bg-[#d6b25e] data-[state=open]:text-[#24102f]",
            className,
          )}
          aria-label="Open navigation">
          <span className="relative block size-5" aria-hidden="true">
            <span className="absolute left-0 top-1 h-0.5 w-5 rounded-full bg-current opacity-100 transition duration-200 group-hover:opacity-100 group-data-[state=open]:top-1/2 group-data-[state=open]:-translate-y-1/2 group-data-[state=open]:rotate-45" />
            <span className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rounded-full bg-current opacity-100 transition duration-200 group-hover:opacity-100 group-data-[state=open]:translate-x-2 group-data-[state=open]:opacity-0" />
            <span className="absolute bottom-1 left-0 h-0.5 w-5 rounded-full bg-current opacity-100 transition duration-200 group-hover:opacity-100 group-data-[state=open]:bottom-auto group-data-[state=open]:top-1/2 group-data-[state=open]:-translate-y-1/2 group-data-[state=open]:-rotate-45" />
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className={cn(
          "w-[86vw] border-white/10 bg-[#1a0824] text-white shadow-2xl shadow-black/40 sm:max-w-sm",
          panelClassName,
        )}>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-[#fff8df]">
            <span className="relative size-8 overflow-hidden rounded-full bg-[#f6e7b7]">
              <Image
                src="/favicon.jpg"
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            </span>
            {title}
          </SheetTitle>
          <SheetDescription className="text-violet-200">
            {description}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-2 px-4 pt-2">
          {links.map((link, index) => {
            const active = isActivePath(pathname, link.href);

            return (
              <SheetClose key={link.href} asChild>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "animate-fade-up flex items-center gap-3 rounded-2xl px-3 py-3 text-base font-medium text-violet-100 transition duration-200 hover:bg-white/10 hover:text-[#f6e7b7]",
                    active &&
                      "bg-[#d6b25e] text-[#24102f] hover:bg-[#d6b25e] hover:text-[#24102f]",
                  )}
                  style={{ animationDelay: `${index * 35}ms` }}>
                  {link.icon && (
                    <span className="flex size-5 items-center justify-center">
                      {link.icon}
                    </span>
                  )}
                  <span className="flex-1">{link.label}</span>
                  <MobileLinkPendingIndicator />
                  {active && (
                    <span className="rounded-full bg-[#24102f]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]">
                      Current
                    </span>
                  )}
                </Link>
              </SheetClose>
            );
          })}
        </div>
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}

function MobileLinkPendingIndicator() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={`flex size-4 shrink-0 items-center justify-center transition-opacity ${
        pending ? "opacity-100" : "opacity-0"
      }`}
    >
      <Loader2 className="size-3.5 animate-spin" />
    </span>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  const basePath = href.split("?")[0];
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}
