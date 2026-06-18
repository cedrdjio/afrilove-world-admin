import { cn } from "@/lib/utils";

/** AfriLove wordmark — heart motif in the brand gold→caramel gradient. */
export function Brand({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-gradient shadow-soft">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-espresso" fill="currentColor" aria-hidden>
          <path d="M12 21s-7.5-4.6-10-9.2C.4 8.6 2 5 5.4 5c2 0 3.4 1.1 4.3 2.4C10.6 6.1 12 5 14 5c3.4 0 5 3.6 3.4 6.8C19.5 16.4 12 21 12 21z" />
        </svg>
      </span>
      {!compact && (
        <span className="text-lg font-display font-extrabold tracking-tight text-espresso">
          Afri<span className="text-caramel">Love</span>
        </span>
      )}
    </div>
  );
}
