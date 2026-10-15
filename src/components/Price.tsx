"use client";

import { useCart } from "@/lib/commerce/cart";
import { localPrice, marketFor, money } from "@/lib/commerce/markets";

/** Shows a USD base price in the visitor's market currency. */
export default function Price({ usd, from = false, className = "" }: { usd: number; from?: boolean; className?: string }) {
  const { country } = useCart();
  const cur = marketFor(country).currency;
  return (
    <span className={className}>
      {from ? "From " : ""}
      {money(localPrice(usd, cur), cur)}
    </span>
  );
}

export function useMoney() {
  const { country } = useCart();
  const market = marketFor(country);
  return { market, cur: market.currency, fmt: (n: number) => money(n, market.currency), local: (usd: number) => localPrice(usd, market.currency) };
}
