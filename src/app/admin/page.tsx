import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminLogin, AdminLogout } from "@/components/AdminLogin";
import { convert, getCountry, money, MARKETS, type MarketId } from "@/lib/commerce/markets";
import { isDbMode, listOrders } from "@/lib/commerce/store";
import { verifyAdmin } from "@/lib/commerce/services";
import { ALL_PRODUCTS, LOW_STOCK } from "@/lib/data/products";
import { fmtDate } from "@/lib/format";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const usd = (n: number, cur: Parameters<typeof convert>[1]) => convert(n, cur, "USD");
const fmt = (n: number) => money(Math.round(n), "USD");

export default async function AdminPage() {
  const db = isDbMode();
  const authed = !db || verifyAdmin(cookies().get("sv_admin")?.value);

  if (!authed) {
    return (
      <section className="sec-bone min-h-[80vh] pb-28 pt-[calc(var(--header)+var(--bar)+64px)]">
        <div className="wrap">
          <h1 className="serif h2 mb-10 text-center">Solvane admin</h1>
          <AdminLogin />
        </div>
      </section>
    );
  }

  const all = await listOrders();
  const now = Date.now();
  const DAY = 86_400_000;
  const paid = all.filter((o) => o.status === "paid");
  const last30 = paid.filter((o) => now - new Date(o.createdAt).getTime() < 30 * DAY);
  const revenue = last30.reduce((s, o) => s + usd(o.summary.total, o.summary.currency), 0);
  const units = last30.reduce((s, o) => s + o.summary.count, 0);
  const aov = last30.length ? revenue / last30.length : 0;

  // Daily revenue, last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * DAY);
    const key = d.toISOString().slice(0, 10);
    const v = paid.filter((o) => o.createdAt.slice(0, 10) === key).reduce((s, o) => s + usd(o.summary.total, o.summary.currency), 0);
    return { key, label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), v };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.v));

  // Best sellers by units
  const byProduct = new Map<string, { name: string; units: number; revenue: number }>();
  for (const o of last30)
    for (const l of o.summary.lines) {
      const cur = byProduct.get(l.slug) ?? { name: l.name, units: 0, revenue: 0 };
      cur.units += l.qty;
      cur.revenue += usd(l.total, o.summary.currency);
      byProduct.set(l.slug, cur);
    }
  const best = Array.from(byProduct.values()).sort((a, b) => b.units - a.units).slice(0, 7);
  const maxUnits = Math.max(1, ...best.map((b) => b.units));

  // Markets
  const byMarket = new Map<MarketId, number>();
  for (const o of last30) byMarket.set(o.summary.market, (byMarket.get(o.summary.market) ?? 0) + usd(o.summary.total, o.summary.currency));

  // Discovery Set → full bottle
  const setsSold = last30.reduce((s, o) => s + o.summary.lines.filter((l) => l.kind === "discovery").reduce((a, l) => a + l.qty, 0), 0);
  const creditsUsed = last30.filter((o) => o.summary.discount?.label === "Discovery Set credit").length;
  const welcomeUsed = last30.filter((o) => o.summary.discount?.code === "WELCOME10").length;

  const low = ALL_PRODUCTS.flatMap((p) => p.variants.filter((v) => v.stock <= LOW_STOCK).map((v) => ({ name: p.name, label: v.label, sku: v.sku, stock: v.stock })));

  const kpis = [
    { label: "Revenue · 30 days", value: fmt(revenue), note: "All markets, in USD" },
    { label: "Orders · 30 days", value: String(last30.length), note: `${units} units` },
    { label: "Average order", value: fmt(aov), note: "Incl. shipping & tax" },
    { label: "Set → bottle", value: setsSold ? `${Math.round((creditsUsed / setsSold) * 100)}%` : "–", note: `${creditsUsed} credits used / ${setsSold} sets` },
  ];

  return (
    <section className="sec-bone min-h-screen pb-28 pt-[calc(var(--header)+var(--bar)+40px)]">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-smoke">Admin</p>
            <h1 className="serif h2 mt-2">Store overview</h1>
          </div>
          {db ? <AdminLogout /> : <p className="max-w-sm border border-dashed border-amber/60 px-4 py-3 text-[13px]">Demo mode: generated sample orders. Connect a database to see real orders (see README).</p>}
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-paper p-6">
              <dt className="eyebrow text-smoke">{k.label}</dt>
              <dd className="serif mt-3 text-[40px] leading-none">{k.value}</dd>
              <dd className="mt-2 text-[12px] text-smoke">{k.note}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="border border-line bg-paper p-6">
            <p className="eyebrow text-smoke">Revenue · last 14 days</p>
            <div className="mt-6 flex h-[200px] items-end gap-1.5" role="img" aria-label="Daily revenue bar chart for the last 14 days">
              {days.map((d) => (
                <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
                  <div className="w-full bg-graphite transition-colors group-hover:bg-amber" style={{ height: `${Math.max(2, (d.v / maxDay) * 100)}%` }} />
                  <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap bg-graphite px-2 py-0.5 font-mono text-[11px] text-bone group-hover:block">{fmt(d.v)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-smoke">
              <span>{days[0].label}</span>
              <span>{days[days.length - 1].label}</span>
            </div>
          </div>
          <div className="border border-line bg-paper p-6">
            <p className="eyebrow text-smoke">Revenue by market</p>
            <ul className="mt-6 space-y-4">
              {(Object.keys(MARKETS) as MarketId[]).map((m) => {
                const v = byMarket.get(m) ?? 0;
                return (
                  <li key={m}>
                    <div className="flex justify-between text-[13px]">
                      <span>{MARKETS[m].name}</span>
                      <span className="font-mono">{revenue ? Math.round((v / revenue) * 100) : 0}%</span>
                    </div>
                    <div className="mt-1.5 h-[4px] bg-line">
                      <div className="h-full bg-amber" style={{ width: `${revenue ? (v / revenue) * 100 : 0}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-[12px] text-smoke">WELCOME10 used on {welcomeUsed} orders.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="border border-line bg-paper p-6">
            <p className="eyebrow text-smoke">Best sellers · 30 days</p>
            <ul className="mt-6 space-y-4">
              {best.map((b) => (
                <li key={b.name} className="grid grid-cols-[140px_1fr_90px] items-center gap-4 text-[13px]">
                  <span className="truncate">{b.name}</span>
                  <span className="h-[6px] bg-line">
                    <span className="block h-full bg-graphite" style={{ width: `${(b.units / maxUnits) * 100}%` }} />
                  </span>
                  <span className="text-right font-mono">
                    {b.units} · {fmt(b.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-line bg-paper p-6">
            <p className="eyebrow text-smoke">Low stock (≤ {LOW_STOCK})</p>
            {low.length === 0 ? (
              <p className="mt-6 text-smoke">Everything is well stocked.</p>
            ) : (
              <ul className="mt-6 divide-y divide-line">
                {low.map((l) => (
                  <li key={l.sku} className="flex items-center justify-between py-3 text-[14px]">
                    <span>
                      {l.name} <span className="text-smoke">· {l.label}</span>
                      <span className="block font-mono text-[11px] text-smoke">{l.sku}</span>
                    </span>
                    <span className={`font-mono ${l.stock <= 3 ? "text-[#a23b2a]" : "text-amber"}`}>{l.stock} left</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 border border-line bg-paper p-6">
          <p className="eyebrow text-smoke">Recent orders</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-graphite">
                  {["Order", "Date", "Customer", "Ship to", "Items", "Total", "Status"].map((h) => (
                    <th key={h} scope="col" className="eyebrow py-3 pr-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {all.slice(0, 15).map((o) => (
                  <tr key={o.ref} className="border-b border-line">
                    <td className="py-3 pr-4 font-mono">{o.ref}</td>
                    <td className="py-3 pr-4">{fmtDate(o.createdAt, { day: "numeric", month: "short" })}</td>
                    <td className="py-3 pr-4">
                      {o.customer.firstName} {o.customer.lastName}
                    </td>
                    <td className="py-3 pr-4">{getCountry(o.customer.country).name}</td>
                    <td className="max-w-[240px] truncate py-3 pr-4">{o.summary.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}</td>
                    <td className="py-3 pr-4 font-mono">{money(o.summary.total, o.summary.currency)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 font-mono text-[11px] ${o.status === "paid" ? "bg-stone" : o.status === "cancelled" ? "bg-[#f3dcd6] text-[#a23b2a]" : "bg-[#f5e7d3] text-amber"}`}>{o.status.replace("_", " ")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
