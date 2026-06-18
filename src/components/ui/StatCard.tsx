import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  tone = "caramel",
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: "caramel" | "gold" | "terracotta" | "espresso" | "success";
}) {
  const tones: Record<string, string> = {
    caramel: "from-caramel to-caramel-dark",
    gold: "from-gold to-sand",
    terracotta: "from-terracotta to-terracotta-dark",
    espresso: "from-espresso-600 to-espresso",
    success: "from-success to-[#157a42]",
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-soft", tones[tone])}>
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-espresso-500">{label}</p>
        <p className="text-2xl font-extrabold text-espresso">{value}</p>
      </div>
    </div>
  );
}
