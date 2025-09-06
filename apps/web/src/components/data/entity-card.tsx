"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StorageImage } from "@/components/shared/storage-image";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";

export type EntityCardProps = {
  title: string;
  description?: string;
  badge?: string;
  variants?: Array<{
    price: number;
    originalPrice?: number;
  }>;
  images?: string[];
  inStock?: boolean;
  externalUrl?: string;
  stockQuantity?: number;
  onClick?: () => void;
  className?: string;
};

export function EntityCard({
  title,
  description,
  badge,
  variants,
  images,
  inStock,
  stockQuantity,
  externalUrl,
  onClick,
  className,
}: EntityCardProps) {
  const lowestPrice = variants && variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : undefined;

  const lowestOriginalPrice =
    variants && variants.length > 0 && variants.some((v) => v.originalPrice)
      ? Math.min(...variants.map((v) => v.originalPrice || Infinity))
      : undefined;

  const discountPercent = lowestOriginalPrice && lowestPrice
    ? Math.round(((lowestOriginalPrice - lowestPrice) / lowestOriginalPrice) * 100)
    : 0;

  // Chuẩn hoá URL ngoài để đảm bảo an toàn khi mở tab mới
  const safeExternalUrl = useMemo(() => {
    if (!externalUrl) return undefined;
    try {
      const u = new URL(
        externalUrl,
        typeof window !== "undefined" ? window.location.origin : "https://example.com",
      );
      if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
      return undefined;
    } catch {
      return undefined;
    }
  }, [externalUrl]);

  return (
    <div
      onClick={onClick}
      className={cn("text-left cursor-pointer", className)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <Card className="group relative h-full w-full cursor-pointer rounded-xl border border-gray-200 bg-white/80 p-5 transition-all duration-300 hover:border-gold/60 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-800">
        {/* Hình ảnh */}
        {images && images.length > 0 && images[0] && images[0] !== "undefined" ? (
          <div className="relative mb-4 overflow-hidden rounded-lg">
            <div className="relative h-48 w-full">
              <StorageImage
                imageId={images[0]}
                alt={title}
                className="h-48 w-full"
                imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            {/* Nhãn giảm giá */}
            {discountPercent > 0 && (
              <Badge className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                -{discountPercent}%
              </Badge>
            )}
          </div>
        ) : (
          <div className="mb-4 h-48 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        )}

        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-gray-900 dark:text-white">
            {title}
          </h3>
          {badge ? (
            <Badge className="shrink-0 rounded-full bg-gold/10 px-3 py-1 text-xs text-gold dark:bg-gold/20 dark:text-gold">
              {badge}
            </Badge>
          ) : null}
        </div>

        {description ? (
          <p className="mt-3 line-clamp-3 text-sm text-muted-foreground dark:text-gray-300">{description}</p>
        ) : null}

        {(onClick || safeExternalUrl) ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {onClick ? (
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
                aria-label="Xem thông tin"
              >
                <Eye className="mr-2 h-4 w-4" /> Xem thông tin
              </Button>
            ) : null}
            {safeExternalUrl ? (
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <a
                  href={safeExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Mở trong tab mới"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Mở trong tab mới
                </a>
              </Button>
            ) : null}
          </div>
        ) : null}

        {/* Giá sản phẩm */}
        <div className="mt-3">
          {lowestPrice !== undefined ? (
            <div className="flex items-center">
              {lowestOriginalPrice && lowestOriginalPrice > lowestPrice ? (
                <>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">Từ {formatPrice(lowestPrice)}</span>
                  <span className="ml-2 text-sm text-gray-500 line-through dark:text-gray-400">
                    {formatPrice(lowestOriginalPrice)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900 dark:text-white">Từ {formatPrice(lowestPrice)}</span>
              )}
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900 dark:text-white">Liên hệ</span>
          )}
        </div>

        {/* Thông tin tồn kho */}
        <div className="mt-2 text-sm">
          {inStock !== undefined ? (
            inStock ? (
              <span className="text-green-600 dark:text-green-400">
                Còn hàng {stockQuantity !== undefined && `(${stockQuantity})`}
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">Hết hàng</span>
            )
          ) : null}
        </div>

        {/* Overlay hiệu ứng hover: không chặn click */}
        <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 group-hover:border-gold/30" />
      </Card>
    </div>
  );
}

// Hàm định dạng giá tiền
function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

