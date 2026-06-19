import { cn } from "@/lib/utils";

/**
 * AfriLove World brand lockup — the official logo provided by the brand.
 *   - default:  full horizontal lockup (heart + "AFRILOVE WORLD") → public/brand/logo-horizontal.png
 *   - compact:  heart mark only                                   → public/brand/mark.png
 *
 * Both are generated from public/logo.png. The wordmark is baked into the
 * artwork, so we never render separate text — what you see is the real logo.
 */
export function Brand({
  className,
  compact = false,
  animated = true,
}: {
  className?: string;
  compact?: boolean;
  /** kept for backwards-compat with callers; no longer used */
  light?: boolean;
  animated?: boolean;
}) {
  if (compact) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/brand/mark.png"
        alt="AfriLove World"
        className={cn("h-10 w-10 shrink-0 object-contain", animated && "animate-heartbeat", className)}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-horizontal.png"
      alt="AfriLove World"
      className={cn("h-9 w-auto object-contain", className)}
    />
  );
}
