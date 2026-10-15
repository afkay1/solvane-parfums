import type { Img as ImgT } from "@/lib/types";

interface Props {
  image: ImgT;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
}

/**
 * Responsive cover image. Every photo exists in two pre-compressed WebP sizes
 * (name-md.webp and name.webp); the browser picks the right one.
 */
export default function Img({ image, className = "", imgClassName = "", sizes = "100vw", priority = false, decorative = false }: Props) {
  const md = image.src.replace(/\.webp$/, "-md.webp");
  return (
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} overflow-hidden bg-stone ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={md}
        srcSet={`${md} 800w, ${image.src} 1400w`}
        sizes={sizes}
        alt={decorative ? "" : image.alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...{ fetchpriority: priority ? "high" : "auto" }}
        className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  );
}
