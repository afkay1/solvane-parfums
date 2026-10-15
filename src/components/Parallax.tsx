"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Img from "./Img";
import type { Img as ImgT } from "@/lib/types";

interface Props {
  image: ImgT;
  className?: string;
  amount?: number;
  sizes?: string;
  priority?: boolean;
  children?: React.ReactNode;
}

/** Image that drifts slowly inside its frame while the section scrolls past. */
export default function Parallax({ image, className = "", amount = 10, sizes = "100vw", priority = false, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const inner = el.querySelector<HTMLElement>("[data-parallax]");
    if (!inner) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { yPercent: -amount },
        { yPercent: amount, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }
      );
    }, el);
    return () => ctx.revert();
  }, [amount]);

  return (
    <div ref={ref} className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} overflow-hidden ${className}`}>
      <div data-parallax className="absolute inset-x-0" style={{ top: `-${amount + 2}%`, bottom: `-${amount + 2}%` }}>
        <Img image={image} className="h-full w-full" sizes={sizes} priority={priority} />
      </div>
      {children}
    </div>
  );
}
