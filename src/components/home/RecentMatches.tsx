import Link from "next/link";
import { MatchCard } from "@/components/matches/MatchCard";
import type { MatchWithDetails } from "@/lib/queries";
import { Button } from "@/components/ui/button";

type Props = {
  matches: MatchWithDetails[];
};

export function RecentMatches({ matches }: Props) {
  const recent = matches.slice(0, 4);

  return (
    <section className="container mx-auto px-4 py-16 border-t border-border">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-display text-xs tracking-[0.3em] text-primary mb-2">
            ACTIVIDAD
          </p>
          <h2 className="font-display text-3xl font-bold">Últimas partidas</h2>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/partidas">Ver todas →</Link>
        </Button>
      </div>

      {recent.length === 0 ? (
        <p className="text-muted-foreground">Sin partidas registradas.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {recent.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </section>
  );
}