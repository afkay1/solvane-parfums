import type { Metadata } from "next";
import Link from "next/link";
import Gallery from "@/components/product/Gallery";
import BuyBox from "@/components/product/BuyBox";
import Reviews from "@/components/product/Reviews";
import ImageReveal from "@/components/ImageReveal";
import Reveal from "@/components/Reveal";
import Stars from "@/components/Stars";
import TextReveal from "@/components/TextReveal";
import Price from "@/components/Price";
import JsonLd from "@/components/JsonLd";
import { Accordion, Breadcrumbs } from "@/components/ui";
import { DISCOVERY, FAMILIES, PERFUMES } from "@/lib/data/products";
import { FAQ_GROUPS } from "@/lib/data/brand";
import { faqLd, productLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "The Discovery Set: all eight perfumes, $38 back as credit",
  description: "Ten 2 ml vials: all eight Solvane eaux de parfum plus two seasonal editions. Free shipping, and the full price comes back as credit on any 50 ml or 100 ml bottle.",
  alternates: { canonical: "/discovery-set" },
  openGraph: { images: [{ url: DISCOVERY.image.src, alt: DISCOVERY.image.alt }] },
};

const SEASONAL = [
  { name: "Thé Noir", text: "Smoky black tea and dried fig", color: "#5A4636" },
  { name: "Bois d’Hiver", text: "Cedar and frost-dried juniper", color: "#9C8F7A" },
];

export default function DiscoveryPage() {
  const faqs = FAQ_GROUPS.find((g) => g.id === "discovery")?.items ?? [];
  return (
    <>
      <JsonLd data={productLd(DISCOVERY)} />
      <JsonLd data={faqLd(faqs)} />

      <section className="sec-bone pt-[calc(var(--header)+var(--bar)+24px)]">
        <div className="wrap">
          <Breadcrumbs items={[{ name: "Shop", path: "/shop" }, { name: "Discovery Set", path: "/discovery-set" }]} />
        </div>
        <div className="wrap mt-8 grid gap-10 pb-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16 xl:gap-24">
          <Gallery images={DISCOVERY.gallery} name={DISCOVERY.name} />
          <div>
            <p className="eyebrow text-smoke">Start here · 10 × 2 ml</p>
            <h1 className="serif h1 mt-3">The Discovery Set</h1>
            <p className="serif mt-2 text-[24px] italic text-smoke">{DISCOVERY.tagline}</p>
            <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-[13px] hover:underline">
              <Stars value={DISCOVERY.rating.value} />
              <span className="font-mono text-smoke">
                {DISCOVERY.rating.value} · {DISCOVERY.rating.count} reviews
              </span>
            </a>
            <p className="mt-6 text-[15px] leading-relaxed text-smoke">{DISCOVERY.description[0]}</p>
            <div className="mt-6 border border-amber/40 bg-paper p-5">
              <p className="text-[15px] font-medium">
                Your <Price usd={DISCOVERY.variants[0].usd} /> comes back as credit
              </p>
              <p className="mt-1 text-[14px] text-smoke">A personal code arrives with your order confirmation. Use it on any 50 ml or 100 ml bottle within 60 days.</p>
            </div>
            <div className="mt-8 border-t border-line pt-8">
              <BuyBox product={DISCOVERY} />
            </div>
            <Accordion className="mt-10" items={[{ title: "What’s in the box", body: <ul className="list-disc space-y-1 pl-5">{DISCOVERY.specs?.map((s) => <li key={s}>{s}</li>)}</ul> }]} />
          </div>
        </div>
      </section>

      {/* Inside */}
      <section className="sec-stone py-24 sm:py-32">
        <div className="wrap">
          <div className="max-w-2xl">
            <p className="eyebrow text-smoke">Inside</p>
            <TextReveal text="Ten vials, ten moods." className="serif h2 mt-4" />
          </div>
          <Reveal as="ol" className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5" stagger={0.05}>
            {PERFUMES.map((p, i) => (
              <li key={p.slug} data-reveal className="bg-stone p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] text-smoke">{String(i + 1).padStart(2, "0")}</span>
                  <span className="h-8 w-3 rounded-full border border-black/10" style={{ background: p.color }} aria-hidden />
                </div>
                <Link href={`/products/${p.slug}`} className="serif mt-6 block text-[26px] leading-tight hover:underline">
                  {p.name}
                </Link>
                <p className="mt-1 text-[13px] text-smoke">{p.family ? FAMILIES[p.family].short : ""} · {p.short}</p>
              </li>
            ))}
            {SEASONAL.map((s, i) => (
              <li key={s.name} data-reveal className="bg-paper p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] text-amber">{String(9 + i).padStart(2, "0")} · Seasonal</span>
                  <span className="h-8 w-3 rounded-full border border-black/10" style={{ background: s.color }} aria-hidden />
                </div>
                <p className="serif mt-6 text-[26px] leading-tight">{s.name}</p>
                <p className="mt-1 text-[13px] text-smoke">Autumn edition · {s.text}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* How to try */}
      <section className="sec-bone py-24 sm:py-32">
        <div className="wrap grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <ImageReveal image={DISCOVERY.gallery[1]} className="aspect-[3/2]" sizes="(min-width: 1024px) 45vw, 100vw" />
          <div>
            <p className="eyebrow text-smoke">How to try perfume</p>
            <TextReveal text="Give each scent a full day." className="serif h2 mt-4" />
            <Reveal as="ol" className="mt-10 space-y-7" stagger={0.1}>
              {[
                ["Start on paper", "Spray the blotters to narrow it down to three or four favourites. Smell them again an hour later."],
                ["Move to skin", "Wear one per day on your wrist. Perfume changes with your skin’s warmth and chemistry."],
                ["Notice the afternoon", "The base notes you smell after four hours are what you’ll live with. Choose the one you keep sniffing."],
                ["Use your credit", "Enter your code at checkout on a 50 ml or 100 ml. It works for 60 days."],
              ].map(([t, d], i) => (
                <li key={t} data-reveal className="grid grid-cols-[44px_1fr] gap-4">
                  <span className="font-mono text-[13px] text-amber">0{i + 1}</span>
                  <span>
                    <span className="block text-[17px] font-medium">{t}</span>
                    <span className="block text-smoke">{d}</span>
                  </span>
                </li>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <Reviews product={DISCOVERY} />

      <section className="sec-stone py-24">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-24">
          <div>
            <p className="eyebrow text-smoke">Questions</p>
            <p className="serif h3 mt-4">About the set</p>
            <Link href="/faq" className="link-arrow mt-6">
              All FAQs <span aria-hidden>→</span>
            </Link>
          </div>
          <Accordion items={faqs.map((f) => ({ title: f.q, body: <p>{f.a}</p> }))} />
        </div>
      </section>
    </>
  );
}
