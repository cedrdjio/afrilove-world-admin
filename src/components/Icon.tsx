import {
  LayoutDashboard, Users, UserPlus, Flag, Heart, Languages, Church, Target,
  Gift, FileText, HelpCircle, BadgeCheck, Coins, CreditCard, Banknote, Bell,
  ShieldCheck, Settings, UserCog, ScanFace, Images, type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Users, UserPlus, Flag, Heart, Languages, Church, Target,
  Gift, FileText, HelpCircle, BadgeCheck, Coins, CreditCard, Banknote, Bell,
  ShieldCheck, Settings, UserCog, ScanFace, Images,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = MAP[name] ?? LayoutDashboard;
  return <Cmp className={className} />;
}
