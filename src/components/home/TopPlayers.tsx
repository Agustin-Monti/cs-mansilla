import Link from "next/link";
import { PlayerCard } from "@/components/players/PlayerCard";
import type { PlayerWithStats } from "@/lib/queries";
import { Button } from "@/components/ui/button";

type Props = {
  players: PlayerWithStats[];
};

export function TopPlayers({ players }: Props) {
  const top = [...players]
    .sort((a, b) => (b.stats?.mvps ?? 0) - (a.stats?.mvps ?? 0))
    .slice(0, 3);

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-display text-xs tracking-[0.3em] text-primary mb-2">
            RANKING
          </p>
          <h2 className="font-display text-3xl font-bold">Top jugadores</h2>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/ranking">Ver ranking completo →</Link>
        </Button>
      </div>

      <div className="grid gap-3">
        {top.map((p, i) => (
          <PlayerCard key={p.id} player={p} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}