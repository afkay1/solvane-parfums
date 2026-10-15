"use client";

import { gsap, prefersReducedMotion } from "./gsap";

/**
 * "Fly to bag": a copy of the product image arcs into the bag icon, then the badge bumps.
 * Purely decorative; the item is already in the cart when this runs.
 */
export function flyToCart(source: HTMLElement | null) {
  const target = document.querySelector<HTMLElement>("[data-cart-target]");
  const bump = () => {
    const badge = document.querySelector<HTMLElement>("[data-cart-badge]");
    if (!badge) return;
    badge.classList.remove("bump");
    void badge.offsetWidth;
    badge.classList.add("bump");
  };
  if (!source || !target || prefersReducedMotion()) return bump();
  const img = source.tagName === "IMG" ? (source as HTMLImageElement) : source.querySelector("img");
  if (!img) return bump();
  const from = img.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const clone = img.cloneNode(true) as HTMLImageElement;
  clone.removeAttribute("srcset");
  clone.src = img.currentSrc || img.src;
  Object.assign(clone.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    objectFit: "cover",
    zIndex: "200",
    pointerEvents: "none",
    borderRadius: "2px",
    margin: "0",
    transform: "none",
  });
  document.body.appendChild(clone);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const tl = gsap.timeline({ onComplete: () => { clone.remove(); bump(); } });
  tl.to(clone, { x: dx, duration: 0.75, ease: "power2.inOut" }, 0)
    .to(clone, { y: dy, duration: 0.75, ease: "back.in(1.4)" }, 0)
    .to(clone, { scale: 0.08, opacity: 0.6, borderRadius: "50%", duration: 0.75, ease: "power2.in" }, 0);
}
