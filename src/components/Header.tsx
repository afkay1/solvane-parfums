"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/data/brand";
import { setDrawer, useSummary } from "@/lib/commerce/cart";
import { money } from "@/lib/commerce/markets";
import Logo from "./Logo";
import MarketSelect, { MarketSelectFull } from "./MarketSelect";
import Search from "./Search";

/** Pages that open with a full-bleed image get a transparent header until you scroll. */
const OVER_IMAGE = [/^\/$/, /^\/atelier$/, /^\/gifting$/];

function Announcement() {
  const s = useSummary();
  const messages = [
    `Free standard shipping over ${money(s.freeOver, s.currency)}`,
    "Two free samples with every order",
    "Discovery Set: its price comes back as credit",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % messages.length), 4500);
    return () => window.clearInterval(id);
  }, [messages.length]);
  return (
    <div className="relative z-[51] flex h-[var(--bar)] items-center justify-center overflow-hidden bg-graphite px-4 text-bone">
      <p className="eyebrow relative h-[1.5em] w-full max-w-xl text-center !text-[10.5px] sm:!text-[11px]" aria-live="off">
        {messages.map((m, k) => (
          <span key={k} aria-hidden={k !== i} className={`absolute inset-0 transition-[opacity,transform] duration-700 ${k === i ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
            {m}
          </span>
        ))}
      </p>
    </div>
  );
}

function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const summary = useSummary();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const overImage = OVER_IMAGE.some((r) => r.test(pathname));
  const solid = !overImage || scrolled || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setOpen(false);
    setSearch(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.__lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const closeSearch = useCallback(() => setSearch(false), []);

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50">
        <Announcement />
        <header
          className={`transition-[background-color,color,box-shadow] duration-500 ${
            solid ? "bg-bone/95 text-graphite shadow-[0_1px_0_#D9D3C9] backdrop-blur-md" : "bg-gradient-to-b from-black/30 to-transparent text-bone"
          }`}
        >
          <div className="mx-auto grid h-[var(--header)] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-[var(--pad)]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="relative -ml-2 flex h-11 w-11 items-center justify-center lg:hidden"
              >
                <span className={`absolute h-px w-6 bg-current transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[5px]"}`} />
                <span className={`absolute h-px w-6 bg-current transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[5px]"}`} />
              </button>
              <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    aria-current={active(n.href) ? "page" : undefined}
                    className={`relative py-2 text-[13.5px] tracking-[0.02em] transition-opacity hover:opacity-60 ${active(n.href) ? "after:absolute after:inset-x-0 after:bottom-1 after:h-px after:bg-current" : ""}`}
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
            <Logo />
            <div className="flex items-center justify-end gap-0.5 sm:gap-1">
              <div className="hidden sm:block">
                <MarketSelect />
              </div>
              <button onClick={() => setSearch(true)} aria-label="Search" className="flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4.5 4.5" />
                </svg>
              </button>
              <button
                data-cart-target
                onClick={() => setDrawer(true)}
                aria-label={`Open bag, ${summary.count} item${summary.count === 1 ? "" : "s"}`}
                className="relative -mr-2 flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60"
              >
                <BagIcon />
                <span
                  data-cart-badge
                  aria-hidden
                  className={`absolute right-1 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber px-1 font-mono text-[10px] font-medium text-white transition-opacity ${summary.count ? "opacity-100" : "opacity-0"}`}
                >
                  {summary.count}
                </span>
              </button>
            </div>
          </div>
        </header>
      </div>

      <div
        id="menu"
        aria-hidden={!open}
        className={`fixed inset-0 z-40 flex flex-col bg-bone pt-[calc(var(--header)+var(--bar))] transition-[opacity,visibility] duration-500 lg:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <nav aria-label="Mobile" className="wrap flex flex-1 flex-col justify-center gap-1">
          {[{ href: "/", label: "Home" }, ...NAV, { href: "/track", label: "Track an order" }].map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              tabIndex={open ? 0 : -1}
              className="serif py-1 text-[40px] transition-[transform,opacity] duration-500 hover:text-amber sm:text-[52px]"
              style={{ transitionDelay: open ? `${80 + i * 40}ms` : "0ms", transform: open ? "none" : "translateY(16px)", opacity: open ? 1 : 0 }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="wrap border-t border-line py-6">
          <MarketSelectFull />
        </div>
      </div>

      <Search open={search} onClose={closeSearch} />
    </>
  );
}
