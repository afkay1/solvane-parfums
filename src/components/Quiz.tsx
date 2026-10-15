"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QUIZ, scoreQuiz } from "@/lib/data/quiz";
import { DISCOVERY, FAMILIES, getPerfume, PERFUMES } from "@/lib/data/products";
import { cart } from "@/lib/commerce/cart";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { flyToCart } from "@/lib/fly";
import Img from "./Img";
import Price from "./Price";

type Result = { slug: string; match: number };

export default function Quiz() {
  const [step, setStep] = useState(-1); // -1 intro, 0..5 questions, 6 results
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Result[] | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  // Shared result link: /scent-finder?r=slug,slug,slug
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("r");
    if (!r) return;
    const slugs = r.split(",").filter((s) => getPerfume(s)).slice(0, 3);
    if (slugs.length) {
      setResults(slugs.map((slug, i) => ({ slug, match: [94, 88, 81][i] })));
      setStep(QUIZ.length);
    }
  }, []);

  const go = (next: number) => {
    const el = stage.current;
    const apply = () => {
      setStep(next);
      window.__lenis?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    };
    if (!el || prefersReducedMotion()) return apply();
    gsap.to(el, {
      opacity: 0,
      y: -16,
      duration: 0.28,
      ease: "power2.in",
      onComplete: () => {
        apply();
        requestAnimationFrame(() => {
          gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" });
          heading.current?.focus({ preventScroll: true });
        });
      },
    });
  };

  const choose = (qid: string, oid: string) => {
    const nextAnswers = { ...answers, [qid]: oid };
    setAnswers(nextAnswers);
    if (step < QUIZ.length - 1) return go(step + 1);
    const r = scoreQuiz(nextAnswers);
    setResults(r);
    const u = new URL(window.location.href);
    u.searchParams.set("r", r.map((x) => x.slug).join(","));
    window.history.replaceState(null, "", u.pathname + u.search);
    go(QUIZ.length);
  };

  const restart = () => {
    setAnswers({});
    setResults(null);
    window.history.replaceState(null, "", window.location.pathname);
    go(0);
  };

  const q = step >= 0 && step < QUIZ.length ? QUIZ[step] : null;

  return (
    <div className="wrap min-h-[calc(100svh-var(--header)-var(--bar))] pb-24 pt-[calc(var(--header)+var(--bar)+32px)]">
      {q && (
        <div className="mb-10 flex items-center gap-4">
          <button type="button" onClick={() => go(step - 1)} className="eyebrow hover:opacity-60" aria-label={step === 0 ? "Back to introduction" : "Previous question"}>
            ← Back
          </button>
          <div className="h-[2px] flex-1 bg-line" role="progressbar" aria-valuemin={1} aria-valuemax={QUIZ.length} aria-valuenow={step + 1} aria-label="Quiz progress">
            <div className="h-full bg-graphite transition-[width] duration-700 ease-lux" style={{ width: `${((step + 1) / QUIZ.length) * 100}%` }} />
          </div>
          <span className="font-mono text-[12px] text-smoke">
            {step + 1} / {QUIZ.length}
          </span>
        </div>
      )}

      <div ref={stage}>
        {step === -1 && (
          <div className="grid items-center gap-12 py-6 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="eyebrow text-smoke">The Scent Finder</p>
              <h1 ref={heading} tabIndex={-1} className="serif h1 mt-4 outline-none">
                Six questions. <em>Three matches.</em>
              </h1>
              <p className="lead mt-6 max-w-md text-smoke">No perfume vocabulary needed. Answer with your first instinct; it takes about a minute and you can go back at any time.</p>
              <button type="button" onClick={() => go(0)} className="btn btn-dark mt-10">
                Begin
              </button>
              <p className="mt-6 text-[13px] text-smoke">Your answers stay in your browser. We don’t ask for your email.</p>
            </div>
            <Img image={{ src: "/images/home-blotters.webp", alt: "A fan of perfume blotters in a ceramic cup in soft window light" }} className="aspect-[4/5]" sizes="(min-width: 1024px) 45vw, 100vw" priority />
          </div>
        )}

        {q && (
          <fieldset>
            <legend className="sr-only">{q.title}</legend>
            <p className="eyebrow text-smoke">{q.sub}</p>
            <h1 ref={heading} tabIndex={-1} className="serif h1 mt-4 max-w-3xl outline-none">
              {q.title}
            </h1>
            <div className={`mt-12 grid gap-3 ${q.options.length > 4 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
              {q.options.map((o, i) => {
                const on = answers[q.id] === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => choose(q.id, o.id)}
                    aria-pressed={on}
                    className={`group flex min-h-[96px] items-center justify-between gap-6 border px-6 py-5 text-left transition-colors duration-300 ${on ? "border-graphite bg-graphite text-bone" : "border-line bg-paper hover:border-graphite"}`}
                  >
                    <span>
                      <span className="font-mono text-[11px] opacity-50">{String.fromCharCode(65 + i)}</span>
                      <span className="serif mt-1 block text-[26px] leading-tight sm:text-[30px]">{o.label}</span>
                      {o.hint && <span className={`mt-1 block text-[13px] ${on ? "text-bone/70" : "text-smoke"}`}>{o.hint}</span>}
                    </span>
                    <span aria-hidden className="text-[22px] transition-transform duration-500 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {step === QUIZ.length && results && (
          <div>
            <p className="eyebrow text-smoke">Your matches</p>
            <h1 ref={heading} tabIndex={-1} className="serif h1 mt-4 max-w-3xl outline-none">
              We think you’ll love <em>{getPerfume(results[0].slug)?.name}.</em>
            </h1>
            <p className="lead mt-5 max-w-xl text-smoke">Here are your three closest matches. The best way to choose is on skin, so try them as samples first, or get all eight in the Discovery Set.</p>
            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
              {results.map((r, i) => {
                const p = getPerfume(r.slug);
                if (!p) return null;
                return (
                  <li key={r.slug} className="flex flex-col">
                    <Link href={`/products/${p.slug}`} className="group relative block aspect-[4/5] overflow-hidden" data-quiz-media={p.slug}>
                      <Img image={p.image} className="absolute inset-0" sizes="(min-width: 768px) 33vw, 100vw" priority={i === 0} />
                      {p.hover && <Img image={p.hover} decorative className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" sizes="(min-width: 768px) 33vw, 100vw" />}
                      <span className="absolute left-3 top-3 bg-bone/90 px-2.5 py-1 font-mono text-[11px]">{r.match}% match</span>
                    </Link>
                    <p className="mt-5 font-mono text-[12px] text-smoke">
                      0{i + 1} · {p.family ? FAMILIES[p.family].name : ""}
                    </p>
                    <h2 className="serif mt-1 text-[32px] leading-tight">{p.name}</h2>
                    <p className="mt-1 text-[14px] text-smoke">{p.tagline}</p>
                    <p className="mt-1 text-[13px] text-smoke">{p.short}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-dark !min-h-[44px] !px-5"
                        onClick={(e) => {
                          cart.add({ slug: p.slug, variant: "50", qty: 1 });
                          flyToCart(document.querySelector(`[data-quiz-media="${p.slug}"]`) ?? (e.currentTarget as HTMLElement));
                        }}
                      >
                        Add 50 ml · <Price usd={p.variants[0].usd} />
                      </button>
                      <Link href={`/products/${p.slug}`} className="btn btn-outline !min-h-[44px] !px-5">
                        Details
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-16 grid gap-6 border-t border-line pt-10 md:grid-cols-2">
              <div className="border border-line bg-paper p-7">
                <p className="serif text-[28px]">Try your three as samples</p>
                <p className="mt-2 text-[14px] text-smoke">Three 2 ml sprays, around four days of wear each.</p>
                <button
                  type="button"
                  className="btn btn-outline mt-6"
                  onClick={() => {
                    results.forEach((r, i) => cart.add({ slug: r.slug, variant: "2", qty: 1 }, { open: i === results.length - 1 }));
                  }}
                >
                  Add 3 samples · <Price usd={PERFUMES[0].variants[2].usd * 3} />
                </button>
              </div>
              <div className="sec-dark p-7">
                <p className="serif text-[28px]">Or try all eight</p>
                <p className="mt-2 text-[14px] text-bone/70">The Discovery Set, with its full price back as credit on your bottle.</p>
                <Link href="/discovery-set" className="btn btn-light mt-6">
                  Discovery Set · <Price usd={DISCOVERY.variants[0].usd} />
                </Link>
              </div>
            </div>
            <button type="button" onClick={restart} className="link-arrow mt-12">
              Start again <span aria-hidden>↺</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
