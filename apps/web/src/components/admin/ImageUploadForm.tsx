"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FileItem = {
  file: File;
  preview: string;
  progress: number; // 0..100
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function ImageUploadForm() {
  const router = useRouter();
  const [items, setItems] = useState<FileItem[]>([]);
  const [alt, setAlt] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => () => { items.forEach(i => URL.revokeObjectURL(i.preview)); }, [items]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const next: FileItem[] = [];
    for (const f of files) {
      if (!ALLOWED.has(f.type)) {
        toast.error(`Không hỗ trợ định dạng: ${f.name} (${f.type || "unknown"})`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        toast.error(`File quá lớn (>10MB): ${f.name}`);
        continue;
      }
      const url = URL.createObjectURL(f);
      next.push({ file: f, preview: url, progress: 0, status: "pending" });
    }
    setItems(next);
  };

  const uploadOne = (item: FileItem, index: number) => new Promise<void>((resolve) => {
    const fd = new FormData();
    fd.append("files", item.file);
    fd.append("alt", alt);
    fd.append("title", title);
    fd.append("sortOrder", String(sortOrder + index));
    fd.append("isVisible", String(isVisible));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/images/upload");
    xhr.upload.onprogress = (ev) => {
      if (!ev.lengthComputable) return;
      const pct = Math.round((ev.loaded / ev.total) * 80); // đến 80% khi gửi đến server
      setItems((arr) => arr.map((it, i) => i === index ? { ...it, progress: Math.max(it.progress, pct), status: "uploading" } : it));
    };
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          setItems((arr) => arr.map((it, i) => i === index ? { ...it, progress: 100, status: "done" } : it));
        } else {
          const err = xhr.responseText || `HTTP ${xhr.status}`;
          setItems((arr) => arr.map((it, i) => i === index ? { ...it, status: "error", error: err } : it));
        }
        resolve();
      }
    };
    xhr.send(fd);
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (items.length === 0) {
        toast.error("Vui lòng chọn ít nhất 1 ảnh");
        return;
      }
      setSubmitting(true);
      for (let i = 0; i < items.length; i++) {
        if (items[i].status === "done") continue;
        await uploadOne(items[i], i);
      }
      const failed = items.filter((it) => it.status === "error").length;
      if (failed === 0) {
        toast.success("Tải ảnh thành công");
        router.push("/dashboard/resources/images");
      } else {
        toast.error(`Một số ảnh lỗi (${failed})`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi upload ảnh");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="files">Chọn ảnh (có thể chọn nhiều)</Label>
        <Input id="files" type="file" multiple accept="image/*" onChange={onFileChange} />
        {items.length > 0 && (
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-md border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.preview} alt="preview" className="h-16 w-16 rounded object-cover border" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium" title={it.file.name}>{it.file.name}</div>
                  <div className="text-xs text-muted-foreground">{(it.file.size/1024).toFixed(1)} KB</div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded bg-muted">
                    <div className={`h-full bg-primary transition-all`} style={{ width: `${it.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="title">Tiêu đề (áp dụng cho tất cả)</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tuỳ chọn" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="alt">Alt (áp dụng cho tất cả)</Label>
        <Input id="alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Văn bản thay thế" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="sortOrder">Thứ tự bắt đầu</Label>
          <Input id="sortOrder" type="number" value={String(sortOrder)} onChange={(e) => setSortOrder(e.target.value === "" ? 1 : Number(e.target.value))} />
        </div>
        <div className="flex items-end gap-2">
          <input id="isVisible" type="checkbox" className="h-4 w-4" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />
          <Label htmlFor="isVisible">Hiển thị</Label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Đang tải..." : "Tải lên"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}
