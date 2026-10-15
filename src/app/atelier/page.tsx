import type { Metadata } from "next";
import Link from "next/link";
import ImageReveal from "@/components/ImageReveal";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import TextReveal from "@/components/TextReveal";
import { Marquee } from "@/components/ui";
import { ATELIER_STEPS, BRAND, MARQUEE, NUMBERS, VALUES } from "@/lib/data/brand";
import { img } from "@/lib/types";

export const metadata: Metadata = {
  title: "Our atelier in Grasse",
  description: "How Solvane perfumes are made: raw materials from growers we know, copper-still distillation, years of composition and six weeks of maceration, in batches of 300.",
  alternates: { canonical: "/atelier" },
};

export default function AtelierPage() {
  return (
    <>
      <section className="sec-dark relative h-[100svh] min-h-[620px] overflow-hidden">
        <Parallax image={img("atelier-organ", "A perfumer’s organ: curved wooden shelves holding hundreds of amber glass bottles in a bright Grasse studio")} amount={8} priority className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" aria-hidden />
        <div className="wrap relative flex h-full flex-col justify-end pb-16 sm:pb-24">
          <p className="eyebrow text-bone/80">The atelier · Grasse, France</p>
          <TextReveal as="h1" text="Three hundred bottles at a time." immediate className="serif h-hero mt-5 max-w-5xl" />
        </div>
      </section>

      <section className="sec-bone py-24 sm:py-36">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          <p className="eyebrow text-smoke">Since {BRAND.founded}</p>
          <div>
            <TextReveal text="Solvane began with a question: what if perfume were made the way good food is, slowly, from ingredients you can trace?" className="serif text-[32px] leading-[1.15] sm:text-[44px]" />
            <div className="lead mt-10 grid gap-6 text-smoke md:grid-cols-2">
              <p>Perfumer Camille Arnaud grew up between the jasmine fields of Grasse and her grandmother’s kitchen in Marseille. After fifteen years composing for large fashion houses, she left to make perfume on her own terms.</p>
              <p>Today our small team works from a converted 19th-century perfumery on the Chemin des Roses. We make eight perfumes, rather than eighty, and we take as long as each one needs.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec-stone py-8 sm:py-10" aria-label="Materials">
        <Marquee items={MARQUEE} />
      </section>

      <section className="sec-bone py-24 sm:py-32">
        <div className="wrap">
          <p className="eyebrow text-smoke">How it’s made</p>
          <TextReveal text="Four slow steps." className="serif h1 mt-4" />
          <div className="mt-20 space-y-24 sm:space-y-32">
            {ATELIER_STEPS.map((s, i) => (
              <article key={s.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-24">
                <ImageReveal image={s.image} className={`${i === 0 || i === 3 ? "aspect-[4/5]" : "aspect-[3/2]"} ${i % 2 ? "lg:order-2" : ""}`} sizes="(min-width: 1024px) 45vw, 100vw" />
                <div>
                  <p className="font-mono text-[13px] text-amber">0{i + 1}</p>
                  <h2 className="serif h2 mt-3">{s.title}</h2>
                  <p className="lead mt-6 max-w-lg text-smoke">{s.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-dark py-24 sm:py-32">
        <div className="wrap">
          <Reveal className="grid grid-cols-2 gap-10 md:grid-cols-4" stagger={0.1}>
            {NUMBERS.map((n) => (
              <div key={n.label} data-reveal className="border-t border-white/20 pt-6">
                <p className="serif text-[56px] leading-none sm:text-[80px]">{n.value}</p>
                <p className="mt-3 text-bone/70">{n.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="sec-paper py-24 sm:py-32">
        <div className="wrap grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          <div>
            <p className="eyebrow text-smoke">What we stand for</p>
            <TextReveal text="Good for skin, kind to the world." className="serif h2 mt-4" />
          </div>
          <Reveal as="ul" className="grid gap-x-10 gap-y-10 sm:grid-cols-2" stagger={0.08}>
            {VALUES.map((v) => (
              <li key={v.title} data-reveal className="border-t border-graphite pt-5">
                <p className="serif text-[26px]">{v.title}</p>
                <p className="mt-2 text-smoke">{v.text}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="sec-bone py-24">
        <div className="wrap flex flex-col items-center text-center">
          <TextReveal text="Come and smell for yourself." className="serif h2 max-w-2xl" />
          <p className="lead mt-5 max-w-lg text-smoke">The atelier is open for small guided visits on Saturday mornings from April to October. Write to us to book a place.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/discovery-set" className="btn btn-dark">
              Try the collection
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Book a visit
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
