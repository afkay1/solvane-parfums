"use client";

import { useRef } from "react";
import Link from "next/link";
import { cart } from "@/lib/commerce/cart";
import { FAMILIES, LOW_STOCK, productHref, type Product } from "@/lib/data/products";
import { flyToCart } from "@/lib/fly";
import Img from "./Img";
import Price from "./Price";
import Stars from "./Stars";

interface Props {
  product: Product;
  priority?: boolean;
  sizes?: string;
  badge?: string;
}

/** Product tile: the bottle crossfades into its mood photograph on hover. */
export default function ProductCard({ product: p, priority = false, sizes = "(min-width: 1024px) 25vw, 50vw", badge }: Props) {
  const media = useRef<HTMLDivElement>(null);
  const href = productHref(p);
  const quick = p.kind === "perfume" ? p.variants[0] : p.kind === "giftcard" ? null : p.variants[0];
  const low = quick && quick.stock <= LOW_STOCK;
  const label = badge ?? (low ? `Only ${quick?.stock} left` : undefined);

  return (
    <article className="group relative" data-reveal>
      <Link href={href} className="block" aria-label={`${p.name}, ${p.short}`}>
        <div ref={media} className="relative aspect-[4/5] overflow-hidden bg-stone">
          <Img image={p.image} className="absolute inset-0" imgClassName="transition-transform duration-[1.4s] ease-lux group-hover:scale-[1.03]" sizes={sizes} priority={priority} />
          {p.hover && (
            <Img
              image={p.hover}
              decorative
              className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-lux group-hover:opacity-100"
              imgClassName="scale-[1.06] transition-transform duration-[1.4s] ease-lux group-hover:scale-100"
              sizes={sizes}
            />
          )}
          {label && <span className="eyebrow absolute left-3 top-3 bg-bone/90 px-2.5 py-1 !text-[10px]">{label}</span>}
        </div>
      </Link>
      {quick && (
        <button
          type="button"
          onClick={() => {
            cart.add({ slug: p.slug, variant: quick.id, qty: 1 });
            flyToCart(media.current);
          }}
          aria-label={`Add ${p.name} ${quick.label} to bag`}
          className="absolute right-3 top-3 flex h-10 items-center gap-2 bg-graphite px-3 text-[12px] font-medium tracking-[0.04em] text-bone opacity-100 transition-[opacity,transform] duration-300 hover:bg-amber lg:translate-y-1 lg:opacity-0 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
        >
          <span aria-hidden className="text-[16px] leading-none">+</span>
          <span className="hidden sm:inline">{p.kind === "perfume" ? `Add ${quick.label}` : "Add"}</span>
        </button>
      )}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="serif text-[24px] leading-tight sm:text-[26px]">
            <Link href={href} className="hover:underline">
              {p.name}
            </Link>
          </h3>
          <p className="mt-1 text-[13px] text-smoke">{p.family ? `${FAMILIES[p.family].short} · ${p.short}` : p.short}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Stars value={p.rating.value} size={11} />
            <span className="font-mono text-[11px] text-smoke">({p.rating.count})</span>
          </div>
        </div>
        {p.kind !== "giftcard" ? <Price usd={p.variants[0].usd} from={p.kind === "perfume"} className="shrink-0 pt-1.5 font-mono text-[13px]" /> : <span className="shrink-0 pt-1.5 font-mono text-[13px]">Digital</span>}
      </div>
    </article>
  );
}
