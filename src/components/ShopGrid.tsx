"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { ALL_PRODUCTS, FAMILIES, type FamilyId, type Kind } from "@/lib/data/products";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

const CATEGORIES: { id: "all" | Kind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "perfume", label: "Eaux de parfum" },
  { id: "discovery", label: "Discovery Set" },
  { id: "candle", label: "Candles" },
  { id: "giftcard", label: "Gift cards" },
];
const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "rating", label: "Best rated" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "intensity", label: "Lightest first" },
];

type Cat = (typeof CATEGORIES)[number]["id"];

export default function ShopGrid({ initialCategory, initialFamily }: { initialCategory?: string; initialFamily?: string }) {
  const sortId = useId();
  const [cat, setCat] = useState<Cat>(CATEGORIES.some((c) => c.id === initialCategory) ? (initialCategory as Cat) : "all");
  const [family, setFamily] = useState<FamilyId | "all">(initialFamily && initialFamily in FAMILIES ? (initialFamily as FamilyId) : "all");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    const u = new URL(window.location.href);
    cat === "all" ? u.searchParams.delete("category") : u.searchParams.set("category", cat);
    family === "all" ? u.searchParams.delete("family") : u.searchParams.set("family", family);
    window.history.replaceState(null, "", u.pathname + u.search);
  }, [cat, family]);

  const list = useMemo(() => {
    let l = ALL_PRODUCTS.filter((p) => cat === "all" || p.kind === cat);
    if (family !== "all") l = l.filter((p) => p.family === family);
    const price = (p: (typeof l)[number]) => (p.kind === "giftcard" ? 50 : p.variants[0].usd);
    if (sort === "rating") l = [...l].sort((a, b) => b.rating.value - a.rating.value || b.rating.count - a.rating.count);
    if (sort === "price-asc") l = [...l].sort((a, b) => price(a) - price(b));
    if (sort === "price-desc") l = [...l].sort((a, b) => price(b) - price(a));
    if (sort === "intensity") l = [...l].sort((a, b) => (a.scales?.intensity ?? 9) - (b.scales?.intensity ?? 9));
    return l;
  }, [cat, family, sort]);

  const showFamilies = cat === "all" || cat === "perfume";

  return (
    <div>
      <div className="flex flex-col gap-5 border-y border-line py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="no-scrollbar -mx-[var(--pad)] flex gap-2 overflow-x-auto px-[var(--pad)] lg:mx-0 lg:px-0" role="group" aria-label="Category">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => {
                  setCat(c.id);
                  if (c.id !== "all" && c.id !== "perfume") setFamily("all");
                }}
                className="chip shrink-0"
              >
                {c.label}
              </button>
            ))}
          </div>
          {showFamilies && (
            <div className="no-scrollbar -mx-[var(--pad)] flex gap-2 overflow-x-auto px-[var(--pad)] lg:mx-0 lg:px-0" role="group" aria-label="Scent family">
              <button type="button" aria-pressed={family === "all"} onClick={() => setFamily("all")} className="chip shrink-0 !min-h-[32px] text-[13px]">
                Every family
              </button>
              {(Object.keys(FAMILIES) as FamilyId[]).map((f) => (
                <button key={f} type="button" aria-pressed={family === f} onClick={() => setFamily(f)} className="chip shrink-0 !min-h-[32px] text-[13px]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: FAMILIES[f].color }} aria-hidden />
                  {FAMILIES[f].name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <p className="font-mono text-[12px] text-smoke" aria-live="polite">
            {list.length} {list.length === 1 ? "product" : "products"}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor={sortId} className="text-[13px] text-smoke">
              Sort
            </label>
            <select id={sortId} value={sort} onChange={(e) => setSort(e.target.value)} className="field !w-auto !py-2 text-[14px]">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="py-24 text-center">
          <p className="serif text-[32px]">Nothing here yet.</p>
          <button type="button" onClick={() => { setCat("all"); setFamily("all"); }} className="link-arrow mt-6">
            Show everything
          </button>
        </div>
      ) : (
        <Reveal key={`${cat}-${family}-${sort}`} className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4" stagger={0.05} y={20}>
          {list.map((p, i) => (
            <ProductCard key={p.slug} product={p} priority={i < 4} badge={p.slug === "santal-doux" ? "Bestseller" : p.kind === "discovery" ? "Start here" : undefined} />
          ))}
        </Reveal>
      )}

      <div className="mt-24 grid gap-6 border-t border-line pt-12 md:grid-cols-2">
        <p className="serif text-[32px] leading-tight">Can’t decide? Let us narrow it down.</p>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <Link href="/scent-finder" className="btn btn-dark">
            Take the Scent Finder
          </Link>
          <Link href="/discovery-set" className="btn btn-outline">
            Try all eight
          </Link>
        </div>
      </div>
    </div>
  );
}
