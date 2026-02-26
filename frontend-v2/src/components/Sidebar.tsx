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

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden glass rounded-xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col transition-transform duration-300 lg:translate-x-0",
          "bg-white/80 backdrop-blur-xl border-r border-white/20",
          "shadow-[4px_0_24px_-6px_rgba(0,0,0,0.05)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 blur-lg opacity-30" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
              <Heart className="h-5 w-5 text-white fill-white/80" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold gradient-text">CardioSphere</span>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-violet-400" />
              <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">AI Health Platform</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          <p className="px-3 pb-2 text-[10px] font-semibold text-muted-foreground tracking-widest uppercase">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
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
                  "relative flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  isActive
                    ? "bg-white/20"
                    : "bg-gray-100 group-hover:bg-gray-200/80"
                )}>
                  <item.icon className={cn("h-4 w-4 relative z-10", isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600")} />
                </div>
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white/60 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile at bottom */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50/80 p-3 transition-colors hover:bg-gray-100/80">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-2 ring-white shadow-md",
                },
              }}
            />
            <div className="text-sm">
              <p className="font-semibold text-gray-800">Your Account</p>
              <p className="text-[11px] text-gray-400">Manage profile</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}