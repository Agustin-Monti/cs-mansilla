import Link from "next/link";
import type { PlayerWithStats } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Props = {
  player: PlayerWithStats;
  rank?: number;
};

export function PlayerCard({ player, rank }: Props) {
  return (
    <Link
      href={`/jugador/${player.steam_id}`}
      className="group relative flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition"
    >
      {rank !== undefined && (
        <div
          className={cn(
            "font-display text-2xl font-bold w-8 text-center",
            rank === 1 && "text-primary",
            rank === 2 && "text-muted-foreground",
            rank === 3 && "text-amber-700",
            rank > 3 && "text-muted-foreground/50"
          )}
        >
          {rank}
        </div>
      )}

      {player.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={player.avatar_url}
          alt={player.steam_username}
          className="h-12 w-12 rounded-full border border-border"
        />
      ) : (
        <div className="h-12 w-12 rounded-full bg-muted" />
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate group-hover:text-primary transition">
          {player.display_name ?? player.steam_username}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          K/D {player.kd.toFixed(2)} · {player.winrate}% WR
        </p>
      </div>

      <div className="text-right">
        <p className="font-display text-lg font-bold text-primary">
          {player.stats?.mvps ?? 0}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          MVPs
        </p>
      </div>
    </Link>
  );
}