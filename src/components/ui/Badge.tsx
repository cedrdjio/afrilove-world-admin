import { cn } from "@/lib/utils";

type Tone = "success" | "danger" | "warning" | "info" | "neutral" | "gold";

const tones: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  danger: "bg-terracotta/10 text-terracotta",
  warning: "bg-gold/15 text-caramel-dark",
  info: "bg-info/10 text-info",
  neutral: "bg-espresso-500/10 text-espresso-600",
  gold: "bg-gold-gradient text-espresso",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? "success" : "danger"}>{active ? "Active" : "Inactive"}</Badge>;
}
