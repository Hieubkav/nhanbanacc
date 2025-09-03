"use client";

import ImageUploadForm from "@/components/admin/ImageUploadForm";

export default function ImagesCreatePage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Tải ảnh lên (Convex Storage)</h1>
      <ImageUploadForm />
    </div>
  );
}

