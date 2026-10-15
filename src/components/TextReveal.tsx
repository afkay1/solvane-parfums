"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

interface Props {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  immediate?: boolean;
}

/** Headline that rises word by word from behind a mask. */
export default function TextReveal({ text, as = "h2", className = "", delay = 0, immediate = false }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const words = el.querySelectorAll<HTMLElement>(".w > span");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.06,
          delay,
          scrollTrigger: immediate ? undefined : { trigger: el, start: "top 90%", once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [text, delay, immediate]);

  const Tag = as;
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((w, i, arr) => (
        <span key={i} aria-hidden>
          <span className="w inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span className="inline-block">{w}</span>
          </span>
          {i < arr.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
