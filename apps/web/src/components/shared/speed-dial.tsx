"use client";

import { useEffect, useState } from "react";
import { 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Phone,
  ChevronUp,
  ChevronDown,
  Facebook
} from "lucide-react";
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
                    <Button size="icon" variant="secondary" onClick={() => window.open(settings.socialFacebook!, "_blank")}> 
                      <Facebook className="size-4" /> 
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Facebook</TooltipContent>
                </Tooltip>
              ) : null}
              {settings?.socialZalo ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="secondary" onClick={() => window.open(settings.socialZalo!, "_blank")}> 
                      <span className="font-bold">Z</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zalo</TooltipContent>
                </Tooltip>
              ) : null}
              {settings?.phone ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="secondary" onClick={() => window.open(`tel:${settings.phone}`, "_blank")}> 
                      <Phone className="size-4" /> 
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Gọi điện</TooltipContent>
                </Tooltip>
              ) : null}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="secondary" onClick={() => { scrollDir === "up" ? window.scrollTo({ top: 0, behavior: "smooth" }) : window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }}>
                    {scrollDir === "up" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{scrollDir === "up" ? "Về đầu trang" : "Xuống cuối trang"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        <Button size="icon" onClick={() => setOpen((v) => !v)} aria-label="Speed dial" className="rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <svg 
            className={`size-5 transition-transform ${open ? 'rotate-45' : ''}`} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </Button>
      </div>
    </div>
  );
}
