"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { StorageImage } from "@/components/shared/storage-image";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronRight } from "lucide-react";

export default function Navbar() {
  const settings = useQuery(api.settings.getOne);
  const logoId = settings?.logoId ? String(settings.logoId) : null;
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-3 rounded-xl px-1 py-1 transition-colors" aria-label={settings?.siteName ?? "NhanBanACC"}>
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl ring-1 ring-border/60 shadow-sm">
            {logoId ? (
              <StorageImage imageId={logoId} alt={settings?.siteName ?? "Logo"} className="h-full w-full object-contain" />
            ) : (
              <div className="bg-muted flex h-full w-full items-center justify-center text-sm font-bold">
                {(settings?.siteName ?? "NB").slice(0, 2)}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight">{settings?.siteName ?? "NhanBanACC"}</span>
            {!!settings?.slogan && <span className="text-muted-foreground hidden text-xs sm:inline">{settings.slogan}</span>}
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/san-pham" active={pathname?.startsWith("/san-pham")}>
            Sản phẩm
          </NavLink>
          <NavLink href="/web" active={pathname?.startsWith("/web")}>
            Làm web
          </NavLink>
          <NavLink href="/bai-viet" active={pathname?.startsWith("/bai-viet")}>
            Bài viết
          </NavLink>
          <NavLink href="/#faq">Hỗ trợ</NavLink>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="rounded-xl">
                <Menu className="size-5" />
                <span className="sr-only">Mở menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-96 p-0">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-2xl ring-1 ring-border/60">
                  {logoId ? (
                    <StorageImage imageId={logoId} alt={settings?.siteName ?? "Logo"} className="h-full w-full object-contain" />
                  ) : (
                    <div className="bg-muted flex h-full w-full items-center justify-center text-xs font-bold">
                      {(settings?.siteName ?? "NB").slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{settings?.siteName ?? "NhanBanACC"}</span>
                  {!!settings?.slogan && <span className="text-muted-foreground text-xs">{settings.slogan}</span>}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col p-2">
                <MobileItem href="/san-pham" onNavigate={() => setOpen(false)}>
                  Sản phẩm
                </MobileItem>
                <MobileItem href="/web" onNavigate={() => setOpen(false)}>
                  Làm web
                </MobileItem>
                <MobileItem href="/bai-viet" onNavigate={() => setOpen(false)}>
                  Bài viết
                </MobileItem>
                <MobileItem href="/#faq" onNavigate={() => setOpen(false)}>
                  Hỗ trợ
                </MobileItem>
              </div>

              <div className="mt-auto p-3">
                <div className="rounded-2xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                  Tip: Dùng menu để đi nhanh tới các mục.
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Button
      asChild
      variant={active ? "secondary" : "ghost"}
      className="rounded-xl px-3 text-sm font-medium cursor-pointer border border-transparent hover:border-gold-strong hover:text-gold-strong hover:bg-transparent transition-colors focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <Link href={href as any}>{children}</Link>
    </Button>
  );
}

function MobileItem({ href, onNavigate, children }: { href: string; onNavigate?: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href as any}
      onClick={onNavigate}
      className="group flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span>{children}</span>
      <ChevronRight className="size-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
