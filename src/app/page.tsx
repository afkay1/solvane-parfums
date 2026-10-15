import Link from "next/link";
import Img from "@/components/Img";
import ImageReveal from "@/components/ImageReveal";
import Parallax from "@/components/Parallax";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import TextReveal from "@/components/TextReveal";
import Price from "@/components/Price";
import Stars from "@/components/Stars";
import JsonLd from "@/components/JsonLd";
import { Marquee, SectionHead } from "@/components/ui";
import { CANDLES, DISCOVERY, FAMILIES, PERFUMES, type FamilyId } from "@/lib/data/products";
import { INGREDIENTS, MARQUEE, NUMBERS, PROMISES } from "@/lib/data/brand";
import { itemListLd } from "@/lib/seo";
import { img } from "@/lib/types";

const QUOTES = [
  { body: "I tried every vial for a few days and chose Santal Doux. Using the credit made the set basically free.", name: "Rachel D.", place: "Boston", product: "Discovery Set" },
  { body: "An oud for people who think they know oud. Two sprays on a scarf and it was still there the next morning.", name: "Omar H.", place: "Riyadh", product: "Ombre d’Oud" },
  { body: "Most perfumes turn heavy here. This one stays crisp and clean even at 40°C.", name: "Priya S.", place: "Dubai", product: "Sol Blanc" },
];

