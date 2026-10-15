import { createHmac, randomBytes } from "node:crypto";
import { BRAND } from "../data/brand";
import { SITE_URL } from "../format";
import { money } from "./markets";
import type { Order } from "./order";

/* ---------------- References & admin session ---------------- */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newRef() {
  return "SLV-" + Array.from(randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join("");
}

const secret = () => process.env.ORDER_SECRET || "solvane-demo-secret-change-me";
const b64 = (buf: Buffer) => buf.toString("base64url");
export function signAdmin(expiresAt: number) {
  const body = `admin.${expiresAt}`;
  return `${body}.${b64(createHmac("sha256", secret() + (process.env.ADMIN_PASSWORD || "")).update(body).digest())}`;
}
export function verifyAdmin(v: string | undefined) {
  if (!v) return false;
  const parts = v.split(".");
  if (parts.length !== 3) return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  return signAdmin(exp) === v;
}

/* ---------------- Stripe Checkout via REST (no SDK needed) ---------------- */

export const isStripeMode = () => Boolean(process.env.STRIPE_SECRET_KEY);
const stripe = async (path: string, body?: URLSearchParams) => {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
    body,
    cache: "no-store",
  });
  const json = (await res.json()) as Record<string, unknown> & { error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message || "Payment provider error");
  return json;
};
const minor = (n: number) => String(Math.round(n * 100));

export async function createCheckout(o: Order): Promise<string> {
  const s = o.summary;
  const cur = s.currency.toLowerCase();
  const p = new URLSearchParams();
  p.set("mode", "payment");
  p.set("customer_email", o.customer.email);
  p.set("client_reference_id", o.ref);
  p.set("metadata[ref]", o.ref);
  p.set("metadata[lines]", orderMetadata(o));
  let i = 0;
  const item = (name: string, amount: number, qty: number, description?: string) => {
    p.set(`line_items[${i}][quantity]`, String(qty));
    p.set(`line_items[${i}][price_data][currency]`, cur);
    p.set(`line_items[${i}][price_data][unit_amount]`, minor(amount));
    p.set(`line_items[${i}][price_data][product_data][name]`, name);
    if (description) p.set(`line_items[${i}][price_data][product_data][description]`, description);
    i++;
  };
  s.lines.forEach((l) => item(`${l.name} · ${l.variantLabel}`, l.unit, l.qty));
  if (s.tax.added && s.tax.amount > 0) item(s.tax.label, s.tax.amount, 1);
  if (s.shipping) {
    p.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
    p.set("shipping_options[0][shipping_rate_data][display_name]", `${s.shipping.name} (${s.shipping.carrier})`);
    p.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", minor(s.shipping.price));
    p.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", cur);
  }
  const off = (s.discount?.amount ?? 0) + (s.giftCard?.amount ?? 0);
  if (off > 0) {
    const c = new URLSearchParams();
    c.set("amount_off", minor(off));
    c.set("currency", cur);
    c.set("duration", "once");
    c.set("name", [s.discount?.label, s.giftCard ? "Gift card" : ""].filter(Boolean).join(" + ").slice(0, 40));
    const coupon = await stripe("coupons", c);
    p.set("discounts[0][coupon]", String(coupon.id));
  }
  p.set("success_url", `${SITE_URL}/checkout/confirmation?ref=${o.ref}&session_id={CHECKOUT_SESSION_ID}`);
  p.set("cancel_url", `${SITE_URL}/checkout?cancelled=1`);
  const session = await stripe("checkout/sessions", p);
  if (typeof session.url !== "string") throw new Error("Payment could not be started.");
  return session.url;
}

export async function isSessionPaid(sessionId: string, ref: string): Promise<boolean> {
  if (!isStripeMode() || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return false;
  try {
    const s = (await stripe(`checkout/sessions/${sessionId}`)) as { payment_status?: string; metadata?: { ref?: string } };
    return s.payment_status === "paid" && s.metadata?.ref === ref;
  } catch {
    return false;
  }
}

/** Stores the order (minus personal data) in Stripe metadata, so vouchers can be issued after payment even without a database. */
export function orderMetadata(o: Order) {
  return JSON.stringify({ c: o.summary.currency, l: o.summary.lines.map((l) => [l.kind, l.qty, l.unit, l.gift?.to ?? ""]) }).slice(0, 500);
}
export async function sessionOrderLines(sessionId: string) {
  const s = (await stripe(`checkout/sessions/${sessionId}`)) as { metadata?: { lines?: string } };
  try {
    const j = JSON.parse(s.metadata?.lines ?? "{}") as { c: string; l: [string, number, number, string][] };
    return j;
  } catch {
    return null;
  }
}

/* ---------------- Email (Resend) ---------------- */

export async function sendEmail(to: string, subject: string, text: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || `${BRAND.name} <onboarding@resend.dev>`, to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  }).catch(() => null);
  return Boolean(res?.ok);
}

export async function sendOrderEmails(o: Order) {
  const s = o.summary;
  const m = (n: number) => money(n, s.currency);
  const text = [
    `Dear ${o.customer.firstName},`,
    "",
    `Thank you for your order. We’re preparing it by hand in our atelier in Grasse.`,
    "",
    `Order ${o.ref}`,
    ...s.lines.map((l) => `${l.qty} × ${l.name} (${l.variantLabel})  ${m(l.total)}`),
    ...(s.samples.length ? [`Free samples: ${s.samples.map((x) => x.name).join(", ")}`] : []),
    ...(s.giftWrap ? ["Gift wrapped with a handwritten card"] : []),
    "",
    `Subtotal ${m(s.subtotal)}`,
    ...(s.discount ? [`${s.discount.label} −${m(s.discount.amount)}`] : []),
    ...(s.shipping ? [`Shipping (${s.shipping.name}) ${s.shipping.price ? m(s.shipping.price) : "Free"}`] : []),
    ...(s.tax.added ? [`${s.tax.label} ${m(s.tax.amount)}`] : [`${s.tax.label} ${s.tax.amount ? m(s.tax.amount) : "included"}`]),
    ...(s.giftCard ? [`Gift card −${m(s.giftCard.amount)}`] : []),
    `Total ${m(s.total)}`,
    "",
    ...o.vouchers.map((v) => `${v.note}: ${v.code}`),
    "",
    `Track your order: ${SITE_URL}/track?ref=${o.ref}`,
    "",
    `${BRAND.name} · ${BRAND.address} · ${BRAND.email}`,
  ].join("\n");
  await sendEmail(o.customer.email, `Your Solvane order ${o.ref}`, text);
  if (process.env.ORDERS_INBOX) await sendEmail(process.env.ORDERS_INBOX, `New order ${o.ref}: ${m(s.total)}`, text);
}
