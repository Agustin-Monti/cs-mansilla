import Link from "next/link";
import type { MatchWithDetails } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Props = {
  match: MatchWithDetails;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Hace ${d} d`;
  const w = Math.floor(d / 7);
  return `Hace ${w} sem`;
}

export function MatchCard({ match }: Props) {
  const isWin = match.result === "W";

  return (
    <Link
      href={`/partidas/${match.id}`}
      className="group block rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition"
    >
      {/* Header: mapa + tiempo */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {match.map}
        </span>
        <span className="text-xs text-muted-foreground">
          {timeAgo(match.played_at)}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm text-muted-foreground truncate">
            CS-Mansilla
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "font-display text-3xl font-bold leading-none",
              isWin ? "text-primary" : "text-muted-foreground"
            )}
          >
            {match.score_team}
          </span>
          <span className="text-muted-foreground text-lg">-</span>
          <span
            className={cn(
              "font-display text-3xl font-bold leading-none",
              !isWin ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {match.score_enemy}
          </span>
        </div>

        <div className="flex-1 text-right">
          <span
            className={cn(
              "font-display text-sm font-bold",
              isWin ? "text-primary" : "text-destructive"
            )}
          >
            {match.result}
          </span>
        </div>
      </div>

      {/* MVP */}
      {match.mvp && (
        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground truncate">
          ⭐ MVP:{" "}
          <span className="text-foreground">
            {match.mvp.display_name ?? match.mvp.steam_username}
          </span>
        </div>
      )}
    </Link>
  );
}