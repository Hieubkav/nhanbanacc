"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ResourceTable from "@/components/admin/ResourceTable";
import { RESOURCES_MAP } from "@/config/resources";

export default function ResourceListPage() {
  const params = useParams();
  const resource = params.resource as string;
  const cfg = RESOURCES_MAP[resource];
  if (!cfg) return <div className="p-4">Resource không tồn tại.</div>;
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{cfg.title}</h1>
        <Link href="/dashboard">← Trang chủ dashboard</Link>
      </div>
      <ResourceTable resource={resource} />
    </div>
  );
}

