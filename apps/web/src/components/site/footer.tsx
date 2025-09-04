"use client";

import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import Link from "next/link";

export default function Footer() {
  const s = useQuery(api.settings.getOne);
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="text-lg font-semibold">{s?.siteName ?? "NhanBanACC"}</div>
          <div className="text-muted-foreground mt-1 text-sm">{s?.slogan ?? "Giải pháp nhanh, gọn, hiệu quả"}</div>
          {s?.address ? <div className="mt-2 text-sm">Địa chỉ: {s.address}</div> : null}
          {s?.phone ? <div className="text-sm">Điện thoại: {s.phone}</div> : null}
          {s?.email ? <div className="text-sm">Email: {s.email}</div> : null}
        </div>
        <div>
          <div className="font-medium">Mạng xã hội</div>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            {s?.socialFacebook ? <Link className="text-blue-600 hover:underline" href={s.socialFacebook} target="_blank">Facebook</Link> : <span className="text-muted-foreground">Facebook: (đang cập nhật)</span>}
            {s?.socialYoutube ? <Link className="text-red-600 hover:underline" href={s.socialYoutube} target="_blank">YouTube</Link> : <span className="text-muted-foreground">YouTube: (đang cập nhật)</span>}
            {s?.socialTiktok ? <Link className="hover:underline" href={s.socialTiktok} target="_blank">TikTok</Link> : <span className="text-muted-foreground">TikTok: (đang cập nhật)</span>}
          </div>
        </div>
        <div className="text-sm text-muted-foreground self-end lg:justify-self-end">© {new Date().getFullYear()} {s?.siteName ?? "NhanBanACC"}. All rights reserved.</div>
      </div>
    </footer>
  );
}

