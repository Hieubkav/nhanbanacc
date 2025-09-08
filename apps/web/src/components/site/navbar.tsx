// "use client";

// import Link from "next/link";
// import { StorageImage } from "@/components/shared/storage-image";
// import { useQuery } from "convex/react";
// import { api } from "@nhanbanacc/backend/convex/_generated/api";
// import { ModeToggle } from "@/components/mode-toggle";

// export default function Navbar() {
//   const settings = useQuery(api.settings.getOne);
//   const logoId = settings?.logoId ? String(settings.logoId) : null;

//   const scrollToSection = (id: string) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   return (
//     <header className="border-b bg-gold">
//       <div className="container mx-auto flex h-16 items-center justify-between px-4">
//         <div className="flex items-center gap-4">
//           <Link href="/" className="flex items-center gap-3 font-bold">
//             <div className="relative h-10 w-10 overflow-hidden rounded-xl">
//               {logoId ? (
//                 <StorageImage imageId={logoId} alt={settings?.siteName ?? "Logo"} className="object-contain" />
//               ) : (
//                 <div className="bg-white flex h-full w-full items-center justify-center text-lg font-bold text-gray-900">
//                   {(settings?.siteName ?? "NB").slice(0, 2)}
//                 </div>
//               )}
//             </div>
//             <div className="flex flex-col">
//               <span className="text-xl tracking-tight text-gray-900">
//                 {settings?.siteName ?? "NhanBanACC"}
//               </span>
//               {settings?.slogan ? (
//                 <span className="text-gray-700 hidden text-xs sm:inline">{settings.slogan}</span>
//               ) : null}
//             </div>
//           </Link>
//         </div>
        
//         {/* Navigation Menu */}
//         <nav className="hidden md:flex items-center gap-6">
//           <button 
//             onClick={() => scrollToSection('products')} 
//             className="text-sm font-medium text-gray-900 hover:text-white transition-colors"
//           >
//             Sản Phẩm
//           </button>
//           <button 
//             onClick={() => scrollToSection('posts')} 
//             className="text-sm font-medium text-gray-900 hover:text-white transition-colors"
//           >
//             Bài Viết
//           </button>
//           <button 
//             onClick={() => scrollToSection('faq')} 
//             className="text-sm font-medium text-gray-900 hover:text-white transition-colors"
//           >
//             Hỗ Trợ
//           </button>
//         </nav>
        
//         <div className="flex items-center gap-2">
//           <ModeToggle />
//         </div>
//       </div>
//     </header>
//   );
// }


"use client";

import Link from "next/link";
import { useState } from "react";
import { StorageImage } from "@/components/shared/storage-image";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu, ChevronRight } from "lucide-react";

export default function Navbar() {
  const settings = useQuery(api.settings.getOne);
  const logoId = settings?.logoId ? String(settings.logoId) : null;
  const [open, setOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl px-1 py-1 transition-colors"
          aria-label={settings?.siteName ?? "NhanBanACC"}
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl ring-1 ring-border/60 shadow-sm">
            {logoId ? (
              <StorageImage
                imageId={logoId}
                alt={settings?.siteName ?? "Logo"}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="bg-muted flex h-full w-full items-center justify-center text-sm font-bold">
                {(settings?.siteName ?? "NB").slice(0, 2)}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight">
              {settings?.siteName ?? "NhanBanACC"}
            </span>
            {!!settings?.slogan && (
              <span className="text-muted-foreground hidden text-xs sm:inline">
                {settings.slogan}
              </span>
            )}
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavButton onClick={() => scrollToSection("products")}>
            Sản phẩm
          </NavButton>
          <NavButton onClick={() => scrollToSection("services")}>
            Làm web
          </NavButton>
          <NavButton onClick={() => scrollToSection("posts")}>
            Bài viết
          </NavButton>
          <NavButton onClick={() => scrollToSection("faq")}>
            Hỗ trợ
          </NavButton>
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
                    <StorageImage
                      imageId={logoId}
                      alt={settings?.siteName ?? "Logo"}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="bg-muted flex h-full w-full items-center justify-center text-xs font-bold">
                      {(settings?.siteName ?? "NB").slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {settings?.siteName ?? "NhanBanACC"}
                  </span>
                  {!!settings?.slogan && (
                    <span className="text-muted-foreground text-xs">
                      {settings.slogan}
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col p-2">
                <MobileItem onClick={() => scrollToSection("products")}>
                  Sản phẩm
                </MobileItem>
                <MobileItem onClick={() => scrollToSection("services")}>
                  Làm web
                </MobileItem>
                <MobileItem onClick={() => scrollToSection("posts")}>
                  Bài viết
                </MobileItem>
                <MobileItem onClick={() => scrollToSection("faq")}>
                  Hỗ trợ
                </MobileItem>
              </div>

              <div className="mt-auto p-3">
                <div className="rounded-2xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                  Tip: Chạm mục để cuộn mượt tới phần tương ứng trên trang.
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/* ========= Small presentational bits (UI-only) ========= */

function NavButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className="rounded-xl px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {children}
    </Button>
  );
}

function MobileItem({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span>{children}</span>
      <ChevronRight className="size-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
