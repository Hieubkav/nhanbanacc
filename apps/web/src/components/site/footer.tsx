"use client";

import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";

export default function Footer() {
  const s = useQuery(api.settings.getOne);
  return (
    <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="container mx-auto px-4 py-8 grid gap-8 sm:grid-cols-1 md:grid-cols-3">
        <div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{s?.siteName ?? "NhanBanACC"}</div>
          <div className="text-muted-foreground mt-2 text-sm">{s?.slogan ?? "Giải pháp nhanh, gọn, hiệu quả"}</div>
          <div className="mt-4 space-y-2">
            {s?.address ? <div className="text-sm">📍 {s.address}</div> : null}
            {s?.phone ? <div className="text-sm">📞 {s.phone}</div> : null}
            {s?.email ? <div className="text-sm">✉️ {s.email}</div> : null}
          </div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">Mạng xã hội</div>
          <div className="mt-4 flex flex-col gap-3">
            {s?.socialFacebook ? (
              <a 
                className="flex items-center gap-2 text-blue-600 hover:underline dark:text-blue-400" 
                href={s.socialFacebook} 
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.129 22 16.99 22 12z"/>
                </svg>
                <span>Facebook</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <span className="text-muted-foreground flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.129 22 16.99 22 12z"/>
                </svg>
                <span>Facebook: (đang cập nhật)</span>
              </span>
            )}
            {s?.socialYoutube ? (
              <a 
                className="flex items-center gap-2 text-red-600 hover:underline dark:text-red-400" 
                href={s.socialYoutube} 
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                <span>YouTube</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <span className="text-muted-foreground flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                <span>YouTube: (đang cập nhật)</span>
              </span>
            )}
            {s?.socialTiktok ? (
              <a 
                className="flex items-center gap-2 hover:underline" 
                href={s.socialTiktok} 
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span>TikTok</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <span className="text-muted-foreground flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span>TikTok: (đang cập nhật)</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border bg-gradient-to-br from-yellow-50/50 to-white p-4 dark:from-gray-800 dark:to-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white">Đăng ký nhận tin</h3>
            <p className="text-muted-foreground mt-1 text-sm">Nhận thông tin sản phẩm mới và khuyến mãi</p>
            <div className="mt-3 flex">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="flex-1 rounded-l-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 dark:bg-gray-800"
              />
              <button className="rounded-r-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600">
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {s?.siteName ?? "NhanBanACC"}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

