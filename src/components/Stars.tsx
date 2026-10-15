export default function Stars({ value, size = 13, className = "" }: { value: number; size?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className={`relative inline-block leading-none tracking-[0.12em] ${className}`} style={{ fontSize: size }} role="img" aria-label={`Rated ${value} out of 5`}>
      <span className="text-line" aria-hidden>
        ★★★★★
      </span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-amber" style={{ width: `${pct}%` }} aria-hidden>
        ★★★★★
      </span>
    </span>
  );
}
