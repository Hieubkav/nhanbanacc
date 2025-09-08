import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../index.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/providers";
import Navbar from "@/components/site/navbar";
import DynamicHead from "@/components/site/dynamic-head";
import SeoJsonLd from "@/components/site/seo-jsonld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dttaikhoanso.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DT Tài Khoản Số",
    template: "%s | DT Tài Khoản Số",
  },
  description: "Dịch vụ tài khoản số, hỗ trợ nhanh chóng.",
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: "#0ea5e9",
  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/",
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "DT Tài Khoản Số",
    description: "Dịch vụ tài khoản số, hỗ trợ nhanh chóng.",
    siteName: "DT Tài Khoản Số",
  },
  twitter: {
    card: "summary_large_image",
    title: "DT Tài Khoản Số",
    description: "Dịch vụ tài khoản số, hỗ trợ nhanh chóng.",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <Providers>
            <div className="flex min-h-screen flex-col">
              {/* Cập nhật favicon + title từ Settings nếu có */}
              <DynamicHead />
              {/* JSON-LD: Organization + WebSite */}
              <SeoJsonLd />
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
