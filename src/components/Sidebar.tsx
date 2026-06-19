"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./Brand";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";
import { NAV } from "@/lib/nav";
import { canViewModule, type SessionUser } from "@/lib/permissions";

export function Sidebar({ user, onNavigate }: { user: SessionUser; onNavigate?: () => void }) {
  const pathname = usePathname();

  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.adminOnly) return user.role === "admin";
      if (item.module) return canViewModule(user, item.module);
      return true;
    }),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-espresso-500/10 bg-cream-light">
      <div className="flex h-16 items-center px-5">
        <Brand className="h-8" />
      </div>

      <nav className="stagger flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-2 text-[0.65rem] font-bold uppercase tracking-wider text-espresso-500/50">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                        active
                          ? "bg-caramel/12 text-caramel-dark"
                          : "text-espresso-500 hover:bg-espresso-500/5 hover:text-espresso",
                      )}
                    >
                      <span className={cn("grid h-7 w-7 place-items-center rounded-lg transition", active ? "bg-brand-gradient text-white shadow-soft" : "text-espresso-500/70 group-hover:text-caramel")}>
                        <Icon name={item.icon} className="h-[17px] w-[17px]" />
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
