import type { Metadata } from "next";
import Link from "next/link";
import GiftCardForm from "@/components/GiftCardForm";
import ImageReveal from "@/components/ImageReveal";
import Parallax from "@/components/Parallax";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import TextReveal from "@/components/TextReveal";
import { SectionHead } from "@/components/ui";
import { getProduct, type Product } from "@/lib/data/products";
import { img } from "@/lib/types";

export const metadata: Metadata = {
  title: "Gifting: free gift wrap and digital gift cards",
  description: "Every Solvane order can be gift wrapped for free with a handwritten card. Or send a digital gift card on the date you choose.",
  alternates: { canonical: "/gifting" },
};

const GUIDES: { title: string; text: string; slugs: string[] }[] = [
  { title: "For the one who loves summer", text: "Bright, salty, sunlit.", slugs: ["sol-blanc", "vetiver-mer"] },
  { title: "For a cosy evening in", text: "Soft woods and a warm candle.", slugs: ["santal-doux", "candle-ombre"] },
  { title: "When you can’t decide", text: "Let them choose, beautifully.", slugs: ["discovery-set", "candle-jardin"] },
];

export default function GiftingPage() {
  return (
    <>
      <section className="sec-dark relative h-[86svh] min-h-[560px] overflow-hidden">
        <Parallax image={img("gift-wrapped", "A cream Solvane gift box tied with an amber silk ribbon and a sprig of eucalyptus on a travertine plinth")} amount={8} priority className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/25" aria-hidden />
        <div className="wrap relative flex h-full flex-col justify-end pb-16">
          <p className="eyebrow text-bone/80">Gifting</p>
          <TextReveal as="h1" text="A gift that smells like them." immediate className="serif h1 mt-4 max-w-3xl" />
          <p className="lead mt-5 max-w-lg text-bone/85">Free gift wrap on every order, a message written by hand, and digital gift cards delivered on the day you choose.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#gift-card" className="btn btn-light">
              Send a gift card
            </a>
            <a href="#guides" className="btn btn-ghost-light">
              Gift ideas
            </a>
          </div>
        </div>
      </section>

      <section className="sec-bone py-24 sm:py-32">
        <div className="wrap grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <ImageReveal image={img("gift-open", "An open cream gift box holding a Solvane bottle, an amber ribbon and a blank card on linen")} className="aspect-[3/2]" sizes="(min-width: 1024px) 45vw, 100vw" />
          <div>
            <p className="eyebrow text-smoke">Complimentary gift wrap</p>
            <TextReveal text="Wrapped by hand in Grasse." className="serif h2 mt-4" />
            <Reveal as="ul" className="mt-8 space-y-5" stagger={0.08}>
              {[
                ["Signature box", "A rigid cream box lined with tissue, made to be kept."],
                ["Amber silk ribbon", "Tied by hand, with a sprig of dried eucalyptus."],
                ["Handwritten card", "Add your message in the bag; we write it in ink."],
                ["No prices", "The packing slip never shows what you paid."],
              ].map(([t, d]) => (
                <li key={t} data-reveal className="border-t border-line pt-4">
                  <p className="text-[17px] font-medium">{t}</p>
                  <p className="text-smoke">{d}</p>
                </li>
              ))}
            </Reveal>
            <p className="mt-8 text-[14px] text-smoke">Tick “Gift wrap” in your bag or at checkout. It’s free on every order.</p>
          </div>
        </div>
      </section>

      <section id="guides" className="sec-stone scroll-mt-28 py-24 sm:py-32">
        <div className="wrap">
          <SectionHead eyebrow="Gift ideas" title="Not sure what to choose?" text="Three easy starting points. Every perfume gift ships with a sealed tester, so an unopened bottle can be swapped within 30 days." />
          <div className="mt-16 space-y-20">
            {GUIDES.map((g) => (
              <div key={g.title} className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
                <div>
                  <p className="serif h3">{g.title}</p>
                  <p className="mt-2 text-smoke">{g.text}</p>
                </div>
                <Reveal className="grid grid-cols-2 gap-6" stagger={0.1}>
                  {g.slugs
                    .map((s) => getProduct(s))
                    .filter((p): p is Product => Boolean(p))
                    .map((p) => (
                      <ProductCard key={p.slug} product={p} sizes="(min-width: 1024px) 30vw, 50vw" />
                    ))}
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="gift-card" className="sec-bone scroll-mt-28 py-24 sm:py-32">
        <div className="wrap">
          <SectionHead eyebrow="Digital gift card" title="Let them choose." text="Choose an amount, add a message and pick the day it arrives." />
          <div className="mt-14">
            <GiftCardForm />
          </div>
        </div>
      </section>

      <section className="sec-dark py-20">
        <div className="wrap flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow text-bone/60">Corporate gifting</p>
            <p className="serif h3 mt-3 max-w-xl">Gifts for clients and teams, from 20 boxes, with personalised cards.</p>
          </div>
          <Link href="/contact?topic=Corporate%20gifting" className="btn btn-light shrink-0">
            Talk to us
          </Link>
        </div>
      </section>
    </>
  );
}
