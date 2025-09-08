import { api } from "@nhanbanacc/backend/convex/_generated/api";
import type { ReactNode } from "react";
import { createElement } from "react";
import ProductFirstImageCell from "@/components/admin/ProductFirstImageCell";

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "select"
  | "fk";

export type FieldConfig = {
	name: string;
	label: string;
	type: FieldType;
	placeholder?: string;
	required?: boolean;
	help?: string;
	options?: { label: string; value: string }[]; // for select
	fk?: { resource: string; labelFields?: string[] };
};

export type ResourceConfig = {
  key: string; // resource key == convex module name
  title: string;
  listColumns: { key: string; label: string; width?: string; render?: (row: any) => ReactNode }[];
  searchPlaceholder?: string;
  defaultSort?: { field: string; direction?: "asc" | "desc" };
  toggles?: string[]; // boolean fields that can be toggled
  createFields: FieldConfig[];
  editFields?: FieldConfig[]; // default = createFields
};

// Helper to read convex api module by resource key at runtime
export const apiOf = (resource: string): any => (api as any)[resource];

export const RESOURCES: ResourceConfig[] = [
  {
    key: "service_websites",
    title: "Dịch vụ website",
    listColumns: [
      { key: "title", label: "Tiêu đề" },
      { key: "clientName", label: "Khách hàng" },
      { key: "websiteUrl", label: "URL" },
      { key: "price", label: "Giá" },
      { key: "isPriceVisible", label: "Hiển giá" },
      { key: "isVisible", label: "Hiển thị" },
      { key: "sortOrder", label: "Thứ tự" },
    ],
    searchPlaceholder: "Tìm tiêu đề, URL, khách hàng...",
    defaultSort: { field: "sortOrder", direction: "asc" },
    toggles: ["isVisible", "isPriceVisible"],
    createFields: [
      { name: "title", label: "Tiêu đề", type: "text", required: true },
      { name: "summary", label: "Tóm tắt", type: "textarea" },
      { name: "description", label: "Mô tả", type: "richtext" },
      { name: "websiteUrl", label: "URL website", type: "text" },
      { name: "clientName", label: "Tên khách hàng", type: "text" },
      { name: "price", label: "Giá", type: "number" },
      { name: "isPriceVisible", label: "Hiển giá", type: "boolean", required: true },
      { name: "sortOrder", label: "Thứ tự", type: "number", required: true },
      { name: "isVisible", label: "Hiển thị", type: "boolean", required: true },
    ],
  },
  {
    key: "users",
    title: "Người dùng",
    listColumns: [
      { key: "name", label: "Tên" },
      { key: "email", label: "Email" },
      { key: "role", label: "Vai trò" },
      { key: "isActive", label: "Kích hoạt" },
    ],
    searchPlaceholder: "Tìm tên, email, vai trò...",
    defaultSort: { field: "_creationTime", direction: "desc" },
    toggles: ["isActive"],
    createFields: [
      { name: "name", label: "Tên", type: "text", required: true },
      { name: "email", label: "Email", type: "text", required: true },
      { name: "role", label: "Vai trò", type: "text", required: true },
      { name: "isActive", label: "Kích hoạt", type: "boolean", required: true },
    ],
  },
  {
    key: "customers",
    title: "Khách hàng",
    listColumns: [
      { key: "name", label: "Tên" },
      { key: "email", label: "Email" },
      { key: "sdt", label: "SĐT" },
      { key: "isActive", label: "Kích hoạt" },
    ],
    searchPlaceholder: "Tìm tên, email, sđt...",
    defaultSort: { field: "_creationTime", direction: "desc" },
    toggles: ["isActive"],
    createFields: [
      { name: "name", label: "Tên", type: "text", required: true },
      { name: "email", label: "Email", type: "text", required: true },
      { name: "sdt", label: "Số điện thoại", type: "text", required: true },
      { name: "passwordHash", label: "Mật khẩu (hash)", type: "text", required: true },
      { name: "diaChi", label: "Địa chỉ", type: "text" },
      { name: "ghiChu", label: "Ghi chú", type: "textarea" },
      { name: "isActive", label: "Kích hoạt", type: "boolean", required: true },
    ],
  },
  {
    key: "categories",
    title: "Danh mục",
    listColumns: [
      { key: "name", label: "Tên" },
      { key: "slug", label: "Slug" },
      { key: "isVisible", label: "Hiển thị" },
      { key: "sortOrder", label: "Thứ tự" },
    ],
    searchPlaceholder: "Tìm tên, slug...",
    defaultSort: { field: "sortOrder", direction: "asc" },
    toggles: ["isVisible"],
    createFields: [
      { name: "name", label: "Tên", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "description", label: "Mô tả", type: "textarea" },
      { name: "sortOrder", label: "Thứ tự", type: "number", required: true },
      { name: "isVisible", label: "Hiển thị", type: "boolean", required: true },
    ],
  },
  {
    key: "products",
    title: "Sản phẩm",
    listColumns: [
      { key: "preview", label: "Ảnh", width: "w-[84px]", render: (row: any) => createElement(ProductFirstImageCell as any, { productId: String(row._id), size: 56 }) },
      { key: "name", label: "Tên" },
      { key: "slug", label: "Slug" },
      { key: "inventoryQuantity", label: "Tồn kho" },
      { key: "soldQuantity", label: "Đã bán" },
      { key: "status", label: "Trạng thái" },
      { key: "isVisible", label: "Hiển thị" },
      { key: "sortOrder", label: "Thứ tự" },
    ],
    searchPlaceholder: "Tìm theo tên, slug...",
    defaultSort: { field: "sortOrder", direction: "asc" },
    toggles: ["isVisible", "showSecondaryImages"],
    createFields: [
      { name: "name", label: "Tên", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "description", label: "Mô tả", type: "textarea" },
      { name: "shortDesc", label: "Tóm tắt", type: "textarea" },
      { name: "inventoryQuantity", label: "Tồn kho", type: "number" },
      { name: "soldQuantity", label: "Đã bán", type: "number" },
      { name: "status", label: "Trạng thái", type: "select", options: [
        { label: "draft", value: "draft" },
        { label: "published", value: "published" },
      ], required: true },
      { name: "sortOrder", label: "Thứ tự", type: "number", required: true },
      { name: "isVisible", label: "Hiển thị", type: "boolean", required: true },
      { name: "showSecondaryImages", label: "Hiện ảnh phụ", type: "boolean" },
      { name: "categoryId", label: "Danh mục", type: "fk", fk: { resource: "categories", labelFields: ["name", "slug"] }, required: true },
    ],
  },
  {
    key: "images",
    title: "Ảnh",
    listColumns: [
      { key: "filename", label: "Tên file" },
      { key: "mimeType", label: "MIME" },
      { key: "size", label: "Kích thước" },
      { key: "isVisible", label: "Hiển thị" },
    ],
    defaultSort: { field: "sortOrder", direction: "asc" },
    toggles: ["isVisible"],
    createFields: [
      { name: "filename", label: "Tên file", type: "text", required: true },
      { name: "url", label: "URL", type: "text", required: true },
      { name: "alt", label: "Alt", type: "text" },
      { name: "title", label: "Tiêu đề", type: "text" },
      { name: "size", label: "Kích thước (bytes)", type: "number", required: true },
      { name: "mimeType", label: "MIME", type: "text", required: true },
      { name: "sortOrder", label: "Thứ tự", type: "number", required: true },
      { name: "isVisible", label: "Hiển thị", type: "boolean", required: true },
    ],
  },
  {
    key: "posts",
    title: "Bài viết",
    listColumns: [
      { key: "title", label: "Tiêu đề" },
      { key: "slug", label: "Slug" },
      { key: "status", label: "Trạng thái" },
      { key: "isVisible", label: "Hiển thị" },
      { key: "sortOrder", label: "Thứ tự" },
    ],
    toggles: ["isVisible"],
    defaultSort: { field: "sortOrder", direction: "asc" },
    createFields: [
      { name: "title", label: "Tiêu đề", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "excerpt", label: "Tóm tắt", type: "textarea" },
      { name: "content", label: "Nội dung", type: "textarea", required: true },
      { name: "status", label: "Trạng thái", type: "select", options: [ { label: "draft", value: "draft" }, { label: "published", value: "published" } ], required: true },
      { name: "sortOrder", label: "Thứ tự", type: "number", required: true },
      { name: "isVisible", label: "Hiển thị", type: "boolean", required: true },
      { name: "thumbnailId", label: "Thumbnail", type: "fk", fk: { resource: "images", labelFields: ["title", "filename"] } },
    ],
  },
  {
    key: "faqs",
    title: "FAQ",
    listColumns: [
      { key: "question", label: "Câu hỏi" },
      { key: "isVisible", label: "Hiển thị" },
      { key: "sortOrder", label: "Thứ tự" },
    ],
    toggles: ["isVisible"],
    defaultSort: { field: "sortOrder", direction: "asc" },
    createFields: [
      { name: "question", label: "Câu hỏi", type: "text", required: true },
      { name: "answer", label: "Trả lời", type: "textarea", required: true },
      { name: "sortOrder", label: "Thứ tự", type: "number", required: true },
      { name: "isVisible", label: "Hiển thị", type: "boolean", required: true },
    ],
  },
  {
    key: "sliders",
    title: "Slider",
    listColumns: [
      { key: "title", label: "Tiêu đề" },
      { key: "isVisible", label: "Hiển thị" },
      { key: "sortOrder", label: "Thứ tự" },
    ],
    toggles: ["isVisible"],
    defaultSort: { field: "sortOrder", direction: "asc" },
    createFields: [
      { name: "title", label: "Tiêu đề", type: "text", required: true },
      { name: "subtitle", label: "Phụ đề", type: "text" },
      { name: "content", label: "Nội dung", type: "textarea" },
      { name: "buttonText", label: "Nút - text", type: "text" },
      { name: "buttonLink", label: "Nút - link", type: "text" },
      { name: "imageId", label: "Ảnh", type: "fk", fk: { resource: "images", labelFields: ["title", "filename"] }, required: true },
      { name: "sortOrder", label: "Thứ tự", type: "number", required: true },
      { name: "isVisible", label: "Hiển thị", type: "boolean", required: true },
    ],
  },
  {
    key: "settings",
    title: "Cấu hình",
    listColumns: [
      { key: "key", label: "Key" },
      { key: "value", label: "Value" },
      { key: "type", label: "Type" },
      { key: "group", label: "Group" },
    ],
    searchPlaceholder: "Tìm theo key, label, group...",
    defaultSort: { field: "_creationTime", direction: "desc" },
    createFields: [
      { name: "key", label: "Key", type: "text", required: true },
      { name: "value", label: "Value", type: "text", required: true },
      { name: "group", label: "Group", type: "text" },
      { name: "label", label: "Label", type: "text" },
      { name: "description", label: "Mô tả", type: "textarea" },
      { name: "type", label: "Type", type: "text", required: true },
    ],
  },
  {
    key: "reviews",
    title: "Đánh giá",
    listColumns: [
      { key: "productId", label: "Sản phẩm" },
      { key: "customerId", label: "Khách hàng" },
      { key: "rating", label: "Đánh giá" },
      { key: "title", label: "Tiêu đề" },
      { key: "isVisible", label: "Hiển thị" },
      { key: "sortOrder", label: "Thứ tự" },
    ],
    searchPlaceholder: "Tìm theo tiêu đề...",
    defaultSort: { field: "sortOrder", direction: "asc" },
    toggles: ["isVisible"],
    createFields: [
      { name: "productId", label: "Sản phẩm", type: "fk", fk: { resource: "products", labelFields: ["name"] }, required: true },
      { name: "customerId", label: "Khách hàng", type: "fk", fk: { resource: "customers", labelFields: ["name", "email"] }, required: true },
      { name: "rating", label: "Đánh giá (1-5)", type: "number", required: true },
      { name: "title", label: "Tiêu đề", type: "text", required: true },
      { name: "content", label: "Nội dung", type: "textarea", required: true },
      { name: "sortOrder", label: "Thứ tự", type: "number", required: true },
      { name: "isVisible", label: "Hiển thị", type: "boolean", required: true },
    ],
  },
];

export const RESOURCES_MAP = Object.fromEntries(
  RESOURCES.map((r) => [r.key, r]),
);



