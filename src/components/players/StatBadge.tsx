import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  highlight?: boolean;
  className?: string;
};

export function StatBadge({ label, value, highlight, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-border bg-card px-3 py-2",
        className
      )}
    >
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "font-display text-lg font-semibold",
          highlight && "text-primary"
        )}
      >
        {value}
      </span>
    </div>
  );
}