import Link from "next/link";
import { cn } from "@/lib/utils";

export type PodiumItem = {
  id: string;
  href?: string;
  avatarUrl: string | null;
  displayName: string;
  value: React.ReactNode;
  subtitle?: string;
};

type Props = {
  title: string;
  items: PodiumItem[];
  valueLabel: string;
  viewAllHref?: string; // ← NUEVO
};

export function PodiumRanking({ title, items, valueLabel, viewAllHref }: Props) {
  if (items.length === 0) {
    return (
      <section>
        <h2 className="font-display text-2xl font-bold mb-6">{title}</h2>
        <p className="text-muted-foreground">Sin datos todavía.</p>
      </section>
    );
  }

  // Orden visual: 2° | 1° | 3°
  const first = items[0];
  const second = items[1];
  const third = items[2];

  const heights = ["h-40", "h-28", "h-20"];
  const medalColors = ["text-yellow-400", "text-gray-300", "text-amber-700"];

  const renderPodium = (
    item: PodiumItem | undefined,
    place: number,
    height: string,
    medalColor: string
  ) => {
    if (!item) {
      return (
        <div className="flex flex-col items-center gap-3 flex-1">
          <div className={cn("w-full rounded-t-lg border border-border bg-muted/20", height)} />
        </div>
      );
    }

    const inner = (
      <div className="flex flex-col items-center gap-3 flex-1 group">
        {/* Avatar */}
        {item.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.avatarUrl}
            alt={item.displayName}
            className={cn(
              "rounded-full border-2 transition group-hover:scale-105",
              place === 1 ? "h-20 w-20 border-yellow-400/50" : "h-14 w-14 border-border"
            )}
          />
        ) : (
          <div
            className={cn(
              "rounded-full bg-muted",
              place === 1 ? "h-20 w-20" : "h-14 w-14"
            )}
          />
        )}

        {/* Nombre */}
        <div className="text-center">
          <p className={cn("font-display font-bold", place === 1 ? "text-lg" : "text-sm")}>
            {item.displayName}
          </p>
          {item.subtitle && (
            <p className="text-xs text-muted-foreground">{item.subtitle}</p>
          )}
        </div>

        {/* Valor (el dato que se está rankeando) */}
        <div className={cn("font-display font-bold", place === 1 ? "text-2xl" : "text-lg")}>
          {item.value}
        </div>

        {/* Barra del podio */}
        <div
          className={cn(
            "w-full rounded-t-lg border border-border flex items-end justify-center pb-2",
            height,
            place === 1
              ? "bg-gradient-to-t from-yellow-500/20 to-yellow-500/5 border-yellow-500/30"
              : place === 2
                ? "bg-gradient-to-t from-gray-400/20 to-gray-400/5 border-gray-400/30"
                : "bg-gradient-to-t from-amber-700/20 to-amber-700/5 border-amber-700/30"
          )}
        >
          <span className={cn("font-display text-4xl font-black", medalColor)}>
            {place}
          </span>
        </div>
      </div>
    );

    return item.href ? (
      <Link href={item.href} className="flex-1">
        {inner}
      </Link>
    ) : (
      inner
    );
  };

  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
            {valueLabel}
          </p>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm text-primary hover:text-primary/80 transition"
          >
            Ver completo →
          </Link>
        )}
      </div>

      <div className="flex items-end justify-center gap-4">
        {renderPodium(second, 2, heights[1], medalColors[1])}
        {renderPodium(first, 1, heights[0], medalColors[0])}
        {renderPodium(third, 3, heights[2], medalColors[2])}
      </div>
    </section>
  );
}