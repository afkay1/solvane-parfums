import { getProduct, getPerfume, productHref, GIFT_CARD_USD, PERFUMES } from "../data/products";
import type { Img } from "../types";
import { convert, getCountry, localPrice, MARKETS, US_STATES, type Currency, type MarketId, type ShipMethod } from "./markets";

/**
 * The single pricing engine. It runs in the browser for instant feedback and again on the
 * server at checkout, so the customer always sees exactly what they will be charged.
 */

export const MAX_QTY = 5;
export const MAX_SAMPLES = 2;
export const WELCOME_CODE = "WELCOME10";
export const WELCOME_RATE = 0.1;

export interface GiftDetails {
  amount: number; // USD face value, one of GIFT_CARD_USD
  to: string;
  email: string;
  from: string;
  message: string;
  date: string; // YYYY-MM-DD delivery date
}

export interface CartLine {
  slug: string;
  variant: string;
  qty: number;
  gift?: GiftDetails;
}

export interface Voucher {
  code: string;
  kind: "credit" | "gift";
  amount: number;
  currency: Currency;
}

export interface CartInput {
  lines: CartLine[];
  samples: string[];
  giftWrap: boolean;
  code?: string;
  voucher?: Voucher | null;
  country: string;
  region?: string;
  shipping?: ShipMethod["id"];
}

export interface PricedLine {
  key: string;
  slug: string;
  variant: string;
  kind: string;
  name: string;
  variantLabel: string;
  image: Img;
  href: string;
  qty: number;
  unit: number;
  total: number;
  stock: number;
  gift?: GiftDetails;
}

