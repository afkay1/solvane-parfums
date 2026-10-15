"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { cart, useCart } from "@/lib/commerce/cart";
import { money } from "@/lib/commerce/markets";
import { MAX_QTY, MAX_SAMPLES, SAMPLE_CHOICES, type PricedLine, type Summary } from "@/lib/commerce/pricing";
import Img from "../Img";

export function FreeShippingBar({ s }: { s: Summary }) {
  if (s.freeShippingRemaining === null) {
    if (!s.physical) return null;
    return <p className="text-[13px] text-smoke">Your order ships free.</p>;
  }
  const pct = Math.min(100, ((s.freeOver - s.freeShippingRemaining) / s.freeOver) * 100);
  return (
    <div>
      <p className="text-[13px]" aria-live="polite">
        {s.freeShippingRemaining > 0 ? (
          <>
            You’re <strong className="font-medium">{money(s.freeShippingRemaining, s.currency)}</strong> away from free shipping.
          </>
        ) : (
          <>You’ve unlocked free standard shipping.</>
        )}
      </p>
      <div className="mt-2 h-[3px] w-full overflow-hidden bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Progress to free shipping">
        <div className="h-full bg-amber transition-[width] duration-700 ease-lux" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function QtyStepper({ line, small = false }: { line: PricedLine; small?: boolean }) {
  const h = small ? "h-8" : "h-10";
  return (
    <div className={`inline-flex ${h} items-center border border-line`}>
      <button type="button" onClick={() => cart.setQty(line.key, line.qty - 1)} aria-label={`Decrease quantity of ${line.name}`} className={`${h} w-8 text-[16px] hover:bg-stone`}>
        −
      </button>
      <span className="w-7 text-center font-mono text-[13px]" aria-live="polite" aria-label={`Quantity ${line.qty}`}>
        {line.qty}
      </span>
      <button
        type="button"
        onClick={() => cart.setQty(line.key, line.qty + 1)}
        disabled={line.qty >= Math.min(MAX_QTY, line.stock)}
        aria-label={`Increase quantity of ${line.name}`}
        className={`${h} w-8 text-[16px] hover:bg-stone disabled:opacity-30`}
      >
        +
      </button>
    </div>
  );
}

export function LineItems({ s, editable = true, onNavigate }: { s: Summary; editable?: boolean; onNavigate?: () => void }) {
  return (
    <ul className="divide-y divide-line">
      {s.lines.map((l) => (
        <li key={l.key} className="flex gap-4 py-5">
          <Link href={l.href} onClick={onNavigate} className="shrink-0" tabIndex={-1} aria-hidden>
            <Img image={l.image} className="aspect-[4/5] w-[76px]" sizes="76px" decorative />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={l.href} onClick={onNavigate} className="serif text-[21px] leading-tight hover:underline">
                  {l.name}
                </Link>
                <p className="mt-0.5 truncate text-[13px] text-smoke">{l.variantLabel}</p>
                {l.gift && <p className="mt-0.5 text-[12px] text-smoke">To {l.gift.email} on {l.gift.date}</p>}
              </div>
              <p className="shrink-0 font-mono text-[13px]">{money(l.total, s.currency)}</p>
            </div>
            <div className="mt-auto flex items-center justify-between pt-3">
              {editable ? <QtyStepper line={l} small /> : <span className="text-[13px] text-smoke">Qty {l.qty}</span>}
              {editable && (
                <button type="button" onClick={() => cart.remove(l.key)} className="text-[12px] text-smoke underline-offset-4 hover:text-graphite hover:underline">
                  Remove
                </button>
              )}
            </div>
            {l.stock <= 6 && l.kind !== "giftcard" && <p className="mt-2 text-[12px] text-amber">Only {l.stock} left</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function SamplesPicker({ s }: { s: Summary }) {
  const { samples } = useCart();
  if (!s.samplesAllowed) return null;
  return (
    <fieldset>
      <legend className="flex w-full items-baseline justify-between">
        <span className="text-[14px] font-medium">Choose 2 free samples</span>
        <span className="font-mono text-[12px] text-smoke">
          {samples.length}/{MAX_SAMPLES}
        </span>
      </legend>
      <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {SAMPLE_CHOICES.map((p) => {
          const on = samples.includes(p.slug);
          const full = !on && samples.length >= MAX_SAMPLES;
          return (
            <button
              key={p.slug}
              type="button"
              role="checkbox"
              aria-checked={on}
              disabled={full}
              onClick={() => cart.toggleSample(p.slug)}
              className="chip shrink-0 !min-h-[34px] !px-3 text-[13px] disabled:opacity-35"
            >
              <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ background: p.color }} aria-hidden />
              {p.name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function GiftWrapField({ s }: { s: Summary }) {
  const { giftWrap, giftMessage } = useCart();
  const id = useId();
  if (!s.physical) return null;
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={giftWrap} onChange={(e) => cart.setGiftWrap(e.target.checked)} className="mt-1 h-4 w-4 accent-graphite" />
        <span>
          <span className="block text-[14px] font-medium">Gift wrap, free</span>
          <span className="block text-[13px] text-smoke">Signature box, amber ribbon, a handwritten card. No prices on the packing slip.</span>
        </span>
      </label>
      {giftWrap && (
        <div className="mt-3">
          <label htmlFor={id} className="sr-only">
            Gift message
          </label>
          <textarea
            id={id}
            value={giftMessage}
            onChange={(e) => cart.setGiftMessage(e.target.value)}
            maxLength={240}
            rows={3}
            placeholder="Your message (we’ll write it by hand)"
            className="field resize-none text-[14px]"
          />
          <p className="mt-1 text-right font-mono text-[11px] text-smoke">{giftMessage.length}/240</p>
        </div>
      )}
    </div>
  );
}

export function CodeField({ s }: { s: Summary }) {
  const { code } = useCart();
  const [value, setValue] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const id = useId();

  if (code && !s.codeError) {
    return (
      <div className="flex items-center justify-between gap-3 text-[14px]">
        <span>
          Code <span className="font-mono">{code}</span> applied
        </span>
        <button type="button" onClick={() => cart.clearCode()} className="text-[12px] text-smoke underline underline-offset-4 hover:text-graphite">
          Remove
        </button>
      </div>
    );
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr(await cart.applyCode(value));
        setBusy(false);
      }}
      noValidate
    >
      <label htmlFor={id} className="label">
        Promo, credit or gift card code
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={Boolean(err || (code && s.codeError))}
          aria-describedby={`${id}-err`}
          autoComplete="off"
          spellCheck={false}
          className="field !py-2.5 font-mono text-[14px] uppercase"
          placeholder="WELCOME10"
        />
        <button type="submit" disabled={busy || !value.trim()} className="btn btn-outline !min-h-[46px] shrink-0 !px-5">
          {busy ? "…" : "Apply"}
        </button>
      </div>
      <p id={`${id}-err`} className="err" aria-live="polite">
        {err ?? (code ? s.codeError : null)}
      </p>
    </form>
  );
}

export function Totals({ s, stage }: { s: Summary; stage: "bag" | "checkout" }) {
  const m = (n: number) => money(n, s.currency);
  const Row = ({ label, value, strong = false, muted = false }: { label: React.ReactNode; value: React.ReactNode; strong?: boolean; muted?: boolean }) => (
    <div className={`flex items-baseline justify-between gap-4 ${strong ? "text-[17px] font-medium" : "text-[14px]"} ${muted ? "text-smoke" : ""}`}>
      <dt>{label}</dt>
      <dd className={strong ? "font-mono" : "font-mono text-[13px]"}>{value}</dd>
    </div>
  );
  return (
    <dl className="space-y-2.5">
      <Row label="Subtotal" value={m(s.subtotal)} />
      {s.discount && <Row label={s.discount.label} value={`−${m(s.discount.amount)}`} />}
      {s.shipping && (
        <Row
          label={stage === "bag" ? "Shipping" : `Shipping · ${s.shipping.name}`}
          value={s.shipping.price === 0 ? "Free" : stage === "bag" ? `from ${m(s.shipping.price)}` : m(s.shipping.price)}
        />
      )}
      {s.tax.added ? (
        <Row label={s.tax.label} value={s.tax.pending ? "At checkout" : m(s.tax.amount)} muted={s.tax.pending} />
      ) : (
        <Row label={s.tax.label} value={s.tax.amount ? m(s.tax.amount) : "Included"} muted />
      )}
      {s.giftCard && <Row label="Gift card" value={`−${m(s.giftCard.amount)}`} />}
      <div className="border-t border-line pt-3">
        <Row label={stage === "bag" && s.tax.pending ? "Estimated total" : "Total"} value={`${m(s.total)} ${s.currency}`} strong />
      </div>
    </dl>
  );
}
