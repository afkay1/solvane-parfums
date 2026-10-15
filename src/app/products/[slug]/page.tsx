import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/product/Gallery";
import BuyBox from "@/components/product/BuyBox";
import Reviews from "@/components/product/Reviews";
import { NotesPyramid, Scales } from "@/components/product/NotesPyramid";
import ImageReveal from "@/components/ImageReveal";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import Stars from "@/components/Stars";
import TextReveal from "@/components/TextReveal";
import JsonLd from "@/components/JsonLd";
import { Accordion, Breadcrumbs } from "@/components/ui";
import { CANDLES, FAMILIES, PERFUMES, getProduct, type Product } from "@/lib/data/products";
import { productLd } from "@/lib/seo";

const PAGES = [...PERFUMES, ...CANDLES];

export function generateStaticParams() {
  return PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProduct(params.slug);
  if (!p || !PAGES.includes(p)) return {};
  const what = p.kind === "candle" ? "Scented candle" : "Eau de parfum";
  return {
    title: `${p.name}: ${p.short}`,
    description: `${p.tagline} ${what} by Solvane: ${p.short}. ${p.description[0].slice(0, 110)}…`,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { images: [{ url: p.image.src, alt: p.image.alt }] },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = getProduct(params.slug);
  if (!p || !PAGES.includes(p)) notFound();
  const isPerfume = p.kind === "perfume";
  const family = p.family ? FAMILIES[p.family] : null;
  const pairs = (p.pairs ?? []).map((s) => getProduct(s)).filter((x): x is Product => Boolean(x));
  const more = isPerfume ? PERFUMES.filter((x) => x.slug !== p.slug && !p.pairs?.includes(x.slug)).slice(0, 4) : CANDLES.filter((x) => x.slug !== p.slug);
  const crumbs = isPerfume
    ? [{ name: "Shop", path: "/shop" }, { name: family?.name ?? "Fragrance", path: `/collections/${p.family}` }, { name: p.name, path: `/products/${p.slug}` }]
    : [{ name: "Shop", path: "/shop" }, { name: "Candles", path: "/shop?category=candle" }, { name: p.name, path: `/products/${p.slug}` }];

  return (
    <>
      <JsonLd data={productLd(p)} />

      <section className="sec-bone pt-[calc(var(--header)+var(--bar)+24px)]">
        <div className="wrap">
          <Breadcrumbs items={crumbs} />
        </div>
        <div className="wrap mt-8 grid gap-10 pb-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16 xl:gap-24">
          <Gallery images={p.gallery} name={p.name} />
          <div>
            <p className="eyebrow text-smoke">{isPerfume ? `Eau de parfum · ${family?.name}` : "Scented candle · 220 g"}</p>
            <h1 className="serif h1 mt-3">{p.name}</h1>
            <p className="serif mt-2 text-[24px] italic text-smoke">{p.tagline}</p>
            <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-[13px] hover:underline">
              <Stars value={p.rating.value} />
              <span className="font-mono text-smoke">
                {p.rating.value} · {p.rating.count} reviews
              </span>
            </a>
            <p className="mt-6 text-[15px] leading-relaxed text-smoke">{p.description[0]}</p>
            {p.moods && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Mood">
                {p.moods.map((m) => (
                  <li key={m} className="border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em]">
                    {m}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 border-t border-line pt-8">
              <BuyBox product={p} />
            </div>
            <Accordion
              className="mt-10"
              items={[
                ...(p.notes ? [{ title: "Notes", body: <p>Top: {p.notes.top.join(", ")}. Heart: {p.notes.heart.join(", ")}. Base: {p.notes.base.join(", ")}.</p> }] : []),
                ...(p.specs ? [{ title: "Details", body: <ul className="list-disc space-y-1 pl-5">{p.specs.map((s) => <li key={s}>{s}</li>)}</ul> }] : []),
                ...(p.ingredients
                  ? [{ title: "Ingredients", body: <><p>{p.ingredients}</p><p className="mt-3">Eau de parfum, 20–22% concentration. Vegan, never tested on animals. Bottle with 30% recycled glass and an FSC-certified beech cap.</p></> }]
                  : []),
                ...(isPerfume
                  ? [{ title: "How to wear it", body: <p>Spray once or twice on pulse points (wrists, neck, behind the ears) from about 15 cm. Don’t rub: it crushes the top notes. For a softer trail, spray into the air and walk through, or mist your hair and scarf.</p> }]
                  : [{ title: "Burning tips", body: <p>On the first light, burn for two to three hours until the wax melts to the edges, so it burns evenly. Trim the wick to 5 mm each time and never leave a lit candle unattended.</p> }]),
                {
                  title: "Delivery & returns",
                  body: (
                    <p>
                      Packed by hand in Grasse and dispatched the same business day for orders before 2 pm. Unopened items can be returned within 30 days for a full refund.{" "}
                      <Link href="/shipping-returns" className="underline underline-offset-4">
                        Shipping & returns
                      </Link>
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="sec-stone py-24 sm:py-32">
        <div className="wrap grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <ImageReveal image={p.gallery[1] ?? p.image} className="aspect-[4/5]" sizes="(min-width: 1024px) 45vw, 100vw" />
          <div>
            <p className="eyebrow text-smoke">{isPerfume ? "The story" : "For the home"}</p>
            <TextReveal text={p.tagline} className="serif h2 mt-4" />
            {p.description.slice(isPerfume ? 1 : 0).map((d) => (
              <p key={d.slice(0, 20)} className="lead mt-6 max-w-lg text-smoke">
                {d}
              </p>
            ))}
            {isPerfume && (
              <p className="mt-8 text-[14px] text-smoke">
                Composed by Camille Arnaud in Grasse. Batch of 300, aged for six weeks.{" "}
                <Link href="/atelier" className="link-u text-graphite">
                  About the atelier
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Notes & character */}
      {p.notes && (
        <section className="sec-bone py-24 sm:py-32">
          <div className="wrap">
            <div className="max-w-2xl">
              <p className="eyebrow text-smoke">{isPerfume ? "The composition" : "Scent profile"}</p>
              <TextReveal text={isPerfume ? "How it unfolds on skin." : "What it smells like."} className="serif h2 mt-4" />
            </div>
            <div className={`mt-14 grid gap-16 ${p.scales ? "lg:grid-cols-[1.6fr_1fr] lg:gap-24" : ""}`}>
              <NotesPyramid notes={p.notes} color={p.color} />
              {p.scales && (
                <div className="space-y-12">
                  <Scales scales={p.scales} />
                  {p.seasons && (
                    <div className="grid grid-cols-2 gap-6 border-t border-line pt-8">
                      <div>
                        <p className="eyebrow">Seasons</p>
                        <p className="mt-2 text-[15px] text-smoke">{p.seasons.join(", ")}</p>
                      </div>
                      <div>
                        <p className="eyebrow">Best worn</p>
                        <p className="mt-2 text-[15px] text-smoke">{p.time?.join(" & ")}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pairs well */}
      {pairs.length > 0 && (
        <section className="sec-paper border-y border-line py-24">
          <div className="wrap grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-24">
            <div>
              <p className="eyebrow text-smoke">{isPerfume ? "Layering" : "Matching perfumes"}</p>
              <p className="serif h3 mt-4">{isPerfume ? `Layer ${p.name} with…` : `Wear what your home smells of.`}</p>
              <p className="mt-4 max-w-sm text-[15px] text-smoke">
                {isPerfume
                  ? "Spray the deeper scent first, let it settle for a minute, then the lighter one on top. Our perfumes share materials, so they sit together naturally."
                  : "Each candle is built on the same raw materials as one of our perfumes."}
              </p>
            </div>
            <Reveal className="grid grid-cols-2 gap-6" stagger={0.1}>
              {pairs.map((x) => (
                <ProductCard key={x.slug} product={x} sizes="(min-width: 1024px) 30vw, 50vw" />
              ))}
            </Reveal>
          </div>
        </section>
      )}

      <Reviews product={p} />

      {/* More */}
      <section className="sec-stone py-24">
        <div className="wrap">
          <div className="flex items-end justify-between gap-6">
            <p className="serif h3">{isPerfume ? "You may also like" : "More candles"}</p>
            <Link href="/shop" className="link-arrow shrink-0">
              Shop all <span aria-hidden>→</span>
            </Link>
          </div>
          <Reveal className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4" stagger={0.08}>
            {more.map((x) => (
              <ProductCard key={x.slug} product={x} />
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
