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
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="relative h-8 w-8 overflow-hidden rounded">
              {logoId ? (
                <StorageImage imageId={logoId} alt={settings?.siteName ?? "Logo"} />
              ) : (
                <div className="bg-black text-yellow-500 flex h-full w-full items-center justify-center text-xs">{(settings?.siteName ?? "NB").slice(0, 2)}</div>
              )}
            </div>
            <span className="text-lg tracking-tight">
              {settings?.siteName ?? "NhanBanACC"}
            </span>
          </Link>
          {settings?.slogan ? (
            <span className="text-muted-foreground hidden text-sm sm:inline">{settings.slogan}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
