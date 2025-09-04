"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Facebook, Plus, Search, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";

export function SpeedDial({ onOpenSearch, className }: { onOpenSearch?: () => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const settings = useQuery(api.settings.getOne);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) > 10) {
        setScrollDir(y > last ? "down" : "up");
        last = y;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <div className="relative">
        {open && (
          <div className="absolute bottom-14 right-0 flex flex-col items-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="secondary" onClick={() => { onOpenSearch?.(); setOpen(false); }}>
                    <Search className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tìm kiếm (Ctrl/Cmd + K)</TooltipContent>
              </Tooltip>
              {settings?.socialFacebook ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="secondary" onClick={() => window.open(settings.socialFacebook!, "_blank")}> <Facebook className="size-4" /> </Button>
                  </TooltipTrigger>
                  <TooltipContent>Facebook</TooltipContent>
                </Tooltip>
              ) : null}
              {settings?.socialYoutube ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="secondary" onClick={() => window.open(settings.socialYoutube!, "_blank")}> <Youtube className="size-4" /> </Button>
                  </TooltipTrigger>
                  <TooltipContent>YouTube</TooltipContent>
                </Tooltip>
              ) : null}
              {settings?.socialTiktok ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="secondary" onClick={() => window.open(settings.socialTiktok!, "_blank")}> <span className="text-xs font-bold">TT</span> </Button>
                  </TooltipTrigger>
                  <TooltipContent>TikTok</TooltipContent>
                </Tooltip>
              ) : null}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="secondary" onClick={() => { scrollDir === "up" ? window.scrollTo({ top: 0, behavior: "smooth" }) : window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }}>
                    {scrollDir === "up" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{scrollDir === "up" ? "Về đầu trang" : "Xuống cuối trang"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        <Button size="icon" onClick={() => setOpen((v) => !v)} aria-label="Speed dial">
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
