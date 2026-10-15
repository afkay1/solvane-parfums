"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ALL_PRODUCTS, FAMILIES, productHref } from "@/lib/data/products";
import Img from "./Img";
import Price from "./Price";

const SUGGEST = ["Fresh", "Rose", "Oud", "Vanilla", "Candle", "Gift"];

export default function Search({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => input.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.__lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return ALL_PRODUCTS.filter((p) => {
      const hay = [p.name, p.short, p.tagline, p.family ? FAMILIES[p.family].name : "", p.kind, ...(p.notes ? [...p.notes.top, ...p.notes.heart, ...p.notes.base] : []), ...(p.moods ?? [])]
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
      return t.split(/\s+/).every((w) => hay.includes(w.normalize("NFD").replace(/[̀-ͯ]/g, "")));
    }).slice(0, 8);
  }, [q]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      aria-hidden={!open}
      className={`fixed inset-0 z-[70] transition-[opacity,visibility] duration-300 ${open ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <button aria-label="Close search" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-graphite/40 backdrop-blur-[2px]" />
      <div className={`relative bg-bone transition-transform duration-500 ease-lux ${open ? "translate-y-0" : "-translate-y-6"}`}>
        <div className="wrap py-6 sm:py-8">
          <div className="flex items-center gap-4 border-b border-graphite pb-3">
            <label htmlFor="site-search" className="sr-only">
              Search fragrances, notes and candles
            </label>
            <input
              id="site-search"
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search a scent, a note, a mood…"
              autoComplete="off"
              tabIndex={open ? 0 : -1}
              className="serif w-full bg-transparent text-[30px] outline-none placeholder:text-smoke/60 sm:text-[44px]"
            />
            <button onClick={onClose} tabIndex={open ? 0 : -1} className="eyebrow shrink-0 hover:opacity-60">
              Close
            </button>
          </div>
          {!q && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-2 text-smoke">Try</span>
              {SUGGEST.map((s) => (
                <button key={s} tabIndex={open ? 0 : -1} onClick={() => setQ(s)} className="chip">
                  {s}
                </button>
              ))}
            </div>
          )}
          {q && (
            <div className="mt-6" aria-live="polite">
              {results.length === 0 ? (
                <p className="text-smoke">
                  Nothing found for “{q}”. Not sure what you’re looking for?{" "}
                  <Link href="/scent-finder" onClick={onClose} className="link-u text-graphite">
                    Take the Scent Finder
                  </Link>
                  .
                </p>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {results.map((p) => (
                    <li key={p.slug}>
                      <Link href={productHref(p)} onClick={onClose} tabIndex={open ? 0 : -1} className="group flex items-center gap-4">
                        <Img image={p.image} className="aspect-[4/5] w-20 shrink-0" sizes="80px" />
                        <span>
                          <span className="serif block text-[22px] group-hover:underline">{p.name}</span>
                          <span className="block text-[13px] text-smoke">{p.short}</span>
                          {p.kind !== "giftcard" && <Price usd={p.variants[0].usd} from={p.variants.length > 1} className="text-[13px]" />}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
