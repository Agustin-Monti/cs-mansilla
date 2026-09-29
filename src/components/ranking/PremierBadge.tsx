import { getPremierTier } from "@/lib/premier";
import { cn } from "@/lib/utils";

type Props = {
  points: number | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-2 text-lg",
};

export function PremierBadge({
  points,
  size = "md",
  showLabel = false,
  className,
}: Props) {
  const tier = getPremierTier(points);

  if (!tier) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border border-border bg-muted/30 font-mono text-muted-foreground",
          sizeClasses[size],
          className
        )}
      >
        N/A
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border font-mono font-semibold",
        tier.color,
        tier.bgColor,
        tier.borderColor,
        sizeClasses[size],
        className
      )}
    >
      {points?.toLocaleString("es-AR")}
      {showLabel && (
        <span className="text-[0.7em] uppercase tracking-wider opacity-80">
          {tier.name}
        </span>
      )}
    </span>
  );
}