"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(images[0]);

  return (
    <div className="grid min-w-0 gap-4">
      <div className="relative aspect-[4/5] max-h-[760px] min-h-[320px] overflow-hidden rounded-3xl bg-violet-100 shadow-2xl shadow-black/25 sm:rounded-[2rem] lg:min-h-0">
        <Image
          src={active}
          alt={title}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition duration-500"
        />
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-2xl border transition sm:w-auto ${
              active === image ? "border-[#f6d87f] ring-2 ring-[#f6d87f]/40" : "border-white/10"
            }`}
            onClick={() => setActive(image)}
            aria-label={`View ${title} image ${index + 1}`}
          >
            <Image src={image} alt="" fill sizes="140px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
