import Link from "next/link";
import { cn } from "@/lib/utils";

export type RankingListItem = {
  id: string;
  href?: string;
  avatarUrl: string | null;
  displayName: string;
  steamId: string | null;
  value: React.ReactNode;
  valueRaw: number; // para mostrar el valor en texto plano si querés
  subtitle?: string;
  extra?: React.ReactNode; // para columnas extra (ej: tier de premier)
};

type Props = {
  items: RankingListItem[];
  valueLabel: string;
};

export function RankingList({ items, valueLabel }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">Sin datos todavía.</p>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {items.map((item, i) => {
        const position = i + 1;
        const isTop3 = position <= 3;

        const inner = (
          <div
            className={cn(
              "flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0 transition",
              item.href && "hover:bg-muted/30"
            )}
          >
            {/* Posición */}
            <div
              className={cn(
                "font-display text-xl font-bold w-8 text-center shrink-0",
                position === 1 && "text-yellow-400",
                position === 2 && "text-gray-300",
                position === 3 && "text-amber-700",
                position > 3 && "text-muted-foreground/50"
              )}
            >
              {position}
            </div>

            {/* Avatar */}
            {item.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.avatarUrl}
                alt={item.displayName}
                className="h-10 w-10 rounded-full border border-border shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
            )}

            {/* Nombre */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {item.displayName}
              </p>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {item.subtitle}
                </p>
              )}
            </div>

            {/* Columnas extra */}
            {item.extra && <div className="shrink-0">{item.extra}</div>}

            {/* Valor */}
            <div className="font-display font-bold text-lg shrink-0">
              {item.value}
            </div>
          </div>
        );

        return item.href ? (
          <Link key={item.id} href={item.href}>
            {inner}
          </Link>
        ) : (
          <div key={item.id}>{inner}</div>
        );
      })}
    </div>
  );
}