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
      <Card className="group relative h-full w-full cursor-pointer rounded-xl border bg-white/70 p-5 transition-all duration-300 hover:shadow-lg hover:border-yellow-400/60 dark:bg-gray-800/50 dark:hover:bg-gray-800/80">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-gray-900 dark:text-white">{title}</h3>
          {badge ? <Badge className="shrink-0 rounded-full px-2.5 py-0.5 text-xs">{badge}</Badge> : null}
        </div>
        {description ? (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm dark:text-gray-300">{description}</p>
        ) : null}
        <div className="absolute inset-0 rounded-xl border border-transparent transition-all duration-300 group-hover:border-yellow-400/30" />
      </Card>
    </button>
  );
}
