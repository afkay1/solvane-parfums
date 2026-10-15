"use client";

import { useState } from "react";
import { money } from "@/lib/commerce/markets";
import { trackingSteps, type Order } from "@/lib/commerce/order";
import { getCountry } from "@/lib/commerce/markets";
import { LineItems, Totals } from "../cart/parts";

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard blocked: the code is visible anyway */
        }
      }}
      className="text-[12px] underline underline-offset-4 hover:opacity-60"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

export function Vouchers({ order }: { order: Order }) {
  if (!order.vouchers.length) return null;
  return (
    <div className="border border-amber/50 bg-paper p-6">
      <p className="eyebrow text-amber">Your codes</p>
      <ul className="mt-4 space-y-4">
        {order.vouchers.map((v) => (
          <li key={v.code} className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 first:border-0 first:pt-0">
            <div>
              <p className="text-[14px] font-medium">
                {v.note} · {money(v.amount, v.currency)}
              </p>
              <p className="mt-1 select-all font-mono text-[15px] tracking-[0.04em]">{v.code}</p>
            </div>
            <CopyCode code={v.code} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] text-smoke">Also sent by email. Enter a code in the “Promo, credit or gift card” field at checkout.</p>
    </div>
  );
}

export function Timeline({ order }: { order: Order }) {
  const steps = trackingSteps(order);
  const current = steps.filter((s) => s.done).length - 1;
  return (
    <ol className="relative space-y-6">
      {steps.map((s, i) => (
        <li key={s.id} className="relative grid grid-cols-[28px_1fr] gap-4">
          {i < steps.length - 1 && <span aria-hidden className={`absolute left-[13px] top-7 h-[calc(100%+4px)] w-px ${s.done && steps[i + 1].done ? "bg-graphite" : "bg-line"}`} />}
          <span aria-hidden className={`relative z-[1] mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${s.done ? "border-graphite bg-graphite text-bone" : "border-line bg-bone text-smoke"}`}>
            {s.done ? "✓" : i + 1}
          </span>
          <div>
            <p className={`text-[15px] ${i === current ? "font-medium" : s.done ? "" : "text-smoke"}`}>
              {s.label}
              {i === current && <span className="sr-only"> (current status)</span>}
            </p>
            <p className="text-[13px] text-smoke">
              {s.detail}
              {s.id === "delivered" && !s.done ? ` Expected around ${new Date(s.at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}.` : ""}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function OrderDetails({ order }: { order: Order }) {
  const s = order.summary;
  const c = order.customer;
  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
      <div className="space-y-10">
        <Vouchers order={order} />
        <section aria-labelledby="items-h">
          <h2 id="items-h" className="serif text-[28px]">
            Items
          </h2>
          <LineItems s={s} editable={false} />
          {(s.samples.length > 0 || s.giftWrap) && (
            <div className="border-t border-line pt-4 text-[14px] text-smoke">
              {s.samples.length > 0 && <p>Free samples: {s.samples.map((x) => x.name).join(", ")}</p>}
              {s.giftWrap && <p>Gift wrapped{order.giftMessage ? ` · “${order.giftMessage}”` : ""}</p>}
            </div>
          )}
        </section>
      </div>
      <aside className="space-y-8">
        <div className="border border-line bg-paper p-6">
          <Totals s={s} stage="checkout" />
          <p className="mt-4 text-[12px] text-smoke">{order.payment === "demo" ? "Demo order · no payment taken" : order.status === "paid" ? "Paid with Stripe" : "Awaiting payment"}</p>
        </div>
        {s.physical && (
          <div>
            <p className="eyebrow text-smoke">Delivering to</p>
            <p className="mt-2 text-[15px]">
              {c.firstName} {c.lastName}
              <br />
              {c.address1}
              {c.address2 ? `, ${c.address2}` : ""}
              <br />
              {c.city} {c.region} {c.postal}
              <br />
              {getCountry(c.country).name}
            </p>
          </div>
        )}
        <div>
          <p className="eyebrow text-smoke">Status</p>
          <div className="mt-4">
            <Timeline order={order} />
          </div>
        </div>
      </aside>
    </div>
  );
}
