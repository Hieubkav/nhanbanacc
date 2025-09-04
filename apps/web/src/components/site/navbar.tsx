"use client";

import Link from "next/link";
import { StorageImage } from "@/components/shared/storage-image";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { ModeToggle } from "@/components/mode-toggle";

export default function Navbar() {
  const settings = useQuery(api.settings.getOne);
  const logoId = settings?.logoId ? String(settings.logoId) : null;

  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl">
              {logoId ? (
                <StorageImage imageId={logoId} alt={settings?.siteName ?? "Logo"} className="object-contain" />
              ) : (
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 flex h-full w-full items-center justify-center text-lg font-bold text-white">
                  {(settings?.siteName ?? "NB").slice(0, 2)}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xl tracking-tight text-gray-900 dark:text-white">
                {settings?.siteName ?? "NhanBanACC"}
              </span>
              {settings?.slogan ? (
                <span className="text-muted-foreground hidden text-xs sm:inline">{settings.slogan}</span>
              ) : null}
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
