import { EntityCard } from "@/components/data/entity-card";

export type EntityCardGridProps<T> = {
  items: T[] | undefined;
  getKey: (t: T) => string;
  getTitle: (t: T) => string;
  getDescription?: (t: T) => string | undefined;
  getBadge?: (t: T) => string | undefined;
  onItemClick?: (t: T) => void;
  empty?: React.ReactNode;
};

export function EntityCardGrid<T>({ items, getKey, getTitle, getDescription, getBadge, onItemClick, empty }: EntityCardGridProps<T>) {
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
      {items.map((it) => (
        <EntityCard
          key={getKey(it)}
          title={getTitle(it)}
          description={getDescription?.(it)}
          badge={getBadge?.(it)}
          onClick={() => onItemClick?.(it)}
        />
      ))}
    </div>
  );
}

