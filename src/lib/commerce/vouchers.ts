import { createHmac, randomBytes } from "node:crypto";
import type { Currency } from "./markets";
import type { Voucher } from "./pricing";

/**
 * Signed voucher codes (Discovery Set credit and gift cards).
 * Format: CREDIT-38USD-LX4KQZ-7QX2LA  →  kind - amount+currency - issue day & nonce - signature.
 * They verify without a database; with DATABASE_URL set, redemptions are also recorded so
 * a code can only be used once.
 */

const secret = () => process.env.ORDER_SECRET || "solvane-demo-secret-change-me";
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CREDIT_DAYS = 60;
const GIFT_DAYS = 365 * 3;

const sig = (body: string) => {
  const h = createHmac("sha256", secret()).update(body).digest();
  return Array.from(h.subarray(0, 6), (b) => ALPHA[b % ALPHA.length]).join("");
};
const today = () => Math.floor(Date.now() / 86_400_000);

/** With a seed (order ref + index) the same order always yields the same codes. */
export function issueVoucher(kind: "credit" | "gift", amount: number, currency: Currency, seed?: string) {
  const bytes = seed ? createHmac("sha256", secret()).update(`nonce:${seed}`).digest().subarray(0, 2) : randomBytes(2);
  const nonce = Array.from(bytes, (b) => ALPHA[b % ALPHA.length]).join("");
  const stamp = today().toString(36).toUpperCase().padStart(4, "0") + nonce;
  const body = `${kind === "credit" ? "CREDIT" : "GIFT"}-${Math.round(amount)}${currency}-${stamp}`;
  return `${body}-${sig(body)}`;
}

export function verifyVoucher(raw: string): { voucher: Voucher } | { error: string } {
  const code = raw.trim().toUpperCase();
  const m = /^(CREDIT|GIFT)-(\d{1,5})(USD|EUR|GBP|AED)-([0-9A-Z]{4})([A-Z2-9]{2})-([A-Z2-9]{6})$/.exec(code);
  if (!m) return { error: "We don’t recognise this code. Please check it and try again." };
  const body = code.slice(0, code.lastIndexOf("-"));
  if (sig(body) !== m[6]) return { error: "We don’t recognise this code. Please check it and try again." };
  const issued = parseInt(m[4], 36);
  const kind = m[1] === "CREDIT" ? "credit" : "gift";
  const maxAge = kind === "credit" ? CREDIT_DAYS : GIFT_DAYS;
  if (!Number.isFinite(issued) || today() - issued > maxAge) return { error: "This code has expired." };
  return { voucher: { code, kind, amount: Number(m[2]), currency: m[3] as Currency } };
}

/** Vouchers an order earns: one credit per Discovery Set, one gift card per gift card line item. */
export function vouchersFor(o: { ref: string; summary: { currency: Currency; lines: { kind: string; qty: number; unit: number; gift?: { to: string } }[] } }) {
  const out: { code: string; kind: "credit" | "gift"; amount: number; currency: Currency; note: string }[] = [];
  let i = 0;
  for (const l of o.summary.lines) {
    for (let k = 0; k < l.qty; k++) {
      if (l.kind === "discovery") out.push({ code: issueVoucher("credit", l.unit, o.summary.currency, `${o.ref}:${i++}`), kind: "credit", amount: l.unit, currency: o.summary.currency, note: "Discovery Set credit (60 days, on a 50 or 100 ml)" });
      if (l.kind === "giftcard") out.push({ code: issueVoucher("gift", l.unit, o.summary.currency, `${o.ref}:${i++}`), kind: "gift", amount: l.unit, currency: o.summary.currency, note: `Gift card for ${l.gift?.to ?? "recipient"}` });
    }
  }
  return out;
}
