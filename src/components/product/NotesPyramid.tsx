"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import type { Product } from "@/lib/data/products";

const TIERS = [
  { key: "top", label: "Top", when: "First 15 minutes", width: 56 },
  { key: "heart", label: "Heart", when: "15 minutes to 3 hours", width: 78 },
  { key: "base", label: "Base", when: "3 hours and beyond", width: 100 },
] as const;

/** The notes pyramid builds from the base up, the way a perfume reveals itself in reverse. */
export function NotesPyramid({ notes, color }: { notes: NonNullable<Product["notes"]>; color: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-tier]")).reverse();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 75%", once: true } });
      rows.forEach((row, i) => {
        const band = row.querySelector("[data-band]");
        const chips = row.querySelectorAll("[data-chip]");
        tl.fromTo(band, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power3.out" }, i * 0.35);
        tl.fromTo(chips, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" }, i * 0.35 + 0.3);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="space-y-3">
      {TIERS.map((t, i) => (
        <div key={t.key} data-tier className="grid grid-cols-[88px_1fr] items-center gap-4 sm:grid-cols-[150px_1fr]">
          <div>
            <p className="eyebrow">{t.label}</p>
            <p className="mt-1 hidden text-[12px] text-smoke sm:block">{t.when}</p>
          </div>
          <div className="relative flex justify-center">
            <div
              data-band
              aria-hidden
              className="absolute inset-y-0 origin-center"
              style={{ left: `${(100 - t.width) / 2}%`, width: `${t.width}%`, background: color, opacity: 0.28 + i * 0.18 }}
            />
            <ul className="relative flex min-h-[72px] flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-4" style={{ width: `${t.width}%` }}>
              {notes[t.key].map((n) => (
                <li key={n} data-chip className="serif text-center text-[22px] leading-tight sm:text-[26px]">
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Intensity, longevity and sillage as five-step scales that fill on scroll. */
export function Scales({ scales }: { scales: NonNullable<Product["scales"]> }) {
  const ref = useRef<HTMLDListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const segs = el.querySelectorAll("[data-on]");
    const ctx = gsap.context(() => {
      gsap.fromTo(segs, { scaleX: 0 }, { scaleX: 1, duration: 0.5, stagger: 0.06, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    }, el);
    return () => ctx.revert();
  }, []);
  const rows = [
    { label: "Intensity", value: scales.intensity, text: ["Whisper", "Soft", "Balanced", "Rich", "Intense"][scales.intensity - 1] },
    { label: "Longevity", value: scales.longevity, text: scales.longevityText },
    { label: "Sillage", value: scales.sillage, text: scales.sillageText },
  ];
  return (
    <dl ref={ref} className="space-y-6">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="eyebrow">{r.label}</dt>
            <dd className="text-[14px] text-smoke">{r.text}</dd>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1.5" role="img" aria-label={`${r.label}: ${r.value} out of 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="relative h-[5px] bg-line">
                {n <= r.value && <span data-on className="absolute inset-0 origin-left bg-graphite" />}
              </span>
            ))}
          </div>
        </div>
      ))}
    </dl>
  );
}
