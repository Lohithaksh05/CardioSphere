"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  Heart,
  LayoutDashboard,
  ClipboardList,
  Dumbbell,
  Salad,
  Pill,
  Users,
  Menu,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    gradient: "from-rose-500 to-pink-500",
    glow: "shadow-glow-rose",
  },
  {
    href: "/risk-assessment",
    label: "Risk Assessment",
    icon: ClipboardList,
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-glow-violet",
  },
  {
    href: "/workout-plan",
    label: "Workout Plan",
    icon: Dumbbell,
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-glow-violet",
  },
  {
    href: "/diet-plan",
    label: "Diet Plan",
    icon: Salad,
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-glow-emerald",
  },
  {
    href: "/medication-tracker",
    label: "Medications",
    icon: Pill,
    gradient: "from-purple-500 to-indigo-500",
    glow: "shadow-glow-violet",
  },
  {
    href: "/community",
    label: "Community",
    icon: Users,
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-glow-rose",
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden glass rounded-xl"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300",
          "bg-white/80 backdrop-blur-xl border-r border-white/20",
          "shadow-[4px_0_24px_-6px_rgba(0,0,0,0.05)]",
          // Desktop width based on collapsed state
          collapsed ? "lg:w-16" : "lg:w-72",
          // Mobile: always full width, open/close via translate
          "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex h-20 items-center gap-3 px-4 transition-all duration-300",
          collapsed && "lg:justify-center lg:px-0"
        )}>
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 blur-lg opacity-30" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
              <Heart className="h-5 w-5 text-white fill-white/80" />
            </div>
          </div>
          <div className={cn("transition-all duration-300 overflow-hidden", collapsed ? "lg:w-0 lg:opacity-0" : "opacity-100")}>
            <span className="text-lg font-bold gradient-text whitespace-nowrap">CardioSphere</span>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-violet-400" />
              <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase whitespace-nowrap">AI Health Platform</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-2 py-6">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-semibold text-muted-foreground tracking-widest uppercase">
              Navigation
            </p>
          )}
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <div key={item.href} className="relative group/nav">
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    collapsed ? "lg:justify-center lg:px-0" : "",
                    isActive
                      ? "text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                  )}
                >
                  {isActive && (
                    <div className={cn(
                      "absolute inset-0 rounded-xl bg-gradient-to-r opacity-100",
                      item.gradient,
                    )} />
                  )}
                  <div className={cn(
                    "relative flex h-8 w-8 items-center justify-center rounded-lg transition-all flex-shrink-0",
                    isActive
                      ? "bg-white/20"
                      : "bg-gray-100 group-hover/nav:bg-gray-200/80"
                  )}>
                    <item.icon className={cn("h-4 w-4 relative z-10", isActive ? "text-white" : "text-gray-400 group-hover/nav:text-gray-600")} />
                  </div>
                  <span className={cn(
                    "relative z-10 transition-all duration-300 overflow-hidden whitespace-nowrap",
                    collapsed ? "lg:w-0 lg:opacity-0" : "opacity-100"
                  )}>
                    {item.label}
                  </span>
                  {isActive && !collapsed && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white/60 animate-pulse" />
                  )}
                </Link>

                {/* Tooltip when collapsed (desktop only) */}
                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden lg:block z-50">
                    <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User profile at bottom */}
        <div className="border-t border-gray-100 p-3">
          <div className={cn(
            "flex items-center gap-3 rounded-xl bg-gray-50/80 p-3 transition-all hover:bg-gray-100/80",
            collapsed && "lg:justify-center"
          )}>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-2 ring-white shadow-md",
                },
              }}
            />
            <div className={cn(
              "text-sm transition-all duration-300 overflow-hidden",
              collapsed ? "lg:w-0 lg:opacity-0" : "opacity-100"
            )}>
              <p className="font-semibold text-gray-800 whitespace-nowrap">Your Account</p>
              <p className="text-[11px] text-gray-400 whitespace-nowrap">Manage profile</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop collapse toggle button — sits on the sidebar edge */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-6 z-50 hidden lg:flex items-center justify-center",
          "h-7 w-7 rounded-full bg-white border border-gray-200 shadow-md",
          "hover:bg-gray-50 hover:shadow-lg transition-all duration-300",
          collapsed ? "left-[3.625rem]" : "left-[17.625rem]"
        )}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
          : <ChevronLeft className="h-3.5 w-3.5 text-gray-500" />
        }
      </button>
    </>
  );
}