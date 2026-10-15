"use client";

import { useEffect, useRef, useState } from "react";
import { cart, useCart } from "@/lib/commerce/cart";
import { deliveryWindow, localPrice, marketFor, money } from "@/lib/commerce/markets";
import { MAX_QTY } from "@/lib/commerce/pricing";
import { LOW_STOCK, type Product } from "@/lib/data/products";
import { flyToCart } from "@/lib/fly";

const media = () => {
  const all = Array.from(document.querySelectorAll<HTMLElement>("[data-product-media]"));
  return all.find((el) => el.offsetParent !== null) ?? null;
};

export default function BuyBox({ product: p }: { product: Product }) {
  const { country } = useCart();
  const market = marketFor(country);
  const cur = market.currency;
  const [variant, setVariant] = useState(p.variants[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [eta, setEta] = useState("");
  const btn = useRef<HTMLButtonElement>(null);
  const v = p.variants.find((x) => x.id === variant) ?? p.variants[0];
  const price = localPrice(v.usd, cur);
  const soldOut = v.stock <= 0;

  useEffect(() => setEta(deliveryWindow(market.methods[0].days)), [market]);
  useEffect(() => {
    const el = btn.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const add = () => {
    cart.add({ slug: p.slug, variant: v.id, qty });
    flyToCart(media());
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div>
      {p.variants.length > 1 && (
        <fieldset>
          <legend className="eyebrow text-smoke">Size</legend>
          <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup">
            {p.variants.map((x) => {
              const on = x.id === variant;
              return (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setVariant(x.id);
                    setQty(1);
                  }}
                  className={`flex flex-col items-start border px-3 py-3 text-left transition-colors ${on ? "border-graphite bg-graphite text-bone" : "border-line hover:border-graphite"}`}
                >
                  <span className="text-[14px] font-medium">{x.label.replace(" sample", "")}</span>
                  <span className={`font-mono text-[12px] ${on ? "text-bone/75" : "text-smoke"}`}>{money(localPrice(x.usd, cur), cur)}</span>
                  {x.id === "2" && <span className={`mt-0.5 text-[11px] ${on ? "text-bone/70" : "text-smoke"}`}>Sample</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-6 flex items-baseline justify-between">
        <p className="font-mono text-[22px]">{money(price * qty, cur)}</p>
        {p.kind === "perfume" && v.id !== "2" && <p className="text-[13px] text-smoke">{money(Math.round((price / Number(v.id)) * 100) / 100, cur)} / ml</p>}
      </div>
      {v.stock <= LOW_STOCK && !soldOut && <p className="mt-2 text-[13px] text-amber">Only {v.stock} left in this batch</p>}

      <div className="mt-5 flex gap-3">
        <div className="inline-flex h-[54px] items-center border border-line">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-full w-10 text-[18px] hover:bg-stone">
            −
          </button>
          <span className="w-8 text-center font-mono text-[14px]" aria-live="polite" aria-label={`Quantity ${qty}`}>
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={qty >= Math.min(MAX_QTY, v.stock)}
            onClick={() => setQty((q) => Math.min(MAX_QTY, v.stock, q + 1))}
            className="h-full w-10 text-[18px] hover:bg-stone disabled:opacity-30"
          >
            +
          </button>
        </div>
        <button ref={btn} type="button" onClick={add} disabled={soldOut} className="btn btn-dark h-[54px] flex-1">
          {soldOut ? "Sold out" : added ? "Added to your bag ✓" : "Add to bag"}
        </button>
      </div>

      <ul className="mt-6 space-y-2 text-[14px]">
        <li className="flex gap-3">
          <span aria-hidden className="text-amber">◆</span>
          <span>
            {p.kind === "discovery" ? "Free delivery" : `${market.methods[0].name} delivery`} {eta ? <strong className="font-medium">{eta}</strong> : null}.
            {p.kind === "discovery" ? " Always ships free." : ` Free over ${money(market.freeOver, cur)}.`}
          </span>
        </li>
        <li className="flex gap-3">
          <span aria-hidden className="text-amber">◆</span>
          <span>Two free samples of your choice with every order.</span>
        </li>
        {p.kind === "perfume" && v.id !== "2" && (
          <li className="flex gap-3">
            <span aria-hidden className="text-amber">◆</span>
            <span>Ships with a sealed 2 ml tester. Not for you? Return the unopened bottle within 30 days.</span>
          </li>
        )}
      </ul>

      {/* Sticky add-to-bag bar once the main button scrolls away */}
      <div
        aria-hidden={!sticky}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bone/95 backdrop-blur-md transition-transform duration-500 ease-lux ${sticky ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="wrap flex items-center gap-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="serif truncate text-[20px] leading-tight">{p.name}</p>
            <p className="font-mono text-[12px] text-smoke">
              {v.label} · {money(price, cur)}
            </p>
          </div>
          <button type="button" onClick={add} disabled={soldOut} tabIndex={sticky ? 0 : -1} className="btn btn-dark !min-h-[46px] shrink-0">
            {added ? "Added ✓" : "Add to bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
