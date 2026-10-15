import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ui";
import { COUNTRIES, MARKETS, money, type MarketId } from "@/lib/commerce/markets";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: "Solvane delivery times, costs and free-shipping thresholds for the US, UK, EU, UAE and international orders, plus our 30-day returns policy.",
  alternates: { canonical: "/shipping-returns" },
};

const ORDER: MarketId[] = ["US", "UK", "EU", "AE", "INTL"];
const TAX: Record<string, string> = {
  "us-sales": "Sales tax added at checkout",
  "vat-included": "VAT included in prices",
  "duties-included": "Duties & taxes prepaid by us",
};

export default function ShippingPage() {
  return (
    <>
      <PageHead
        crumbs={[{ name: "Shipping & returns", path: "/shipping-returns" }]}
        eyebrow="Help"
        title="Shipping & returns."
        text="Every order is packed by hand in our atelier in Grasse. Orders placed before 2 pm (Paris time) on a business day leave the same day."
      />
      <section className="sec-bone pb-24">
        <div className="wrap">
          <h2 className="serif h3">Delivery by destination</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-[14px]">
              <caption className="sr-only">Shipping costs, delivery times and free-shipping thresholds by destination</caption>
              <thead>
                <tr className="border-b border-graphite">
                  {["Destination", "Standard", "Express", "Free standard over", "Taxes"].map((h) => (
                    <th key={h} scope="col" className="eyebrow py-3 pr-6 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDER.map((id) => {
                  const m = MARKETS[id];
                  const [std, exp] = m.methods;
                  const countries = COUNTRIES.filter((c) => c.market === id).map((c) => c.name);
                  return (
                    <tr key={id} className="border-b border-line align-top">
                      <th scope="row" className="py-5 pr-6 font-normal">
                        <span className="serif block text-[22px]">{m.name}</span>
                        {id === "EU" || id === "INTL" ? <span className="mt-1 block max-w-xs text-[12px] text-smoke">{countries.join(", ")}</span> : null}
                      </th>
                      <td className="py-5 pr-6">
                        {money(std.price, m.currency)}
                        <span className="block text-[12px] text-smoke">
                          {std.days[0]}–{std.days[1]} business days · {std.carrier}
                        </span>
                      </td>
                      <td className="py-5 pr-6">
                        {money(exp.price, m.currency)}
                        <span className="block text-[12px] text-smoke">
                          {exp.days[0] === exp.days[1] ? `${exp.days[0]} business day` : `${exp.days[0]}–${exp.days[1]} business days`} · {exp.carrier}
                        </span>
                      </td>
                      <td className="py-5 pr-6 font-mono">{money(m.freeOver, m.currency)}</td>
                      <td className="py-5 text-smoke">{TAX[m.taxMode]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-6 max-w-3xl text-[14px] text-smoke">
            The Discovery Set and sample-only orders always ship free. Digital gift cards are sent by email. Perfume is shipped as a limited-quantity dangerous good, so we cannot deliver to PO boxes or by air to a few remote islands; we’ll contact you if that applies.
          </p>
        </div>
      </section>

      <section className="sec-stone py-24">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
          <h2 className="serif h2">Returns</h2>
          <div className="prose-sv lead text-smoke">
            <p>
              <strong className="font-medium text-graphite">30 days, free.</strong> Return unopened full bottles, candles and Discovery Sets within 30 days of delivery for a full refund. We send a prepaid label for the US, UK and EU; elsewhere we refund return postage up to {money(20, "USD")}.
            </p>
            <p>
              <strong className="font-medium text-graphite">Try the tester first.</strong> Every 50 ml and 100 ml bottle ships with a sealed 2 ml of the same perfume. Wear the tester for a day or two: if it isn’t for you, send the bottle back still sealed.
            </p>
            <p>
              <strong className="font-medium text-graphite">Damaged or faulty?</strong> Send us a photo within 14 days and we’ll replace it straight away, no return needed.
            </p>
            <p>
              Refunds go to your original payment method within 5 business days of the parcel reaching us. To start a return, email us your order number or use the{" "}
              <Link href="/contact" className="underline underline-offset-4">
                contact form
              </Link>
              . You can follow any order on the{" "}
              <Link href="/track" className="underline underline-offset-4">
                tracking page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
