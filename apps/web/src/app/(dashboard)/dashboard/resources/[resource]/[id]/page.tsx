"use client";

import { useParams } from "next/navigation";
import ResourceForm from "@/components/admin/ResourceForm";
import ProductVariantsPanel from "@/components/admin/ProductVariantsPanel";
import ProductImagesPanel from "@/components/admin/ProductImagesPanel";
import { RESOURCES_MAP } from "@/config/resources";

export default function ResourceEditPage() {
  const { resource, id } = useParams();
  const cfg = RESOURCES_MAP[resource as string];
  if (!cfg) return <div className="p-4">Resource không tồn tại.</div>;
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Sửa {cfg.title}</h1>
      <ResourceForm resource={resource as string} id={id as string} />
      {resource === "products" && (
        <>
          <ProductVariantsPanel productId={id as string} />
          <ProductImagesPanel productId={id as string} />
        </>
      )}
    </div>
  );
}

