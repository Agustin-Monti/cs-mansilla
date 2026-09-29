import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PodiumRanking } from "@/components/ranking/PodiumRanking";
import { PremierBadge } from "@/components/ranking/PremierBadge";
import { PlayerTable } from "@/components/players/PlayerTable";
import { getAllPlayers } from "@/lib/queries";

export default async function RankingPage() {
  const players = await getAllPlayers();

  // Filtrar solo los que tienen stats de Leetify (con premier_rank)
  const withPremier = players.filter(
    (p) => p.stats?.premier_rank !== null && p.stats?.premier_rank !== undefined
  );

  // Ranking 1: Premier
  const topPremier = [...withPremier]
    .sort((a, b) => (b.stats?.premier_rank ?? 0) - (a.stats?.premier_rank ?? 0))
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      href: `/jugador/${p.steam_id}`,
      avatarUrl: p.avatar_url,
      displayName: p.display_name ?? p.steam_username,
      value: <PremierBadge points={p.stats?.premier_rank ?? null} size="lg" />,
    }));

  // Ranking 2: Aim
  const topAim = [...withPremier]
    .sort((a, b) => (b.stats?.aim ?? 0) - (a.stats?.aim ?? 0))
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      href: `/jugador/${p.steam_id}`,
      avatarUrl: p.avatar_url,
      displayName: p.display_name ?? p.steam_username,
      value: (
        <span className="text-primary">
          {p.stats?.aim?.toFixed(1) ?? "N/A"}
        </span>
      ),
    }));

  // Ranking 3: Winrate (como "horas" no lo tenemos aún)
  const topWinrate = [...withPremier]
    .sort((a, b) => (b.stats?.winrate ?? 0) - (a.stats?.winrate ?? 0))
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      href: `/jugador/${p.steam_id}`,
      avatarUrl: p.avatar_url,
      displayName: p.display_name ?? p.steam_username,
      value: (
        <span className="text-primary">
          {p.stats?.winrate?.toFixed(1) ?? "N/A"}%
        </span>
      ),
    }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-12">
          <p className="font-display text-xs tracking-[0.3em] text-primary mb-2">
            COMPETITIVO
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            Ranking
          </h1>
        </div>

        <div className="space-y-16">
          {topPremier.length > 0 && (
            <PodiumRanking
              title="Top Premier"
              valueLabel="Puntos de Premier"
              items={topPremier}
              viewAllHref="/ranking/premier"
            />
          )}

          {topAim.length > 0 && (
            <PodiumRanking
              title="Mejor Aim"
              valueLabel="Rating de Aim (Leetify)"
              items={topAim}
              viewAllHref="/ranking/aim"
            />
          )}

          {topWinrate.length > 0 && (
            <PodiumRanking
              title="Mejor Winrate"
              valueLabel="Porcentaje de victorias"
              items={topWinrate}
              viewAllHref="/ranking/winrate"
            />
          )}
        </div>

        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold mb-6">
            Todos los jugadores
          </h2>
          <PlayerTable players={players} />
        </section>
      </main>
      <Footer />
    </div>
  );
}