export interface Summary {
  currency: Currency;
  market: MarketId;
  country: string;
  lines: PricedLine[];
  count: number;
  subtotal: number;
  physical: boolean;
  samples: { slug: string; name: string }[];
  samplesAllowed: boolean;
  giftWrap: boolean;
  discount: { code: string; label: string; amount: number } | null;
  giftCard: { code: string; amount: number } | null;
  codeError: string | null;
  shipping: { id: ShipMethod["id"]; name: string; carrier: string; price: number; free: boolean; days: [number, number] } | null;
  methods: { id: ShipMethod["id"]; name: string; carrier: string; price: number; days: [number, number] }[];
  freeOver: number;
  freeShippingRemaining: number | null;
  tax: { label: string; amount: number; added: boolean; pending: boolean };
  total: number;
  errors: string[];
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function lineKey(l: CartLine) {
  const g = l.gift ? `|${l.gift.amount}|${l.gift.email}|${l.gift.to}|${l.gift.date}` : "";
  return `${l.slug}|${l.variant}${g}`;
}

export function unitPrice(slug: string, variant: string, cur: Currency, gift?: GiftDetails) {
  const p = getProduct(slug);
  if (!p) return null;
  if (p.kind === "giftcard") return gift && GIFT_CARD_USD.includes(gift.amount) ? localPrice(gift.amount, cur) : null;
  const v = p.variants.find((x) => x.id === variant);
  return v ? localPrice(v.usd, cur) : null;
}

export function computeCart(input: CartInput): Summary {
  const country = getCountry(input.country);
  const market = MARKETS[country.market];
  const cur = market.currency;
  const errors: string[] = [];
  const lines: PricedLine[] = [];

  for (const l of input.lines) {
    const p = getProduct(l.slug);
    const v = p?.variants.find((x) => x.id === l.variant);
    const unit = unitPrice(l.slug, l.variant, cur, l.gift);
    if (!p || !v || unit === null) {
      errors.push("An item in your bag is no longer available.");
      continue;
    }
    const qty = Math.trunc(l.qty);
    if (!(qty >= 1 && qty <= MAX_QTY)) errors.push(`You can order up to ${MAX_QTY} of ${p.name}.`);
    if (qty > v.stock) errors.push(`Only ${v.stock} left of ${p.name} ${v.label}.`);
    lines.push({
      key: lineKey(l),
      slug: p.slug,
      variant: v.id,
      kind: p.kind,
      name: p.name,
      variantLabel: p.kind === "giftcard" ? `Digital gift card · ${l.gift?.to || "recipient"}` : v.label,
      image: p.image,
      href: productHref(p),
      qty,
      unit,
      total: r2(unit * qty),
      stock: v.stock,
      gift: l.gift,
    });
  }

  const subtotal = r2(lines.reduce((s, l) => s + l.total, 0));
  const physicalLines = lines.filter((l) => l.kind !== "giftcard");
  const physical = physicalLines.length > 0;
  const merch = r2(physicalLines.reduce((s, l) => s + l.total, 0));
  const bottles = r2(lines.filter((l) => l.kind === "perfume" && (l.variant === "50" || l.variant === "100")).reduce((s, l) => s + l.total, 0));

  // Free samples
  const samplesAllowed = physical;
  const uniq = Array.from(new Set(input.samples ?? []));
  if (uniq.length > MAX_SAMPLES) errors.push(`Choose up to ${MAX_SAMPLES} free samples.`);
  const samples = samplesAllowed
    ? uniq.slice(0, MAX_SAMPLES).flatMap((s) => {
        const p = getPerfume(s);
        return p ? [{ slug: p.slug, name: p.name }] : [];
      })
    : [];

  // Codes
  let discount: Summary["discount"] = null;
  let giftCard: Summary["giftCard"] = null;
  let codeError: string | null = null;
  const code = (input.code ?? "").trim().toUpperCase();
  if (code) {
    if (code === WELCOME_CODE) {
      if (merch > 0) discount = { code, label: "Welcome 10% off", amount: r2(merch * WELCOME_RATE) };
      else codeError = "This code applies to fragrances, candles and sets, not gift cards.";
    } else if (input.voucher && input.voucher.code === code) {
      const amount = convert(input.voucher.amount, input.voucher.currency, cur);
      if (input.voucher.kind === "credit") {
        if (bottles > 0) discount = { code, label: "Discovery Set credit", amount: r2(Math.min(amount, bottles)) };
        else codeError = "Your Discovery Set credit applies to a 50 ml or 100 ml bottle. Add one to use it.";
      } else {
        giftCard = { code, amount };
      }
    } else {
      codeError = "We don’t recognise this code. Please check it and try again.";
    }
  }
  const afterDiscount = r2(merch - (discount?.amount ?? 0));

  // Shipping
  const onlyFreeShipping = physicalLines.every((l) => l.kind === "discovery" || l.variant === "2");
  const free = physical && (onlyFreeShipping || afterDiscount >= market.freeOver);
  const methods = market.methods.map((m) => ({ id: m.id, name: m.name, carrier: m.carrier, days: m.days, price: m.id === "standard" && free ? 0 : m.price }));
  const chosen = methods.find((m) => m.id === input.shipping) ?? methods[0];
  const shipping = physical ? { ...chosen, free: chosen.price === 0 } : null;
  const freeShippingRemaining = physical && !onlyFreeShipping ? r2(Math.max(0, market.freeOver - afterDiscount)) : null;

  // Tax
  let tax: Summary["tax"];
  const preTax = r2(afterDiscount + (subtotal - merch) + (shipping?.price ?? 0));
  if (market.taxMode === "us-sales") {
    const st = US_STATES.find((s) => s.code === input.region);
    tax = st
      ? { label: `Estimated sales tax (${st.code})`, amount: r2(afterDiscount * st.rate), added: true, pending: false }
      : { label: "Sales tax", amount: 0, added: true, pending: true };
  } else if (market.taxMode === "vat-included") {
    const rate = country.vat ?? 0.2;
    tax = { label: `Includes VAT (${Math.round(rate * 100)}%)`, amount: r2(((afterDiscount + (shipping?.price ?? 0)) * rate) / (1 + rate)), added: false, pending: false };
  } else {
    tax = { label: "Duties & taxes", amount: 0, added: false, pending: false };
  }

  let total = r2(preTax + (tax.added ? tax.amount : 0));
  if (giftCard) {
    giftCard = { code: giftCard.code, amount: r2(Math.min(giftCard.amount, total - (subtotal - merch))) };
    total = r2(total - giftCard.amount);
  }

  return {
    currency: cur,
    market: market.id,
    country: country.code,
    lines,
    count: lines.reduce((s, l) => s + l.qty, 0),
    subtotal,
    physical,
    samples,
    samplesAllowed,
    giftWrap: physical && input.giftWrap,
    discount,
    giftCard,
    codeError,
    shipping,
    methods,
    freeOver: market.freeOver,
    freeShippingRemaining,
    tax,
    total: Math.max(0, total),
    errors,
  };
}

export const SAMPLE_CHOICES = PERFUMES.map((p) => ({ slug: p.slug, name: p.name, short: p.short, color: p.color }));
