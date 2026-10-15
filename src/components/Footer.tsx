import Link from "next/link";
import { BRAND, FOOTER_LINKS } from "@/lib/data/brand";
import { MarketSelectFull } from "./MarketSelect";
import Newsletter from "./Newsletter";

export default function Footer() {
  return (
    <footer className="sec-dark">
      <div className="wrap grid gap-14 py-20 lg:grid-cols-[1.2fr_2fr] lg:gap-20">
        <div>
          <p className="serif text-[40px] leading-[1.05] sm:text-[48px]">
            Letters from <em>the atelier.</em>
          </p>
          <p className="mt-4 max-w-sm text-bone/70">New perfumes, seasonal editions and notes from Grasse, about once a month. Plus 10% off your first order.</p>
          <div className="mt-6 max-w-md">
            <Newsletter source="footer" dark />
          </div>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          {FOOTER_LINKS.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <p className="eyebrow text-bone/50">{g.title}</p>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[15px] text-bone/85 transition-colors hover:text-bone">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="wrap grid gap-8 border-t border-white/10 py-10 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-1 text-[14px] text-bone/70">
          <p>{BRAND.address}</p>
          <p>
            <a href={`mailto:${BRAND.email}`} className="link-u text-bone">
              {BRAND.email}
            </a>{" "}
            · {BRAND.hours}
          </p>
        </div>
        <MarketSelectFull dark />
      </div>
      <div className="wrap flex flex-col gap-3 border-t border-white/10 py-6 text-[12px] text-bone/50 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {BRAND.legalName}. Concept store designed and built by MYFRIX. Demo only, no real orders are fulfilled.
        </p>
        <div className="flex gap-5">
          <Link href="/policies#privacy" className="hover:text-bone">
            Privacy
          </Link>
          <Link href="/policies#terms" className="hover:text-bone">
            Terms
          </Link>
          <Link href="/policies#cookies" className="hover:text-bone">
            Cookies
          </Link>
          <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-bone">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
