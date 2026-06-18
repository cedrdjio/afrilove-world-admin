"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Toaster } from "./ui/Toaster";
import { cn, initials } from "@/lib/utils";
import type { SessionUser } from "@/lib/permissions";
import { logoutAction } from "@/lib/actions/auth";

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();

  return (
    <Toaster>
      <div className="flex h-screen overflow-hidden bg-cream">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar user={user} />
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-espresso/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full animate-fade-in">
              <Sidebar user={user} onNavigate={() => setOpen(false)} />
            </div>
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-espresso-500/10 bg-cream-light/80 px-4 backdrop-blur lg:px-8">
            <button onClick={() => setOpen(true)} className="btn-ghost -ml-2 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:block" />

            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3 transition hover:bg-espresso-500/5"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-white">
                  {initials(user.name)}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold leading-tight text-espresso">{user.name}</span>
                  <span className="block text-xs capitalize text-espresso-500">{user.role}</span>
                </span>
                <ChevronDown className={cn("h-4 w-4 text-espresso-500 transition", menu && "rotate-180")} />
              </button>

              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-56 animate-fade-in rounded-xl border border-espresso-500/10 bg-white p-1.5 shadow-lifted">
                    <div className="border-b border-espresso-500/10 px-3 py-2">
                      <p className="truncate text-sm font-semibold text-espresso">{user.email}</p>
                    </div>
                    <form action={logoutAction}>
                      <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-terracotta hover:bg-terracotta/5">
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {/* Keyed by route so the entrance animation replays on navigation */}
            <div key={pathname} className="page-enter">
              {children}
            </div>
          </main>
        </div>
      </div>
    </Toaster>
  );
}
