import Link from "next/link";
import Image from "next/image";
import { Camera, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#16071f] text-violet-50">
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
            <span className="font-heading text-lg font-semibold tracking-[0.18em]">UNICK</span>
          </div>
          <p className="max-w-md text-sm leading-7 text-violet-100">
            Premium hair rituals for refined texture, polished edges, and everyday crown care.
          </p>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f6d87f]">
            Shop
          </h2>
          <div className="grid gap-3 text-sm text-violet-100">
            <Link href="/products">All products</Link>
            <Link href="/products?category=Hydration">Hydration</Link>
            <Link href="/products?category=Styling">Styling</Link>
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f6d87f]">
            Connect
          </h2>
          <div className="grid gap-3 text-sm text-violet-100">
            <a href="mailto:hello@unickrobins.com" className="flex items-center gap-2">
              <Mail className="size-4" /> hello@unickrobins.com
            </a>
            <a href="https://instagram.com" className="flex items-center gap-2">
              <Camera className="size-4" /> Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
