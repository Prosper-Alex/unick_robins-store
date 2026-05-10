import Link from "next/link";
import Image from "next/image";
import { Camera, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#16071f] text-violet-50">
      {/* Gold gradient accent line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #f6d87f 30%, #d6b25e 60%, transparent)",
        }}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <div className="mb-5 flex items-center gap-2">
            <span className="relative size-9 overflow-hidden rounded-full bg-[#f6e7b7] ring-1 ring-white/15">
              <Image
                src="/favicon.jpg"
                alt=""
                fill
                sizes="36px"
                className="object-cover"
              />
            </span>
            <span className="font-heading text-lg italic tracking-wide text-white">
              Unick Robins
            </span>
          </div>
          <p className="max-w-md text-sm leading-7 text-violet-200">
            Premium hair rituals for refined texture, polished edges, and everyday crown care.
          </p>
          <p className="mt-6 text-xs text-violet-400">
            © {new Date().getFullYear()} Unick Robins. All rights reserved.
          </p>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f6d87f]">
            Shop
          </h2>
          <div className="grid gap-3 text-sm text-violet-200">
            <Link href="/products" className="transition hover:text-[#f6d87f] hover:underline underline-offset-4">All products</Link>
            <Link href="/products?category=Hydration" className="transition hover:text-[#f6d87f] hover:underline underline-offset-4">Hydration</Link>
            <Link href="/products?category=Styling" className="transition hover:text-[#f6d87f] hover:underline underline-offset-4">Styling</Link>
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f6d87f]">
            Connect
          </h2>
          <div className="grid gap-3 text-sm text-violet-200">
            <a href="mailto:hello@unickrobins.com" className="flex items-center gap-2 transition hover:text-[#f6d87f]">
              <Mail className="size-4" /> hello@unickrobins.com
            </a>
            <a href="https://instagram.com" className="flex items-center gap-2 transition hover:text-[#f6d87f]">
              <Camera className="size-4" /> Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
