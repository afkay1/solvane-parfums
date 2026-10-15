"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cart, useCart } from "@/lib/commerce/cart";
import { COUNTRIES, CURRENCY_SYMBOL, getCountry, MARKETS } from "@/lib/commerce/markets";

function CountrySelect({ id, className = "" }: { id: string; className?: string }) {
  const { country } = useCart();
  return (
    <select id={id} value={country} onChange={(e) => cart.setCountry(e.target.value)} className={className}>
      {COUNTRIES.map((c) => {
        const m = MARKETS[c.market];
        return (
          <option key={c.code} value={c.code}>
            {c.name} ({m.currency} {CURRENCY_SYMBOL[m.currency]})
          </option>
        );
      })}
    </select>
  );
}

/** Footer version: a labelled native select. */
export function MarketSelectFull({ dark = false }: { dark?: boolean }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-2 block opacity-60">
        Ship to
      </label>
      <CountrySelect id={id} className={`field max-w-xs !py-2.5 text-[15px] ${dark ? "!border-white/20 !bg-transparent !text-bone [&>option]:text-graphite" : ""}`} />
    </div>
  );
}

/** Header version: compact button with a small popover. */
export default function MarketSelect() {
  const { country } = useCart();
  const c = getCountry(country);
  const m = MARKETS[c.market];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className="flex h-10 items-center gap-1.5 px-2 font-mono text-[12px] tracking-[0.08em] transition-opacity hover:opacity-60"
      >
        <span className="sr-only">Shipping country and currency: </span>
        {c.code} · {m.currency}
      </button>
      <div
        id={`${id}-panel`}
        hidden={!open}
        className="absolute right-0 top-full z-50 mt-2 w-[300px] border border-line bg-paper p-5 text-graphite shadow-card"
      >
        <label htmlFor={`${id}-sel`} className="eyebrow mb-2 block text-smoke">
          Ship to
        </label>
        <CountrySelect id={`${id}-sel`} className="field !py-2.5 text-[15px]" />
        <p className="mt-3 text-[13px] leading-relaxed text-smoke">
          Prices, delivery times and taxes update for your country.{" "}
          {m.taxMode === "vat-included" ? "Prices include VAT." : m.taxMode === "duties-included" ? "Duties and taxes are prepaid by us." : "Sales tax is calculated at checkout."}
        </p>
      </div>
    </div>
  );
}
