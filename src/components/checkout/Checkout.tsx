"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cart, saveLocalOrder, useCart, useSummary } from "@/lib/commerce/cart";
import { COUNTRIES, deliveryWindow, money, US_STATES } from "@/lib/commerce/markets";
import type { Customer, Order } from "@/lib/commerce/order";
import { NO_POSTAL, validateCustomer } from "@/lib/commerce/validate";
import { CodeField, GiftWrapField, LineItems, SamplesPicker, Totals } from "../cart/parts";

const EMPTY: Customer = { email: "", firstName: "", lastName: "", phone: "", address1: "", address2: "", city: "", region: "", postal: "", country: "US" };
const DRAFT_KEY = "solvane.checkout.v1";

export default function Checkout({ stripe }: { stripe: boolean }) {
  const router = useRouter();
  const state = useCart();
  const s = useSummary();
  const [c, setC] = useState<Customer>(EMPTY);
  const [newsletter, setNewsletter] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof Customer, string>>>({});
  const [terms, setTerms] = useState(false);
  const [termsErr, setTermsErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [openSummary, setOpenSummary] = useState(false);
  const [ready, setReady] = useState(false);

  // Restore a draft (never card data: payment happens on Stripe).
  useEffect(() => {
    try {
      const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null") as Customer | null;
      if (d) setC({ ...EMPTY, ...d });
    } catch {
      /* ignore */
    }
    setCancelled(new URLSearchParams(window.location.search).has("cancelled"));
    setReady(true);
  }, []);
  useEffect(() => {
    setC((v) => ({ ...v, country: state.country, region: state.country === v.country ? v.region : "" }));
  }, [state.country]);
  useEffect(() => {
    if (ready) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(c));
  }, [c, ready]);

  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    if (k === "country") cart.setCountry(value);
    if (k === "region") cart.setRegion(value);
    setC((v) => ({ ...v, [k]: value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const continueDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateCustomer(c, s.physical);
    setErrors(err);
    const first = Object.keys(err)[0];
    if (first) {
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    cart.setRegion(c.region);
    setStep(s.physical ? 2 : 3);
  };

  const placeOrder = async () => {
    if (!terms) {
      setTermsErr(true);
      document.getElementById("co-terms")?.focus();
      return;
    }
    setBusy(true);
    setServerErr("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: { ...state, region: c.region }, customer: c, newsletter, acceptTerms: true, website: "" }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string; order?: Order; checkoutUrl?: string };
      if (!j.ok || !j.order) throw new Error(j.error || "We couldn’t place your order.");
      saveLocalOrder(j.order);
      sessionStorage.removeItem(DRAFT_KEY);
      if (j.checkoutUrl) {
        window.location.href = j.checkoutUrl;
        return;
      }
      cart.clearAfterOrder();
      router.push(`/checkout/confirmation?ref=${j.order.ref}`);
    } catch (e) {
      setServerErr(e instanceof Error ? e.message : "We couldn’t place your order. Please try again.");
      setBusy(false);
    }
  };

  if (ready && s.lines.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="serif text-[40px]">Your bag is empty.</p>
        <Link href="/shop" className="btn btn-dark mt-8">
          Continue shopping
        </Link>
      </div>
    );
  }

  const input = (k: keyof Customer, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, optional = false) => (
    <div>
      <label htmlFor={`co-${k}`} className="label">
        {label} {optional && <span className="font-normal text-smoke">(optional)</span>}
      </label>
      <input id={`co-${k}`} value={c[k]} onChange={set(k)} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k] ? `co-${k}-err` : undefined} className="field" {...props} />
      {errors[k] && (
        <p id={`co-${k}-err`} className="err">
          {errors[k]}
        </p>
      )}
    </div>
  );

  const StepHead = ({ n, title, done, onEdit }: { n: number; title: string; done: boolean; onEdit?: () => void }) => (
    <div className="flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-4">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[12px] ${done ? "border-graphite bg-graphite text-bone" : step === n ? "border-graphite" : "border-line text-smoke"}`}>
          {done ? "✓" : n}
        </span>
        <span className={`serif text-[28px] ${step < n ? "text-smoke" : ""}`}>{title}</span>
      </h2>
      {done && onEdit && (
        <button type="button" onClick={onEdit} className="text-[13px] underline underline-offset-4 hover:opacity-60">
          Edit
        </button>
      )}
    </div>
  );

  const country = COUNTRIES.find((x) => x.code === c.country);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
      {/* Mobile summary toggle */}
      <div className="border border-line bg-paper lg:hidden">
        <button type="button" onClick={() => setOpenSummary((v) => !v)} aria-expanded={openSummary} aria-controls="mobile-summary" className="flex w-full items-center justify-between px-5 py-4 text-[14px]">
          <span>{openSummary ? "Hide" : "Show"} order summary ({s.count})</span>
          <span className="font-mono">{money(s.total, s.currency)}</span>
        </button>
        <div id="mobile-summary" hidden={!openSummary} className="border-t border-line px-5 pb-5">
          <LineItems s={s} editable={false} />
          <Totals s={s} stage="checkout" />
        </div>
      </div>

      <div className="space-y-6">
        {cancelled && (
          <p role="status" className="border border-amber/50 bg-paper px-5 py-4 text-[14px]">
            Payment was cancelled. Your bag is saved, so you can try again whenever you’re ready.
          </p>
        )}

        {/* Step 1 */}
        <section className="border border-line bg-paper p-6 sm:p-8" aria-label="Contact and delivery details">
          <StepHead n={1} title={s.physical ? "Contact & delivery" : "Your details"} done={step > 1} onEdit={() => setStep(1)} />
          {step === 1 ? (
            <form onSubmit={continueDetails} noValidate className="mt-8 space-y-5">
              {input("email", "Email", { type: "email", autoComplete: "email", maxLength: 160 })}
              <label className="flex items-center gap-3 text-[14px]">
                <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="h-4 w-4 accent-graphite" />
                Send me letters from the atelier (new perfumes, seasonal editions)
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                {input("firstName", "First name", { autoComplete: "given-name", maxLength: 60 })}
                {input("lastName", "Last name", { autoComplete: "family-name", maxLength: 60 })}
              </div>
              <div>
                <label htmlFor="co-country" className="label">
                  Country / region
                </label>
                <select id="co-country" value={c.country} onChange={set("country")} autoComplete="country" className="field">
                  {COUNTRIES.map((x) => (
                    <option key={x.code} value={x.code}>
                      {x.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[12px] text-smoke">Prices are charged in {s.currency}. Changing country updates your total.</p>
              </div>
              {s.physical && (
                <>
                  {input("address1", "Address", { autoComplete: "address-line1", maxLength: 120 })}
                  {input("address2", "Apartment, suite, etc.", { autoComplete: "address-line2", maxLength: 120 }, true)}
                  <div className="grid gap-5 sm:grid-cols-3">
                    {input("city", "City", { autoComplete: "address-level2", maxLength: 80 })}
                    {c.country === "US" ? (
                      <div>
                        <label htmlFor="co-region" className="label">
                          State
                        </label>
                        <select id="co-region" value={c.region} onChange={set("region")} autoComplete="address-level1" aria-invalid={Boolean(errors.region)} aria-describedby={errors.region ? "co-region-err" : undefined} className="field">
                          <option value="">Select…</option>
                          {US_STATES.map((x) => (
                            <option key={x.code} value={x.code}>
                              {x.name}
                            </option>
                          ))}
                        </select>
                        {errors.region && (
                          <p id="co-region-err" className="err">
                            {errors.region}
                          </p>
                        )}
                      </div>
                    ) : (
                      input("region", "Region / county", { autoComplete: "address-level1", maxLength: 80 }, true)
                    )}
                    {!NO_POSTAL.includes(c.country) && input("postal", c.country === "US" ? "ZIP code" : "Postal code", { autoComplete: "postal-code", maxLength: 12 })}
                  </div>
                  {input("phone", "Phone (for the courier)", { type: "tel", autoComplete: "tel", maxLength: 20 })}
                </>
              )}
              <button type="submit" className="btn btn-dark w-full sm:w-auto">
                {s.physical ? "Continue to delivery" : "Continue to payment"}
              </button>
            </form>
          ) : (
            <div className="mt-4 pl-12 text-[14px] text-smoke">
              <p>{c.email}</p>
              {s.physical && (
                <p>
                  {c.firstName} {c.lastName}, {c.address1}
                  {c.address2 ? `, ${c.address2}` : ""}, {c.city} {c.region} {c.postal}, {country?.name}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Step 2 */}
        {s.physical && (
          <section className="border border-line bg-paper p-6 sm:p-8" aria-label="Delivery method">
            <StepHead n={2} title="Delivery" done={step > 2} onEdit={() => setStep(2)} />
            {step === 2 && (
              <div className="mt-8 space-y-6">
                <fieldset>
                  <legend className="sr-only">Delivery method</legend>
                  <div className="space-y-3">
                    {s.methods.map((m) => (
                      <label key={m.id} className={`flex cursor-pointer items-center justify-between gap-4 border px-5 py-4 transition-colors ${state.shipping === m.id ? "border-graphite" : "border-line hover:border-smoke"}`}>
                        <span className="flex items-center gap-4">
                          <input type="radio" name="ship" value={m.id} checked={state.shipping === m.id} onChange={() => cart.setShipping(m.id)} className="h-4 w-4 accent-graphite" />
                          <span>
                            <span className="block text-[15px] font-medium">
                              {m.name} <span className="font-normal text-smoke">· {m.carrier}</span>
                            </span>
                            <span className="block text-[13px] text-smoke">Arrives {deliveryWindow(m.days)}</span>
                          </span>
                        </span>
                        <span className="font-mono text-[14px]">{m.price === 0 ? "Free" : money(m.price, s.currency)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="space-y-6 border-t border-line pt-6">
                  <SamplesPicker s={s} />
                  <GiftWrapField s={s} />
                </div>
                <button type="button" onClick={() => setStep(3)} className="btn btn-dark w-full sm:w-auto">
                  Continue to payment
                </button>
              </div>
            )}
            {step > 2 && s.shipping && (
              <p className="mt-4 pl-12 text-[14px] text-smoke">
                {s.shipping.name} · {s.shipping.carrier} · {s.shipping.price === 0 ? "Free" : money(s.shipping.price, s.currency)}
                {s.samples.length ? ` · Samples: ${s.samples.map((x) => x.name).join(", ")}` : ""}
                {s.giftWrap ? " · Gift wrapped" : ""}
              </p>
            )}
          </section>
        )}

        {/* Step 3 */}
        <section className="border border-line bg-paper p-6 sm:p-8" aria-label="Payment">
          <StepHead n={s.physical ? 3 : 2} title="Payment" done={false} />
          {step === 3 && (
            <div className="mt-8 space-y-6">
              {stripe ? (
                <p className="text-[15px] text-smoke">You’ll pay on Stripe’s secure page with a card, Apple Pay, Google Pay or Link. We never see your card details.</p>
              ) : (
                <div className="border border-dashed border-amber/60 bg-bone p-5 text-[14px]">
                  <p className="font-medium">Demo store: no payment is taken.</p>
                  <p className="mt-1 text-smoke">Placing an order creates a real confirmation, credit codes and tracking, stored only in this browser. In live mode this button opens Stripe Checkout.</p>
                </div>
              )}
              {s.samplesAllowed && s.samples.length < 2 && (
                <p className="text-[13px] text-amber">
                  You haven’t chosen all your free samples yet.{" "}
                  <button type="button" onClick={() => setStep(2)} className="underline underline-offset-4">
                    Choose now
                  </button>
                </p>
              )}
              <div>
                <label className="flex items-start gap-3 text-[14px]">
                  <input
                    id="co-terms"
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => {
                      setTerms(e.target.checked);
                      setTermsErr(false);
                    }}
                    aria-invalid={termsErr}
                    aria-describedby={termsErr ? "co-terms-err" : undefined}
                    className="mt-0.5 h-4 w-4 accent-graphite"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/policies#terms" target="_blank" className="underline underline-offset-4">
                      terms of sale
                    </Link>{" "}
                    and{" "}
                    <Link href="/policies#privacy" target="_blank" className="underline underline-offset-4">
                      privacy policy
                    </Link>
                    .
                  </span>
                </label>
                {termsErr && (
                  <p id="co-terms-err" className="err">
                    Please accept the terms to continue.
                  </p>
                )}
              </div>
              {(serverErr || s.errors.length > 0) && (
                <p role="alert" className="err">
                  {serverErr || s.errors[0]}
                </p>
              )}
              <button type="button" onClick={placeOrder} disabled={busy || s.errors.length > 0} className="btn btn-dark w-full">
                {busy ? "Placing your order…" : stripe ? `Pay ${money(s.total, s.currency)} securely` : `Place demo order · ${money(s.total, s.currency)}`}
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Summary */}
      <aside aria-label="Order summary" className="hidden lg:sticky lg:top-[calc(var(--header)+var(--bar)+24px)] lg:block lg:self-start">
        <div className="border border-line bg-paper p-8">
          <h2 className="serif text-[28px]">Order summary</h2>
          <div data-lenis-prevent className="max-h-[38vh] overflow-y-auto">
            <LineItems s={s} editable={false} />
          </div>
          <div className="border-t border-line pt-6">
            <CodeField s={s} />
          </div>
          <div className="mt-6 border-t border-line pt-6">
            <Totals s={s} stage="checkout" />
          </div>
        </div>
        <p className="mt-4 text-center text-[12px] text-smoke">
          Need help?{" "}
          <Link href="/contact" className="underline underline-offset-4">
            Contact us
          </Link>{" "}
          · Free returns within 30 days
        </p>
      </aside>
      <div className="lg:hidden">
        <CodeField s={s} />
      </div>
    </div>
  );
}
