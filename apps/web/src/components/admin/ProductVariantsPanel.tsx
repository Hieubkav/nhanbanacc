"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProductVariantsPanel({ productId }: { productId: string }) {
  const [page] = useState(1);
  const [pageSize] = useState(100);
  const sort = useMemo(() => ({ field: "sortOrder", direction: "asc" as const }), []);

  const data = useQuery(api.product_variants.listByFK, { productId: productId as any, page, pageSize, sort } as any);
  const create = useMutation(api.product_variants.create);
  const update = useMutation(api.product_variants.update);
  const remove = useMutation(api.product_variants.deleteOne);
  const reorder = useMutation(api.product_variants.reorder);
  const toggle = useMutation(api.product_variants.toggle);
  const setDefault = useMutation(api.product_variants.setDefault);

  // Add form state
  const [newRow, setNewRow] = useState({ name: "", price: "", originalPrice: "", note: "", isDefault: false, isVisible: true, sortOrder: 1 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<any>({});

  const items = data?.items ?? [];

  const onAdd = async () => {
    const name = newRow.name.trim();
    if (!name) return;
    const price = Number(newRow.price);
    if (!Number.isFinite(price)) return;
    const originalPrice = newRow.originalPrice === "" ? undefined : Number(newRow.originalPrice);
    const sortOrder = items.length > 0 ? (items[items.length - 1].sortOrder ?? items.length) + 1 : 1;
    await create({
      dto: {
        productId: productId as any,
        name,
        description: undefined,
        price,
        originalPrice,
        note: newRow.note || undefined,
        isDefault: !!newRow.isDefault,
        sortOrder,
        isVisible: !!newRow.isVisible,
      } as any,
    } as any);
    setNewRow({ name: "", price: "", originalPrice: "", note: "", isDefault: false, isVisible: true, sortOrder: 1 });
  };

  const startEdit = (row: any) => {
    setEditingId(String(row._id));
    setEditRow({
      name: row.name ?? "",
      price: row.price ?? "",
      originalPrice: row.originalPrice ?? "",
      note: row.note ?? "",
      isDefault: !!row.isDefault,
      isVisible: !!row.isVisible,
      sortOrder: row.sortOrder ?? 1,
    });
  };

  const saveEdit = async (id: string) => {
    const price = editRow.price === "" ? undefined : Number(editRow.price);
    const originalPrice = editRow.originalPrice === "" ? undefined : Number(editRow.originalPrice);
    await update({
      id: id as any,
      patch: {
        name: editRow.name,
        price,
        originalPrice,
        note: editRow.note || undefined,
        isDefault: !!editRow.isDefault,
        isVisible: !!editRow.isVisible,
        sortOrder: Number(editRow.sortOrder ?? 1),
      } as any,
    } as any);
    setEditingId(null);
  };

  const move = async (id: string, dir: -1 | 1) => {
    if (!items.length) return;
    const idx = items.findIndex((x: any) => String(x._id) === String(id));
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const beforeId = dir === -1 ? items[targetIdx]._id : undefined;
    const afterId = dir === 1 ? items[targetIdx]._id : undefined;
    await reorder({ id: id as any, beforeId: beforeId as any, afterId: afterId as any, productScopeId: productId as any } as any);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Biến thể</h2>
      </div>

      {/* Add new variant */}
      <div className="grid gap-2 rounded-md border p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <Label>Tên</Label>
            <Input value={newRow.name} onChange={(e) => setNewRow((s) => ({ ...s, name: e.target.value }))} />
          </div>
          <div>
            <Label>Giá</Label>
            <Input type="number" value={newRow.price} onChange={(e) => setNewRow((s) => ({ ...s, price: e.target.value }))} />
          </div>
          <div>
            <Label>Giá gốc</Label>
            <Input type="number" value={newRow.originalPrice} onChange={(e) => setNewRow((s) => ({ ...s, originalPrice: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label>Ghi chú</Label>
            <Input value={newRow.note} onChange={(e) => setNewRow((s) => ({ ...s, note: e.target.value }))} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newRow.isDefault} onChange={(e) => setNewRow((s) => ({ ...s, isDefault: e.target.checked }))} /> Mặc định</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newRow.isVisible} onChange={(e) => setNewRow((s) => ({ ...s, isVisible: e.target.checked }))} /> Hiển thị</label>
          <Button onClick={onAdd}>Thêm biến thể</Button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">Tên</th>
              <th className="p-2 text-left">Giá</th>
              <th className="p-2 text-left">Giá gốc</th>
              <th className="p-2 text-left">Ghi chú</th>
              <th className="p-2 text-left">Mặc định</th>
              <th className="p-2 text-left">Hiển thị</th>
              <th className="p-2 text-left">Thứ tự</th>
              <th className="p-2 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {!data ? (
              <tr><td className="p-3" colSpan={8}>Đang tải...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-3" colSpan={8}>Chưa có biến thể</td></tr>
            ) : (
              items.map((row: any, idx: number) => (
                <tr key={String(row._id)} className="border-t">
                  <td className="p-2 align-top">
                    {editingId === String(row._id) ? (
                      <Input value={editRow.name} onChange={(e) => setEditRow((s: any) => ({ ...s, name: e.target.value }))} />
                    ) : row.name}
                  </td>
                  <td className="p-2 align-top">
                    {editingId === String(row._id) ? (
                      <Input type="number" value={editRow.price} onChange={(e) => setEditRow((s: any) => ({ ...s, price: e.target.value }))} />
                    ) : row.price}
                  </td>
                  <td className="p-2 align-top">
                    {editingId === String(row._id) ? (
                      <Input type="number" value={editRow.originalPrice} onChange={(e) => setEditRow((s: any) => ({ ...s, originalPrice: e.target.value }))} />
                    ) : (row.originalPrice ?? "-")}
                  </td>
                  <td className="p-2 align-top">
                    {editingId === String(row._id) ? (
                      <Input value={editRow.note} onChange={(e) => setEditRow((s: any) => ({ ...s, note: e.target.value }))} />
                    ) : (row.note ?? "-")}
                  </td>
                  <td className="p-2 align-top">
                    {editingId === String(row._id) ? (
                      <input type="checkbox" checked={!!editRow.isDefault} onChange={(e) => setEditRow((s: any) => ({ ...s, isDefault: e.target.checked }))} />
                    ) : (row.isDefault ? "Có" : "Không")}
                  </td>
                  <td className="p-2 align-top">
                    {editingId === String(row._id) ? (
                      <input type="checkbox" checked={!!editRow.isVisible} onChange={(e) => setEditRow((s: any) => ({ ...s, isVisible: e.target.checked }))} />
                    ) : (row.isVisible ? "Hiện" : "Ẩn")}
                  </td>
                  <td className="p-2 align-top">
                    {editingId === String(row._id) ? (
                      <Input type="number" value={editRow.sortOrder} onChange={(e) => setEditRow((s: any) => ({ ...s, sortOrder: e.target.value }))} />
                    ) : (row.sortOrder ?? idx + 1)}
                  </td>
                  <td className="p-2 align-top">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" disabled={idx === 0} onClick={() => move(String(row._id), -1)}>Lên</Button>
                      <Button size="sm" variant="outline" disabled={idx === items.length - 1} onClick={() => move(String(row._id), 1)}>Xuống</Button>
                      {editingId === String(row._id) ? (
                        <>
                          <Button size="sm" onClick={() => saveEdit(String(row._id))}>Lưu</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Hủy</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(String(row._id)); startEdit(row); }}>Sửa</Button>
                          <Button size="sm" variant="secondary" onClick={() => setDefault({ id: row._id as any } as any)}>Đặt mặc định</Button>
                          <Button size="sm" variant="outline" onClick={() => toggle({ id: row._id as any, field: "isVisible" } as any)}>{row.isVisible ? "Ẩn" : "Hiện"}</Button>
                          <Button size="sm" variant="destructive" onClick={() => remove({ id: row._id as any } as any)}>Xoá</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


