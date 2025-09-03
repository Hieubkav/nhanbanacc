"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { RESOURCES_MAP, apiOf, type ResourceConfig } from "@/config/resources";
import { cn } from "@/lib/utils";

type Props = {
  resource: string;
};

export default function ResourceTable({ resource }: Props) {
  const config = RESOURCES_MAP[resource] as ResourceConfig | undefined;
  const mod = apiOf(resource);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sort, setSort] = useState(config?.defaultSort ?? { field: "_creationTime", direction: "desc" });

  const data = useQuery(mod.list, { q, page, pageSize, sort });
  const toggle = useMutation(mod.toggle);
  const del = useMutation(mod.deleteOne);

  if (!config) return <div>Resource không tồn tại.</div>;
  const cols = config.listColumns;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder={config.searchPlaceholder ?? "Tìm kiếm..."}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="w-[280px]"
          />
          <Button variant="outline" onClick={() => setQ("")}>Xóa</Button>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/resources/${resource}/new`}>
            <Button>Thêm mới</Button>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-[700px] w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {cols.map((c) => (
                <th key={c.key} className={cn("text-left p-3 font-medium", c.width)}>
                  <button
                    className="flex items-center gap-1 hover:underline"
                    onClick={() => setSort({ field: c.key, direction: sort?.direction === "asc" ? "desc" : "asc" })}
                    title="Sắp xếp"
                  >
                    {c.label}{sort?.field === c.key ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
              <th className="p-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {!data ? (
              <tr><td className="p-4" colSpan={cols.length + 1}>Đang tải...</td></tr>
            ) : data.items.length === 0 ? (
              <tr><td className="p-4" colSpan={cols.length + 1}>Không có dữ liệu</td></tr>
            ) : (
              data.items.map((row: any) => (
                <tr key={row._id} className="border-t">
                  {cols.map((c) => (
                    <td key={c.key} className="p-3 align-top">
                      {c.render ? c.render(row) : renderCell(row[c.key])}
                    </td>
                  ))}
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      {config.toggles?.map((f) => {
                        const fieldLabel =
                          config.listColumns.find((c) => c.key === f)?.label ||
                          config.editFields?.find((c: any) => c.name === f)?.label ||
                          config.createFields.find((c: any) => c.name === f)?.label ||
                          f;
                        const val = !!row[f];
                        const isHienThi = typeof fieldLabel === "string" && fieldLabel.toLowerCase().includes("hiển");
                        const stateText = isHienThi ? (val ? "Hiện" : "Ẩn") : (val ? "Bật" : "Tắt");
                        return (
                          <Button
                            key={f}
                            size="sm"
                            variant={val ? "secondary" : "outline"}
                            onClick={() => toggle({ id: row._id, field: f })}
                          >
                            {fieldLabel}: {stateText}
                          </Button>
                        );
                      })}
                      <Link href={`/dashboard/resources/${resource}/${row._id}`}><Button size="sm" variant="outline">Sửa</Button></Link>
                      <Button size="sm" variant="destructive" onClick={() => del({ id: row._id })}>Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Tổng: {data?.total ?? 0}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trang trước</Button>
          <div className="text-sm">Trang {page}</div>
          <Button variant="outline" disabled={!data?.hasMore} onClick={() => setPage((p) => p + 1)}>Trang sau</Button>
        </div>
      </div>
    </div>
  );
}

function renderCell(val: any) {
  if (val === null || val === undefined) return <span className="text-muted-foreground">—</span>;
  if (typeof val === "boolean") return <span className={val ? "text-green-600 dark:text-green-500" : "text-muted-foreground"}>{String(val)}</span>;
  if (typeof val === "number") return val;
  if (typeof val === "string") return val;
  if (typeof val === "object" && "id" in val && "label" in val) return (val as any).label;
  return JSON.stringify(val);
}
