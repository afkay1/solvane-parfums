import { ratingBreakdown, type Product } from "@/lib/data/products";
import { fmtDate } from "@/lib/format";
import Reveal from "../Reveal";
import Stars from "../Stars";

export default function Reviews({ product: p }: { product: Product }) {
  const breakdown = ratingBreakdown(p.rating);
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="sec-bone scroll-mt-32 py-24 sm:py-28">
      <div className="wrap grid gap-14 lg:grid-cols-[1fr_2fr] lg:gap-24">
        <div>
          <p className="eyebrow text-smoke">Reviews</p>
          <h2 id="reviews-title" className="serif h2 mt-4">
            {p.rating.value.toFixed(1)} <span className="text-smoke">/ 5</span>
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <Stars value={p.rating.value} size={16} />
            <span className="font-mono text-[12px] text-smoke">{p.rating.count} verified reviews</span>
          </div>
          <dl className="mt-8 space-y-2">
            {breakdown.map((n, i) => (
              <div key={i} className="grid grid-cols-[44px_1fr_36px] items-center gap-3 text-[13px]">
                <dt className="font-mono text-smoke">{5 - i} ★</dt>
                <dd className="h-[4px] bg-line">
                  <span className="block h-full bg-graphite" style={{ width: `${(n / p.rating.count) * 100}%` }} />
                </dd>
                <dd className="text-right font-mono text-smoke">{n}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 max-w-xs text-[13px] text-smoke">Reviews are collected by email from verified buyers two weeks after delivery and published unedited.</p>
        </div>
        <Reveal as="ul" className="divide-y divide-line border-y border-line" stagger={0.08}>
          {p.reviews.map((r) => (
            <li key={r.name + r.date} data-reveal className="py-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Stars value={r.rating} />
                <span className="font-mono text-[12px] text-smoke">{fmtDate(r.date)}</span>
              </div>
              <p className="serif mt-4 text-[26px] leading-tight">{r.title}</p>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-smoke">{r.body}</p>
              <p className="mt-4 text-[13px]">
                {r.name} · {r.location} <span className="text-smoke">· Verified buyer · {r.variant}</span>
              </p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
