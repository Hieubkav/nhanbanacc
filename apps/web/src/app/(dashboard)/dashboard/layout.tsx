"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/admin/DashboardSidebar";
import { Menu } from "lucide-react";
import dynamic from "next/dynamic";
const ModeToggle = dynamic(() => import("@/components/mode-toggle").then(m => m.ModeToggle), { ssr: false });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-svh w-full">
      {/* Responsive topbar for mobile to open sidebar */}
      <div className="sticky top-0 z-20 border-b bg-background px-3 py-2 md:hidden">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
            <Menu className="size-4" />
          </Button>
          <div className="text-sm font-medium">Dashboard</div>
          <ModeToggle />
        </div>
      </div>

      <div className={`relative grid min-h-svh w-full grid-cols-1 ${collapsed ? "md:grid-cols-[4rem_1fr]" : "md:grid-cols-[16rem_1fr]"}`}>
        {/* Sidebar - visible on md+, drawer on mobile */}
        <div className="hidden md:block">
          <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        </div>

        {/* Drawer for mobile */}
        {open && (
          <div className="fixed inset-0 z-30 md:hidden" role="dialog" aria-modal>
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground shadow-lg">
              <DashboardSidebar collapsed={false} onToggle={() => setOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="p-3 md:p-6">
          <div className="hidden md:flex items-center justify-end mb-4">
            <ModeToggle />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
