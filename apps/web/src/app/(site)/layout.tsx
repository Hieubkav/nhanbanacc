import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../index.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/providers";
import Navbar from "@/components/site/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nhanbanacc",
  description: "nhanbanacc",
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
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
