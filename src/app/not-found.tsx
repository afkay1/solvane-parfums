import Link from "next/link";
import Img from "@/components/Img";
import { img } from "@/lib/types";

export default function NotFound() {
  return (
    <section className="sec-bone pt-[calc(var(--header)+var(--bar))]">
      <div className="wrap grid min-h-[78vh] items-center gap-12 py-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow text-smoke">Error 404</p>
          <h1 className="serif h1 mt-4">This page has evaporated.</h1>
          <p className="lead mt-6 max-w-md text-smoke">Like top notes, some links don’t last. The page you were looking for has moved or never existed.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-dark">
              Back to home
            </Link>
            <Link href="/shop" className="btn btn-outline">
              Shop all
            </Link>
          </div>
        </div>
        <Img image={img("home-blotters", "Perfume blotters fanned out in a ceramic cup")} className="aspect-[4/5]" sizes="(min-width: 1024px) 45vw, 100vw" />
      </div>
    </section>
  );
}
