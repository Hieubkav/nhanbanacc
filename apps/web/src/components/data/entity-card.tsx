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
      <Card className="group relative h-full w-full cursor-pointer rounded-xl border border-gray-200 bg-white/80 p-5 transition-all duration-300 hover:shadow-lg hover:border-gold/60 dark:border-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-800">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-gray-900 dark:text-white">{title}</h3>
          {badge ? <Badge className="shrink-0 rounded-full px-3 py-1 text-xs bg-gold/10 text-gold dark:bg-gold/20 dark:text-gold">{badge}</Badge> : null}
        </div>
        {description ? (
          <p className="text-muted-foreground mt-3 line-clamp-3 text-sm dark:text-gray-300">{description}</p>
        ) : null}
        <div className="absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 group-hover:border-gold/30" />
      </Card>
    </button>
  );
}
