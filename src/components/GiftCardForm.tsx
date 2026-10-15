"use client";

import { useEffect, useRef, useState } from "react";
import { cart } from "@/lib/commerce/cart";
import { GIFT_CARD_USD } from "@/lib/data/products";
import { flyToCart } from "@/lib/fly";
import { useMoney } from "./Price";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function GiftCardForm() {
  const { fmt, local } = useMoney();
  const [amount, setAmount] = useState(100);
  const [f, setF] = useState({ to: "", email: "", from: "", message: "", date: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [range, setRange] = useState({ min: "", max: "" });
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    const max = new Date(now);
    max.setFullYear(now.getFullYear() + 1);
    setRange({ min: iso(now), max: iso(max) });
    setF((v) => ({ ...v, date: v.date || iso(now) }));
  }, []);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!f.to.trim()) err.to = "Who is it for?";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) err.email = "Please enter the recipient’s email address.";
    if (!f.from.trim()) err.from = "Please add your name.";
    if (!f.date || (range.min && f.date < range.min) || (range.max && f.date > range.max)) err.date = "Choose a date within the next year.";
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`gc-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    cart.add({ slug: "gift-card", variant: "gc", qty: 1, gift: { amount, to: f.to.trim(), email: f.email.trim(), from: f.from.trim(), message: f.message.trim().slice(0, 300), date: f.date } });
    flyToCart(card.current);
    setDone(true);
    window.setTimeout(() => setDone(false), 2500);
  };

  const field = (k: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`gc-${k}`} className="label">
        {label}
      </label>
      <input id={`gc-${k}`} value={f[k]} onChange={set(k)} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k] ? `gc-${k}-err` : undefined} className="field" {...props} />
      {errors[k] && (
        <p id={`gc-${k}-err`} className="err">
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
      <div ref={card} className="relative flex aspect-[1.6/1] flex-col justify-between overflow-hidden bg-graphite p-7 text-bone shadow-card sm:p-9">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/gift-wrapped-md.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="relative flex items-start justify-between">
          <span className="serif text-[26px] tracking-[0.18em]">SOLVANE</span>
          <span className="eyebrow text-bone/70">Gift card</span>
        </div>
        <div className="relative">
          <p className="serif text-[56px] leading-none sm:text-[72px]">{fmt(local(amount))}</p>
          <p className="mt-3 text-[14px] text-bone/75">
            {f.to ? `For ${f.to}` : "For someone you love"}
            {f.from ? ` · from ${f.from}` : ""}
          </p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="space-y-5">
        <fieldset>
          <legend className="label">Amount</legend>
          <div className="mt-1 grid grid-cols-4 gap-2" role="radiogroup">
            {GIFT_CARD_USD.map((a) => (
              <button key={a} type="button" role="radio" aria-checked={amount === a} onClick={() => setAmount(a)} className={`chip justify-center !rounded-none font-mono !text-[13px] ${amount === a ? "is-on" : ""}`}>
                {fmt(local(a))}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-5 sm:grid-cols-2">
          {field("to", "Recipient’s name", { autoComplete: "off", maxLength: 60 })}
          {field("email", "Recipient’s email", { type: "email", autoComplete: "off", maxLength: 160 })}
          {field("from", "Your name", { autoComplete: "name", maxLength: 60 })}
          {field("date", "Delivery date", { type: "date", min: range.min, max: range.max })}
        </div>
        <div>
          <label htmlFor="gc-message" className="label">
            Message <span className="font-normal text-smoke">(optional)</span>
          </label>
          <textarea id="gc-message" value={f.message} onChange={set("message")} rows={3} maxLength={300} className="field resize-none" />
        </div>
        <button type="submit" className="btn btn-dark w-full">
          {done ? "Added to your bag ✓" : `Add gift card · ${fmt(local(amount))}`}
        </button>
        <p className="text-[13px] text-smoke">Delivered by email at 8 am on the chosen date. Valid for three years on everything, including the Discovery Set.</p>
      </form>
    </div>
  );
}
