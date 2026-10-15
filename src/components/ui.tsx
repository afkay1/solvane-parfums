import Link from "next/link";
import TextReveal from "./TextReveal";
import JsonLd from "./JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export function SectionHead({ eyebrow, title, text, align = "left", link, className = "" }: { eyebrow?: string; title: string; text?: string; align?: "left" | "center"; link?: { href: string; label: string }; className?: string }) {
  return (
    <div className={`flex flex-col gap-6 ${align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"} ${className}`}>
      <div className={align === "center" ? "max-w-2xl" : "max-w-3xl"}>
        {eyebrow && <p className="eyebrow text-smoke">{eyebrow}</p>}
        <TextReveal text={title} className="serif h2 mt-4" />
        {text && <p className={`lead mt-5 text-smoke ${align === "center" ? "mx-auto" : ""} max-w-xl`}>{text}</p>}
      </div>
      {link && (
        <Link href={link.href} className="link-arrow shrink-0">
          {link.label} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <JsonLd data={breadcrumbLd(items)} />
      <nav aria-label="Breadcrumb" className="eyebrow text-smoke">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-graphite">
              Home
            </Link>
          </li>
          {items.map((it, i) => (
            <li key={it.path} className="flex items-center gap-2">
              <span aria-hidden>/</span>
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-graphite">
                  {it.name}
                </span>
              ) : (
                <Link href={it.path} className="hover:text-graphite">
                  {it.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/** Simple top-of-page heading for pages without a full-bleed image. */
export function PageHead({ eyebrow, title, text, crumbs }: { eyebrow?: string; title: string; text?: string; crumbs: { name: string; path: string }[] }) {
  return (
    <section className="sec-bone pt-[calc(var(--header)+var(--bar)+40px)]">
      <div className="wrap pb-12 sm:pb-16">
        <Breadcrumbs items={crumbs} />
        {eyebrow && <p className="eyebrow mt-10 text-smoke">{eyebrow}</p>}
        <TextReveal as="h1" text={title} immediate className={`serif h1 max-w-4xl ${eyebrow ? "mt-4" : "mt-10"}`} />
        {text && <p className="lead mt-6 max-w-2xl text-smoke">{text}</p>}
      </div>
    </section>
  );
}

export function Accordion({ items, className = "" }: { items: { title: string; body: React.ReactNode; id?: string; open?: boolean }[]; className?: string }) {
  return (
    <div className={`divide-y divide-line border-y border-line ${className}`}>
      {items.map((it) => (
        <details key={it.title} id={it.id} open={it.open} className="group">
          <summary className="flex items-center justify-between gap-6 py-5 text-[16px] font-medium">
            {it.title}
            <span aria-hidden className="acc-icon text-[22px] font-light leading-none transition-transform duration-300">
              +
            </span>
          </summary>
          <div className="pb-6 pr-8 text-[15px] leading-relaxed text-smoke">{it.body}</div>
        </details>
      ))}
    </div>
  );
}

export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <li key={t} className="flex items-center">
          <span className="serif whitespace-nowrap px-6 text-[34px] italic sm:px-10 sm:text-[52px]">{t}</span>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
