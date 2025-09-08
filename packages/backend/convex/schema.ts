import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Lưu ý:
// - Convex tự cấp trường hệ thống `_id` và `_creationTime` cho mỗi bản ghi.
//   Do đó không cần tự tạo trường `id` cho từng bảng.
// - Các quan hệ được thể hiện bằng `v.id("<table>")` và đã thêm index cho các khóa tra cứu phổ biến.

export default defineSchema({
  // Giữ nguyên bảng mẫu (nếu còn dùng ở nơi khác)
  todos: defineTable({
    text: v.string(),
    note: v.optional(v.string()),
    completed: v.boolean(),
  }),

  students: defineTable({
    name: v.string(),
    age: v.number(),
    class: v.string(),
  }),

  // ==========================
  // Người dùng (quản trị CMS)
  // ==========================
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(), // epoch ms
    updatedAt: v.number(), // epoch ms
  })
    .index("by_email", { fields: ["email"] })
    .index("by_role", { fields: ["role"] })
    .index("by_isActive", { fields: ["isActive"] }),

  // ==========
  // Customers
  // ==========
  customers: defineTable({
    email: v.string(),
    name: v.string(),
    sdt: v.string(), // số điện thoại
    passwordHash: v.string(),
    diaChi: v.optional(v.string()),
    ghiChu: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", { fields: ["email"] })
    .index("by_sdt", { fields: ["sdt"] })
    .index("by_isActive", { fields: ["isActive"] }),

  // =============================
  // Catalog: Danh mục & Sản phẩm
  // =============================
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.number(),
    isVisible: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", { fields: ["slug"] })
    .index("by_name", { fields: ["name"] })
    .index("by_isVisible", { fields: ["isVisible"] })
    .index("by_sortOrder", { fields: ["sortOrder"] }),

  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    shortDesc: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    status: v.string(),
    sortOrder: v.number(),
    isVisible: v.boolean(),
    showSecondaryImages: v.optional(v.boolean()),
    categoryId: v.id("categories"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", { fields: ["slug"] })
    .index("by_categoryId", { fields: ["categoryId"] })
    .index("by_isVisible", { fields: ["isVisible"] })
    .index("by_status", { fields: ["status"] })
    .index("by_sortOrder", { fields: ["sortOrder"] }),

  product_variants: defineTable({
    productId: v.id("products"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    // Ghi chú riêng cho biến thể
    note: v.optional(v.string()),
    isDefault: v.boolean(),
    sortOrder: v.number(),
    isVisible: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_productId", { fields: ["productId"] })
    .index("by_isVisible", { fields: ["isVisible"] })
    .index("by_isDefault", { fields: ["isDefault"] })
    .index("by_sortOrder", { fields: ["sortOrder"] }),

  images: defineTable({
    filename: v.string(),
    // Duy trì url cho tương thích cũ, nhưng sẽ chuyển sang dùng storageId
    url: v.optional(v.string()),
    // Lưu trực tiếp file vào Convex Storage
    storageId: v.optional(v.id("_storage")),
    alt: v.optional(v.string()),
    title: v.optional(v.string()),
    size: v.number(), // bytes
    mimeType: v.string(),
    sortOrder: v.number(),
    isVisible: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_filename", { fields: ["filename"] })
    .index("by_isVisible", { fields: ["isVisible"] })
    .index("by_sortOrder", { fields: ["sortOrder"] }),

  // Liên kết N-N: products × images
  product_images: defineTable({
    productId: v.id("products"),
    imageId: v.id("images"),
    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_productId", { fields: ["productId", "sortOrder"] })
    .index("by_imageId", { fields: ["imageId"] })
    .index("by_product_image", { fields: ["productId", "imageId"] }),

  // ==================
  // CMS & Tương tác
  // ==================
  reviews: defineTable({
    productId: v.id("products"),
    customerId: v.id("customers"),
    rating: v.number(), // 1..5
    title: v.string(),
    content: v.string(),
    isVisible: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_productId", { fields: ["productId"] })
    .index("by_customerId", { fields: ["customerId"] })
    .index("by_isVisible", { fields: ["isVisible"] })
    .index("by_sortOrder", { fields: ["sortOrder"] }),

  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.optional(v.string()),
    content: v.string(),
    status: v.string(),
    sortOrder: v.number(),
    isVisible: v.boolean(),
    thumbnailId: v.optional(v.id("images")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", { fields: ["slug"] })
    .index("by_status", { fields: ["status"] })
    .index("by_isVisible", { fields: ["isVisible"] })
    .index("by_thumbnailId", { fields: ["thumbnailId"] })
    .index("by_sortOrder", { fields: ["sortOrder"] }),

  // Liên kết N-N: posts × images
  post_images: defineTable({
    postId: v.id("posts"),
    imageId: v.id("images"),
    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_postId", { fields: ["postId", "sortOrder"] })
    .index("by_imageId", { fields: ["imageId"] })
    .index("by_post_image", { fields: ["postId", "imageId"] }),

  sliders: defineTable({
    title: v.string(),
    subtitle: v.optional(v.string()),
    content: v.optional(v.string()),
    buttonText: v.optional(v.string()),
    buttonLink: v.optional(v.string()),
    imageId: v.id("images"),
    sortOrder: v.number(),
    isVisible: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_imageId", { fields: ["imageId"] })
    .index("by_isVisible", { fields: ["isVisible"] })
    .index("by_sortOrder", { fields: ["sortOrder"] }),

  faqs: defineTable({
    question: v.string(),
    answer: v.string(),
    sortOrder: v.number(),
    isVisible: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_isVisible", { fields: ["isVisible"] })
    .index("by_sortOrder", { fields: ["sortOrder"] }),

  // ================
  // Settings (singleton)
  // ================
  settings: defineTable({
    siteName: v.string(),
    slogan: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    logoId: v.optional(v.id("images")),
    faviconId: v.optional(v.id("images")),
    seoDefaultTitle: v.optional(v.string()),
    seoDefaultDescription: v.optional(v.string()),
    socialFacebook: v.optional(v.string()),
    socialYoutube: v.optional(v.string()),
    socialTiktok: v.optional(v.string()),
    socialZalo: v.optional(v.string()),
    uiPrimaryColor: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),


  //=================
  // Dịch vụ thiết kế website
  //=================

  service_websites: defineTable({
    title: v.string(),
    summary: v.optional(v.string()),
    description: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    clientName: v.optional(v.string()),
    isVisible: v.boolean(),
    sortOrder: v.number(),
    price: v.optional(v.number()),
    isPriceVisible: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_isVisible", { fields: ["isVisible"] })
    .index("by_sortOrder", { fields: ["sortOrder"] }),

  // Lien ket N-N: service_websites x images
  service_website_images: defineTable({
    serviceWebsiteId: v.id("service_websites"),
    imageId: v.id("images"),
    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_serviceWebsiteId", { fields: ["serviceWebsiteId", "sortOrder"] })
    .index("by_imageId", { fields: ["imageId"] })
    .index("by_service_image", { fields: ["serviceWebsiteId", "imageId"] }),
});
