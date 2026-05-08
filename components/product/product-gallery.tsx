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
    <div className="grid gap-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-violet-100 shadow-2xl shadow-black/25">
        <Image
          src={active}
          alt={title}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition duration-500"
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            className={`relative aspect-square overflow-hidden rounded-2xl border transition ${
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
