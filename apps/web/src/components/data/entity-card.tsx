import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type EntityCardProps = {
  title: string;
  description?: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
};

export function EntityCard({ title, description, badge, onClick, className }: EntityCardProps) {
  return (
    <button type="button" onClick={onClick} className={cn("text-left", className)}>
      <Card className="group relative h-full w-full cursor-pointer rounded-lg border p-4 transition hover:shadow-md hover:border-yellow-400/60">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-medium leading-snug tracking-tight text-zinc-900">{title}</h3>
          {badge ? <Badge className="shrink-0">{badge}</Badge> : null}
        </div>
        {description ? (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{description}</p>
        ) : null}
      </Card>
    </button>
  );
}
