import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Solvane, home" className={`serif inline-block text-[28px] leading-none tracking-[0.18em] sm:text-[30px] ${className}`}>
      SOLVANE
    </Link>
  );
}
