"use client";

import { useRef, useState } from "react";
import type { Img as ImgT } from "@/lib/types";
import Img from "../Img";

/** Product gallery: crossfading main image with thumbnails on desktop, swipeable on mobile. */
export default function Gallery({ images, name }: { images: ImgT[]; name: string }) {
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <div>
      {/* Mobile: swipe */}
      <div className="lg:hidden">
        <div
          ref={scroller}
          data-product-media
          className="no-scrollbar -mx-[var(--pad)] flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
          aria-label={`${name} photos`}
        >
          {images.map((im, i) => (
            <Img key={im.src} image={im} className="aspect-[4/5] w-full shrink-0 snap-center" sizes="100vw" priority={i === 0} />
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-4 flex justify-center gap-2" aria-hidden>
            {images.map((im, i) => (
              <span key={im.src} className={`h-[3px] w-6 transition-colors ${i === active ? "bg-graphite" : "bg-line"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: thumbnails + crossfade */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-[76px_1fr]">
        <div className="flex flex-col gap-3" role="tablist" aria-label={`${name} photos`}>
          {images.map((im, i) => (
            <button
              key={im.src}
              role="tab"
              aria-selected={i === active}
              aria-label={`Show photo ${i + 1}: ${im.alt}`}
              onClick={() => setActive(i)}
              className={`relative aspect-[4/5] w-full overflow-hidden outline-offset-2 transition-opacity ${i === active ? "opacity-100 ring-1 ring-graphite" : "opacity-55 hover:opacity-100"}`}
            >
              <Img image={im} className="absolute inset-0" sizes="76px" decorative />
            </button>
          ))}
        </div>
        <div data-product-media className="relative aspect-[4/5] overflow-hidden bg-stone">
          {images.map((im, i) => (
            <Img
              key={im.src}
              image={im}
              decorative={i !== active}
              priority={i === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={`absolute inset-0 transition-opacity duration-700 ease-lux ${i === active ? "opacity-100" : "opacity-0"}`}
              imgClassName={`transition-transform duration-[1.6s] ease-lux ${i === active ? "scale-100" : "scale-[1.04]"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
