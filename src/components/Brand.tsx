import { cn } from "@/lib/utils";

/**
 * AfroLove World brand lockup — the heart logo + wordmark.
 * The logo lives at /public/logo.svg; drop in the official PNG there to swap it.
 */
export function Brand({
  className,
  compact = false,
  light = false,
  animated = true,
}: {
  className?: string;
  compact?: boolean;
  light?: boolean;
  animated?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.svg"
        alt="AfroLove World"
        className={cn("h-10 w-10 shrink-0 drop-shadow-sm", animated && "animate-heartbeat")}
      />
      {!compact && (
        <div className="leading-none">
          <span
            className={cn(
              "block font-display text-lg font-extrabold tracking-tight",
              light ? "text-white" : "text-espresso",
            )}
          >
            AFROLOVE
          </span>
          <span
            className={cn(
              "block text-[0.7rem] font-semibold uppercase tracking-[0.35em]",
              light ? "text-gold" : "text-caramel",
            )}
          >
            World
          </span>
        </div>
      )}
    </div>
  );
}
