"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import AuthSync from "@/components/AuthSync";
import { cn } from "@/lib/utils";

/**
 * Layout for all authenticated app pages.
 * Holds sidebar collapsed state so main content can shift accordingly.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthSync>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/30 mesh-gradient">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <main className={cn(
          "transition-all duration-300",
          collapsed ? "lg:pl-16" : "lg:pl-72"
        )}>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </AuthSync>
  );
}