export default function HomePage() {
  const totalReviews = [...PERFUMES, DISCOVERY, ...CANDLES].reduce((s, p) => s + p.rating.count, 0);
  return (
    <>
      <JsonLd data={itemListLd(PERFUMES)} />

      {/* Hero */}
      <section className="sec-dark relative h-[100svh] min-h-[620px] overflow-hidden">
        <Parallax image={img("home-hero", "A bottle of Solvane perfume on a stone ledge in a shaft of late-afternoon sunlight")} amount={8} priority className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" aria-hidden />
        <div className="wrap relative flex h-full flex-col justify-end pb-16 sm:pb-24">
          <p className="eyebrow text-bone/80">Eaux de parfum · Grasse, France</p>
          <TextReveal as="h1" text="Perfume, made slowly." immediate delay={0.15} className="serif h-hero mt-5 max-w-4xl" />
          <p className="lead mt-6 max-w-lg text-bone/85">Eight perfumes composed in Grasse, aged for six weeks and bottled by hand in batches of three hundred.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-light">
              Shop the collection
            </Link>
            <Link href="/scent-finder" className="btn btn-ghost-light">
              Find your scent
            </Link>
          </div>
        </div>
      </section>

      {/* Ingredient marquee */}
      <section aria-label="Ingredients we work with" className="sec-bone border-b border-line py-8 sm:py-10">
        <Marquee items={MARQUEE} />
      </section>

      {/* Collection */}
      <section className="sec-bone py-24 sm:py-32">
        <div className="wrap">
          <SectionHead eyebrow="The collection" title="Eight perfumes, one for every mood." text="Hover a bottle to see where it comes from. Every scent is an eau de parfum at 20–22%, built to last." link={{ href: "/shop", label: "Shop all" }} />
          <Reveal className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4" stagger={0.08}>
            {PERFUMES.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 2} badge={p.slug === "santal-doux" ? "Bestseller" : undefined} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* Discovery set */}
      <section className="sec-stone overflow-hidden py-24 sm:py-32">
        <div className="wrap grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <ImageReveal image={DISCOVERY.image} className="aspect-[4/5]" sizes="(min-width: 1024px) 45vw, 100vw" />
          <div>
            <p className="eyebrow text-smoke">The Discovery Set</p>
            <TextReveal text="Try all eight. Get it back as credit." className="serif h2 mt-4" />
            <p className="lead mt-6 max-w-lg text-smoke">
              Ten 2 ml vials, our eight perfumes plus two seasonal editions, for <Price usd={DISCOVERY.variants[0].usd} className="text-graphite" />. Live with each one for a few days, then use your credit code on the bottle you love.
            </p>
            <Reveal as="ol" className="mt-10 space-y-6 border-t border-line pt-8">
              {[
                ["01", "Order the set", "Free shipping, wherever you are."],
                ["02", "Wear each scent", "On skin, for a day or two. Perfume changes over hours."],
                ["03", "Choose your bottle", "Your credit code takes the set price off any 50 or 100 ml bottle."],
              ].map(([n, t, d]) => (
                <li key={n} data-reveal className="grid grid-cols-[48px_1fr] gap-4">
                  <span className="font-mono text-[13px] text-amber">{n}</span>
                  <span>
                    <span className="block text-[17px] font-medium">{t}</span>
                    <span className="block text-smoke">{d}</span>
                  </span>
                </li>
              ))}
            </Reveal>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/discovery-set" className="btn btn-dark">
                Discover the set
              </Link>
              <span className="flex items-center gap-2 text-[14px] text-smoke">
                <Stars value={DISCOVERY.rating.value} /> {DISCOVERY.rating.value} · {DISCOVERY.rating.count} reviews
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Scent families */}
      <section className="sec-bone py-24 sm:py-32">
        <div className="wrap">
          <SectionHead eyebrow="Scent families" title="Start with what you already love." link={{ href: "/collections", label: "All families" }} />
          <Reveal className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {(Object.keys(FAMILIES) as FamilyId[]).map((id) => {
              const f = FAMILIES[id];
              const members = PERFUMES.filter((p) => p.family === id);
              return (
                <Link key={id} href={`/collections/${id}`} data-reveal className="group relative block aspect-[3/4] overflow-hidden text-bone">
                  <Img image={f.image} className="absolute inset-0" imgClassName="transition-transform duration-[1.6s] ease-lux group-hover:scale-105" sizes="(min-width: 1024px) 25vw, 50vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="serif text-[30px] leading-tight">{f.name}</p>
                    <p className="mt-2 text-[13px] text-bone/80">{members.map((m) => m.name).join(" · ")}</p>
                  </div>
                </Link>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* Scent finder */}
      <section className="sec-dark relative overflow-hidden">
        <Parallax image={img("quiz-bg", "Soft morning light falling across a pale stone wall")} amount={10} className="absolute inset-0" />
        <div className="absolute inset-0 bg-graphite/55" aria-hidden />
        <div className="wrap relative flex min-h-[78vh] flex-col items-center justify-center py-28 text-center">
          <p className="eyebrow text-bone/75">The Scent Finder</p>
          <TextReveal text="Six questions. Three perfect matches." className="serif h1 mt-5 max-w-4xl" />
          <p className="lead mt-6 max-w-lg text-bone/80">No jargon, no notes to memorise. Tell us where you’d rather be and how you want to feel, and we’ll do the rest. It takes about a minute.</p>
          <Link href="/scent-finder" className="btn btn-light mt-10">
            Start the Scent Finder
          </Link>
        </div>
      </section>

      {/* Ingredients */}
      <section className="sec-paper py-24 sm:py-32">
        <div className="wrap grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <div className="lg:sticky lg:top-[calc(var(--header)+var(--bar)+32px)] lg:self-start">
            <ImageReveal image={img("home-ingredients", "Raw perfume materials laid out on travertine: bergamot, fig leaf, rose, sandalwood, vanilla, iris, vetiver, saffron, resin and black tea")} className="aspect-video" sizes="(min-width: 1024px) 45vw, 100vw" />
            <p className="mt-4 text-[13px] text-smoke">Ten of the raw materials in our eight perfumes.</p>
          </div>
          <div>
            <p className="eyebrow text-smoke">What goes in</p>
            <TextReveal text="We know where every drop comes from." className="serif h2 mt-4" />
            <p className="lead mt-6 max-w-lg text-smoke">We buy from growers and distillers we visit, and we tell you exactly where. Natural materials sit alongside safe modern molecules, which give our perfumes their clarity and staying power.</p>
            <Reveal as="ul" className="mt-10 border-t border-line" stagger={0.05}>
              {INGREDIENTS.map((it) => (
                <li key={it.name} data-reveal className="group grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-line py-4 sm:grid-cols-[1.2fr_1fr_auto]">
                  <span className="serif text-[24px] transition-transform duration-500 ease-lux group-hover:translate-x-2">{it.name}</span>
                  <span className="hidden text-[14px] text-smoke sm:block">{it.origin}</span>
                  <span className="font-mono text-[12px] text-smoke">{it.used}</span>
                </li>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Atelier */}
      <section className="sec-dark relative overflow-hidden">
        <Parallax image={img("home-fields", "Rows of pink May roses in a misty field near Grasse at sunrise, with woven baskets of petals")} amount={12} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" aria-hidden />
        <div className="wrap relative flex min-h-[92vh] flex-col justify-end py-20">
          <p className="eyebrow text-bone/75">The atelier</p>
          <TextReveal text="From the rose fields of Grasse." className="serif h1 mt-5 max-w-3xl" />
          <Reveal className="mt-12 grid grid-cols-2 gap-8 border-t border-white/20 pt-8 md:grid-cols-4" stagger={0.1}>
            {NUMBERS.map((n) => (
              <div key={n.label} data-reveal>
                <p className="serif text-[48px] leading-none sm:text-[64px]">{n.value}</p>
                <p className="mt-2 text-[14px] text-bone/75">{n.label}</p>
              </div>
            ))}
          </Reveal>
          <Link href="/atelier" className="link-arrow mt-12 self-start text-bone">
            Inside the atelier <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Reviews */}
      <section className="sec-bone py-24 sm:py-32">
        <div className="wrap">
          <div className="flex flex-col items-center text-center">
            <Stars value={4.8} size={18} />
            <p className="mt-4 font-mono text-[13px] text-smoke">4.8 average · {totalReviews.toLocaleString("en-US")} verified reviews</p>
          </div>
          <Reveal className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8" stagger={0.12}>
            {QUOTES.map((q) => (
              <figure key={q.name} data-reveal className="flex flex-col border-t border-graphite pt-6">
                <blockquote className="serif flex-1 text-[26px] leading-[1.2] sm:text-[30px]">“{q.body}”</blockquote>
                <figcaption className="mt-6 text-[14px]">
                  {q.name}, {q.place} <span className="text-smoke">· {q.product}</span>
                </figcaption>
              </figure>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Candles */}
      <section className="sec-stone py-24 sm:py-32">
        <div className="wrap">
          <SectionHead eyebrow="For the home" title="Three candles, poured in ceramic." text="Coconut and rapeseed wax, about 50 hours of burn time, and a vessel you will want to keep." link={{ href: "/shop?category=candle", label: "Shop candles" }} />
          <Reveal className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-3" stagger={0.1}>
            {CANDLES.map((p) => (
              <ProductCard key={p.slug} product={p} sizes="(min-width: 640px) 33vw, 100vw" />
            ))}
          </Reveal>
        </div>
      </section>

      {/* Gifting */}
      <section className="sec-bone py-24 sm:py-32">
        <div className="wrap grid items-center gap-14 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div className="order-2 lg:order-1">
            <p className="eyebrow text-smoke">Gifting</p>
            <TextReveal text="Wrapped by hand. Always free." className="serif h2 mt-4" />
            <p className="lead mt-6 max-w-lg text-smoke">Our signature box, an amber silk ribbon and your message written by hand on our card. Prices never appear on the packing slip. Or send a digital gift card on the day you choose.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/gifting" className="btn btn-dark">
                Explore gifting
              </Link>
              <Link href="/gifting#gift-card" className="btn btn-outline">
                Send a gift card
              </Link>
            </div>
          </div>
          <ImageReveal image={img("home-packaging", "A Solvane bottle beside its cream gift box, wrapped in tissue and tied with a ribbon")} className="order-1 aspect-[4/5] lg:order-2" sizes="(min-width: 1024px) 45vw, 100vw" />
        </div>
      </section>

      {/* Promises */}
      <section className="sec-paper border-t border-line py-16">
        <Reveal as="ul" className="wrap grid gap-10 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {PROMISES.map((p) => (
            <li key={p.title} data-reveal>
              <p className="serif text-[24px]">{p.title}</p>
              <p className="mt-2 text-[14px] text-smoke">{p.text}</p>
            </li>
          ))}
        </Reveal>
      </section>
    </>
  );
}
