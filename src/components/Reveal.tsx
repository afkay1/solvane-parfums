"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

interface Props {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "ul" | "ol" | "article" | "header" | "aside" | "dl";
  stagger?: number;
  delay?: number;
  y?: number;
}

/** Fades children marked with data-reveal (or the wrapper itself) up into view. */
export default function Reveal({ children, className = "", as = "div", stagger = 0.1, delay = 0, y = 30 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inner = el.querySelectorAll<HTMLElement>("[data-reveal]");
    const targets: HTMLElement[] = inner.length ? Array.from(inner) : [el];
    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger, delay, scrollTrigger: { trigger: el, start: "top 88%", once: true } }
      );
    }, el);
    // Safety net: anything already on screen is shown even if a scroll event was missed.
    const id = window.setTimeout(() => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        targets.forEach((t) => {
          if (getComputedStyle(t).opacity === "0") gsap.to(t, { opacity: 1, y: 0, duration: 0.6 });
        });
      }
    }, 3500);
    return () => {
      window.clearTimeout(id);
      ctx.revert();
    };
  }, [stagger, delay, y]);

  const Tag = as as "div";
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </Tag>
  );
}
