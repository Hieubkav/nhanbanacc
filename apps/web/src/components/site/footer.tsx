"use client";

import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Phone, Mail, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  const s = useQuery(api.settings.getOne);
  return (
    <footer className="border-t bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto grid gap-8 px-4 py-12 sm:grid-cols-1 md:grid-cols-3">
        {/* Brand + contact */}
        <div className="md:col-span-1">
          <div className="mb-3 text-2xl font-bold">{s?.siteName ?? "NhanBanACC"}</div>
          <p className="mb-6 text-gray-300">{s?.slogan ?? "Giai phap nhanh, gon, hieu qua"}</p>
          <div className="space-y-3">
            {s?.address ? (
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-block h-5 w-5 rounded bg-white/10" />
                <span>{s.address}</span>
              </div>
            ) : null}
            {s?.phone ? (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5" /> <span>{s.phone}</span>
              </div>
            ) : null}
            {s?.email ? (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5" /> <span>{s.email}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Quick links */}
        <div className="md:col-span-1">
          <h3 className="mb-6 text-xl font-semibold">Liên kết</h3>
          <ul className="space-y-3">
            <li>
              <a href="#products" className="text-gray-300 transition-colors hover:text-gold">
                Sản phẩm
              </a>
            </li>
            <li>
              <a href="#posts" className="text-gray-300 transition-colors hover:text-gold">
                Bài viết
              </a>
            </li>
            <li>
              <a href="#faq" className="text-gray-300 transition-colors hover:text-gold">
                Câu hỏi thường gặp
              </a>
            </li>
          </ul>
        </div>

        {/* Socials instead of duplicated address */}
        <div className="md:col-span-1">
          <h3 className="mb-6 text-xl font-semibold">Kết nối</h3>
          <div className="space-y-3">
            {s?.email ? (
              <a
                href={`mailto:${s.email}`}
                className="flex items-center gap-3 text-gray-300 transition-colors hover:text-white"
              >
                <Mail className="h-5 w-5" /> <span>{s.email}</span>
              </a>
            ) : null}
            {s?.socialFacebook ? (
              <a
                href={s.socialFacebook}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-gray-300 transition-colors hover:text-white"
              >
                <Facebook className="h-5 w-5" /> <span>Facebook</span>
              </a>
            ) : null}
            {s?.socialYoutube ? (
              <a
                href={s.socialYoutube}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-gray-300 transition-colors hover:text-white"
              >
                <Youtube className="h-5 w-5" /> <span>YouTube</span>
              </a>
            ) : null}
            {s?.socialTiktok ? (
              <a
                href={s.socialTiktok}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-gray-300 transition-colors hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                <span>TikTok</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-400">
           {new Date().getFullYear()} {s?.siteName ?? "NhanBanACC"}. Được code bởi Điền Trân.
        </div>
      </div>
    </footer>
  );
}

