import { NextResponse } from "next/server";
export const runtime = "nodejs"; // sharp cần Node.js runtime
export const dynamic = "force-dynamic";

import sharp from "sharp";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@nhanbanacc/backend/convex/_generated/api";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files").filter(Boolean) as File[];
    const title = (form.get("title") as string) || "";
    const alt = (form.get("alt") as string) || "";
    const sortOrderBase = Number(form.get("sortOrder") ?? 1) || 1;
    const isVisible = String(form.get("isVisible") ?? "true") === "true";

    if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) return NextResponse.json({ error: "Missing NEXT_PUBLIC_CONVEX_URL" }, { status: 500 });
    const client = new ConvexHttpClient(convexUrl);

    const results: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!ALLOWED.has(f.type)) {
        results.push({ name: f.name, ok: false, error: `Định dạng không hỗ trợ: ${f.type}` });
        continue;
      }
      if (f.size > MAX_SIZE) {
        results.push({ name: f.name, ok: false, error: `File quá lớn: ${(f.size / (1024 * 1024)).toFixed(2)}MB` });
        continue;
      }

      const arrayBuf = await f.arrayBuffer();
      const input = Buffer.from(arrayBuf);
      // Convert sang WebP chất lượng tốt, tự xoay theo EXIF
      const webp = await sharp(input).rotate().webp({ quality: 85 }).toBuffer();
      const webpName = f.name.replace(/\.[^.]+$/, "") + ".webp";

      // Xin URL upload từ Convex và upload buffer WebP
      const { uploadUrl } = await client.mutation(api.images.generateUploadUrl, {});
      const r = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/webp" },
        body: webp,
      });
      if (!r.ok) {
        const txt = await r.text();
        results.push({ name: f.name, ok: false, error: `Upload lỗi: ${r.status} ${txt}` });
        continue;
      }
      const { storageId } = await r.json();

      // Tạo bản ghi images trong Convex
      const doc = await client.mutation(api.images.createFromUpload, {
        storageId,
        filename: webpName,
        mimeType: "image/webp",
        size: webp.length,
        alt: alt || undefined,
        title: title || undefined,
        sortOrder: sortOrderBase + i,
        isVisible,
      });

      results.push({ name: f.name, ok: true, id: doc?._id });
    }

    const okCount = results.filter((r) => r.ok).length;
    return NextResponse.json({ ok: okCount, total: results.length, results });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}

