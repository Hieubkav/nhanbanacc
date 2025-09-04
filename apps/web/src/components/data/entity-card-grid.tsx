import { EntityCard } from "@/components/data/entity-card";

export type EntityCardGridProps<T> = {
  items: T[] | undefined;
  getKey: (t: T) => string;
  getTitle: (t: T) => string;
  getDescription?: (t: T) => string | undefined;
  getBadge?: (t: T) => string | undefined;
  // Thêm các hàm để lấy thông tin sản phẩm mới
  getVariants?: (t: T) => Array<{ price: number; originalPrice?: number }> | undefined;
  getImages?: (t: T) => string[] | undefined;
  getInStock?: (t: T) => boolean | undefined;
  getStockQuantity?: (t: T) => number | undefined;
  onItemClick?: (t: T) => void;
  empty?: React.ReactNode;
};

export function EntityCardGrid<T>({ 
  items, 
  getKey, 
  getTitle, 
  getDescription, 
  getBadge,
  getVariants,
  getImages,
  getInStock,
  getStockQuantity,
  onItemClick, 
  empty 
}: EntityCardGridProps<T>) {
  if (!items) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border bg-muted/30" />
        ))}
      </div>
    );
  }

  if (items.length === 0) return <div className="text-muted-foreground text-sm">{empty ?? "Không có dữ liệu"}</div>;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((it) => {
        const images = getImages?.(it);
        // Kiểm tra images trước khi truyền vào EntityCard
        const validImages = images && Array.isArray(images) && images.length > 0 
          ? images.filter((id: string) => id && id !== "undefined")
          : undefined;
          
        return (
          <EntityCard
            key={getKey(it)}
            title={getTitle(it)}
            description={getDescription?.(it)}
            badge={getBadge?.(it)}
            variants={getVariants?.(it)}
            images={validImages && validImages.length > 0 ? validImages : undefined}
            inStock={getInStock?.(it)}
            stockQuantity={getStockQuantity?.(it)}
            onClick={() => onItemClick?.(it)}
          />
        );
      })}
    </div>
  );
}

