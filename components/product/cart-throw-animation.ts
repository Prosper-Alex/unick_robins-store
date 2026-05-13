"use client";

import type { Product } from "@/src/types/product";

function getVisibleCartTarget() {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]"));
  const visibleTargets = targets.filter((target) => {
    const rect = target.getBoundingClientRect();
    const style = window.getComputedStyle(target);

    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
  });

  if (visibleTargets.length === 0) {
    return null;
  }

  if (window.innerWidth < 768) {
    return visibleTargets.find((target) => target.closest(".mobile-bottom-nav")) ?? visibleTargets[0];
  }

  return visibleTargets.find((target) => !target.closest(".mobile-bottom-nav")) ?? visibleTargets[0];
}

export function throwProductToCart({
  product,
  source,
  quantity = 1,
}: {
  product: Product;
  source: HTMLElement;
  quantity?: number;
}) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const target = getVisibleCartTarget();

  if (!target) {
    return;
  }

  const sourceRect = source.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const startX = sourceRect.left + sourceRect.width / 2 - 24;
  const startY = sourceRect.top + sourceRect.height / 2 - 24;
  const endX = targetRect.left + targetRect.width / 2 - 24;
  const endY = targetRect.top + targetRect.height / 2 - 24;
  const lift = Math.min(180, Math.max(72, Math.abs(endX - startX) * 0.18));

  const chip = document.createElement("div");
  chip.className =
    "pointer-events-none fixed z-[200] grid size-12 place-items-center overflow-hidden rounded-2xl border border-[#f6e7b7]/80 bg-[#f6e7b7] shadow-2xl shadow-black/35 ring-1 ring-white/60";
  chip.style.left = `${startX}px`;
  chip.style.top = `${startY}px`;
  chip.style.transform = "translate3d(0, 0, 0) scale(1)";

  const image = document.createElement("img");
  image.src = product.image;
  image.alt = "";
  image.className = "h-full w-full object-cover";
  chip.appendChild(image);

  if (quantity > 1) {
    const badge = document.createElement("span");
    badge.textContent = `${quantity}`;
    badge.className =
      "absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-[#d6b25e] text-[11px] font-bold text-[#24102f]";
    chip.appendChild(badge);
  }

  document.body.appendChild(chip);

  const animation = chip.animate(
    [
      {
        opacity: 0,
        transform: "translate3d(0, 10px, 0) scale(0.72) rotate(-8deg)",
        offset: 0,
      },
      {
        opacity: 1,
        transform: `translate3d(${(endX - startX) * 0.32}px, ${-lift}px, 0) scale(1.08) rotate(8deg)`,
        offset: 0.42,
      },
      {
        opacity: 1,
        transform: `translate3d(${endX - startX}px, ${endY - startY}px, 0) scale(0.38) rotate(18deg)`,
        offset: 0.86,
      },
      {
        opacity: 0,
        transform: `translate3d(${endX - startX}px, ${endY - startY}px, 0) scale(0.18) rotate(18deg)`,
        offset: 1,
      },
    ],
    {
      duration: 780,
      easing: "cubic-bezier(0.2, 0.9, 0.16, 1)",
    }
  );

  target.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.12)" },
      { transform: "scale(1)" },
    ],
    {
      delay: 560,
      duration: 260,
      easing: "cubic-bezier(0.2, 0.9, 0.16, 1)",
    }
  );

  animation.finished.finally(() => chip.remove());
}
