import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { CountUp } from "./CountUp";

export function StatCard({
  label,
  value,
  icon,
  tone = "caramel",
  prefix,
  decimals = 0,
}: {
  label: string;
  value: number | string;
  icon: string;
  tone?: "caramel" | "gold" | "terracotta" | "espresso" | "success";
  prefix?: string;
  decimals?: number;
}) {
  const tones: Record<string, string> = {
    caramel: "from-caramel to-caramel-dark",
    gold: "from-gold to-sand",
    terracotta: "from-terracotta to-terracotta-dark",
    espresso: "from-espresso-600 to-espresso",
    success: "from-success to-[#157a42]",
  };
  return (
    <div className="card card-hover group flex items-center gap-4 p-5">
      <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3", tones[tone])}>
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-espresso-500">{label}</p>
        <p className="text-2xl font-extrabold text-espresso">
          {typeof value === "number" ? <CountUp value={value} prefix={prefix} decimals={decimals} /> : value}
        </p>
      </div>
    </div>
  );
}
