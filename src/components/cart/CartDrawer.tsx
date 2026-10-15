"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { setDrawer, useDrawer, useSummary } from "@/lib/commerce/cart";
import { FreeShippingBar, GiftWrapField, LineItems, SamplesPicker, Totals } from "./parts";

export default function CartDrawer() {
  const open = useDrawer();
  const s = useSummary();
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const close = () => setDrawer(false);

  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    window.__lenis?.stop();
    document.body.style.overflow = "hidden";
    window.setTimeout(() => panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.__lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open]);

  return (
    <div aria-hidden={!open} className={`fixed inset-0 z-[80] transition-[visibility] duration-500 ${open ? "visible" : "invisible"}`}>
      <button
        tabIndex={-1}
        aria-label="Close bag"
        onClick={close}
        className={`absolute inset-0 bg-graphite/40 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-bone shadow-drawer transition-transform duration-500 ease-lux ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id="bag-title" className="serif text-[28px]">
            Your bag <span className="font-mono text-[13px] align-middle text-smoke">({s.count})</span>
          </h2>
          <button data-autofocus onClick={close} className="eyebrow -mr-2 p-2 hover:opacity-60">
            Close
          </button>
        </div>

        {s.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="serif text-[34px]">Your bag is empty.</p>
            <p className="mt-3 max-w-xs text-smoke">Not sure where to start? Try all eight in the Discovery Set, or let us match you in six questions.</p>
            <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
              <Link href="/discovery-set" className="btn btn-dark">
                Discovery Set
              </Link>
              <Link href="/scent-finder" className="btn btn-outline">
                Find your scent
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-6 py-4">
              <FreeShippingBar s={s} />
            </div>
            <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6">
              <LineItems s={s} onNavigate={close} />
              <div className="space-y-6 border-t border-line py-6">
                <SamplesPicker s={s} />
                <GiftWrapField s={s} />
              </div>
            </div>
            <div className="border-t border-line bg-paper px-6 py-5">
              <Totals s={s} stage="bag" />
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={close} className="btn btn-outline">
                  View bag
                </Link>
                <Link href="/checkout" onClick={close} className="btn btn-dark">
                  Checkout
                </Link>
              </div>
              <p className="mt-3 text-center text-[12px] text-smoke">Secure checkout · Cards, Apple Pay, Google Pay</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
