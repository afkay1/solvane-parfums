"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Img from "./Img";
import type { Img as ImgT } from "@/lib/types";

interface Props {
  image: ImgT;
  className?: string;
  sizes?: string;
  priority?: boolean;
  zoom?: boolean;
}

/**
 * Editorial image reveal: a stone-coloured panel slides away to uncover the image
 * as it enters the viewport. The image itself is never clipped, so the browser
 * lazy-loads it normally and it can never get stuck invisible.
 */
export default function ImageReveal({ image, className = "", sizes, priority = false, zoom = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cover = el.querySelector<HTMLElement>("[data-cover]");
    const img = el.querySelector("img");
    if (!cover) return;
    if (prefersReducedMotion()) {
      gsap.set(cover, { display: "none" });
      return;
    }
    const rtl = document.documentElement.dir === "rtl";
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      tl.fromTo(
        cover,
        { scaleX: 1, transformOrigin: rtl ? "left" : "right" },
        { scaleX: 0, duration: 1.1, ease: "power3.inOut", onComplete: () => { gsap.set(cover, { display: "none" }); } }
      );
      if (img) tl.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.6, ease: "power3.out", clearProps: "transform" }, 0);
    }, el);
    // Safety net: never leave an image covered.
    const id = window.setTimeout(() => {
      if (cover.style.display !== "none" && el.getBoundingClientRect().top < window.innerHeight) gsap.set(cover, { display: "none" });
    }, 4000);
    return () => {
      window.clearTimeout(id);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${zoom ? "img-zoom" : ""} ${className}`}>
      <Img image={image} className="h-full w-full" sizes={sizes} priority={priority} />
      <div data-cover aria-hidden className="pointer-events-none absolute inset-0 hidden bg-[var(--bg)]" />
    </div>
  );
}
