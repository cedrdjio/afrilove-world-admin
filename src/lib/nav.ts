import type { ModuleKey } from "./permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide icon name
  /** permission module required to see this item (admins always see all) */
  module?: ModuleKey;
  /** admin-only item */
  adminOnly?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" }],
  },
  {
    title: "Members",
    items: [
      { label: "Users", href: "/users", icon: "Users", module: "ulist" },
      { label: "Vérification KYC", href: "/verification", icon: "ScanFace", module: "ulist" },
      { label: "Médias", href: "/media", icon: "Images", module: "ulist" },
      { label: "Fake users", href: "/fake-users", icon: "UserPlus", module: "fakeuser" },
      { label: "Reports", href: "/reports", icon: "Flag", module: "report" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Interests", href: "/interests", icon: "Heart", module: "interest" },
      { label: "Languages", href: "/languages", icon: "Languages", module: "language" },
      { label: "Religions", href: "/religions", icon: "Church", module: "religion" },
      { label: "Relation goals", href: "/goals", icon: "Target", module: "rgoal" },
      { label: "Gifts", href: "/gifts", icon: "Gift", module: "gift" },
      { label: "Pages", href: "/pages", icon: "FileText", module: "page" },
      { label: "FAQs", href: "/faqs", icon: "HelpCircle", module: "faq" },
    ],
  },
  {
    title: "Monetization",
    items: [
      { label: "Plans", href: "/plans", icon: "BadgeCheck", module: "plan" },
      { label: "Coin packages", href: "/packages", icon: "Coins", module: "package" },
      { label: "Payment gateways", href: "/payments", icon: "CreditCard", module: "plist" },
      { label: "Payouts", href: "/payouts", icon: "Banknote", module: "payout" },
    ],
  },
  {
    title: "Engage",
    items: [
      { label: "Push notifications", href: "/notifications", icon: "Bell", module: "notification" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Staff", href: "/staff", icon: "ShieldCheck", adminOnly: true },
      { label: "Settings", href: "/settings", icon: "Settings", adminOnly: true },
      { label: "Profile", href: "/profile", icon: "UserCog", adminOnly: false },
    ],
  },
];
