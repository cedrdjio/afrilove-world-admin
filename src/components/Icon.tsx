import {
  LayoutDashboard, Users, UserPlus, Flag, Heart, Languages, Church, Target,
  Gift, FileText, HelpCircle, BadgeCheck, Coins, CreditCard, Banknote, Bell,
  ShieldCheck, Settings, UserCog, type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Users, UserPlus, Flag, Heart, Languages, Church, Target,
  Gift, FileText, HelpCircle, BadgeCheck, Coins, CreditCard, Banknote, Bell,
  ShieldCheck, Settings, UserCog,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = MAP[name] ?? LayoutDashboard;
  return <Cmp className={className} />;
}
