"use client";

import Link from "next/link";
import { useSummary } from "@/lib/commerce/cart";
import { CANDLES, DISCOVERY } from "@/lib/data/products";
import ProductCard from "../ProductCard";
import Reveal from "../Reveal";
import { CodeField, FreeShippingBar, GiftWrapField, LineItems, SamplesPicker, Totals } from "./parts";

export default function CartView() {
  const s = useSummary();
  const hasSet = s.lines.some((l) => l.kind === "discovery");
  const suggestions = [...(hasSet ? [] : [DISCOVERY]), ...CANDLES].filter((p) => !s.lines.some((l) => l.slug === p.slug)).slice(0, 3);

  if (s.lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="serif text-[40px]">Your bag is empty.</p>
        <p className="mx-auto mt-3 max-w-md text-smoke">Start with all eight perfumes in the Discovery Set, or find your match in six questions.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-dark">
            Shop the collection
          </Link>
          <Link href="/scent-finder" className="btn btn-outline">
            Scent Finder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div>
          <div className="border-b border-line pb-5">
            <FreeShippingBar s={s} />
          </div>
          <LineItems s={s} />
          <div className="grid gap-8 border-t border-line pt-8 md:grid-cols-2">
            <SamplesPicker s={s} />
            <GiftWrapField s={s} />
          </div>
        </div>
        <aside aria-label="Order summary" className="lg:sticky lg:top-[calc(var(--header)+var(--bar)+24px)] lg:self-start">
          <div className="border border-line bg-paper p-6 sm:p-8">
            <h2 className="serif text-[30px]">Summary</h2>
            <div className="mt-6">
              <CodeField s={s} />
            </div>
            <div className="mt-6 border-t border-line pt-6">
              <Totals s={s} stage="bag" />
            </div>
            {s.errors.length > 0 && (
              <ul className="mt-4 space-y-1" role="alert">
                {s.errors.map((e) => (
                  <li key={e} className="err">
                    {e}
                  </li>
                ))}
              </ul>
            )}
            <Link href="/checkout" className="btn btn-dark mt-6 w-full" aria-disabled={s.errors.length > 0}>
              Secure checkout
            </Link>
            <p className="mt-4 text-center text-[12px] text-smoke">Cards, Apple Pay and Google Pay · Free returns within 30 days</p>
          </div>
        </aside>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-28 border-t border-line pt-12">
          <p className="serif h3">Complete your order</p>
          <Reveal className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-3" stagger={0.08}>
            {suggestions.map((p) => (
              <ProductCard key={p.slug} product={p} sizes="(min-width: 1024px) 33vw, 50vw" />
            ))}
          </Reveal>
        </section>
      )}
    </>
  );
}
