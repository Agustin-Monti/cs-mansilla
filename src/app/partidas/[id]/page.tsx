import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StatBadge } from "@/components/players/StatBadge";
import { getMatchById } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PartidaPage({ params }: Props) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) notFound();

  const isWin = match.result === "W";

  // Ordenar jugadores por K/D
  const sortedPlayers = [...match.players].sort((a, b) => {
    const kdA = a.deaths === 0 ? a.kills : a.kills / a.deaths;
    const kdB = b.deaths === 0 ? b.kills : b.kills / b.deaths;
    return kdB - kdA;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <Link
          href="/partidas"
          className="text-sm text-muted-foreground hover:text-primary transition mb-6 inline-block"
        >
          ← Volver a partidas
        </Link>

        {/* Score */}
        <section className="mb-10">
          <p className="font-display text-xs tracking-[0.3em] text-primary mb-2">
            {match.map.toUpperCase()}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            CS-Mansilla vs Rival
          </h1>

          <div className="flex items-center gap-6">
            <span
              className={cn(
                "font-display text-6xl font-bold",
                isWin ? "text-primary" : "text-muted-foreground"
              )}
            >
              {match.score_team}
            </span>
            <span className="text-muted-foreground text-3xl">-</span>
            <span
              className={cn(
                "font-display text-6xl font-bold",
                !isWin ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {match.score_enemy}
            </span>
            <span
              className={cn(
                "font-display text-2xl font-bold ml-4",
                isWin ? "text-primary" : "text-destructive"
              )}
            >
              {match.result}
            </span>
          </div>

          {match.mvp && (
            <p className="text-muted-foreground mt-4">
              ⭐ MVP:{" "}
              <span className="text-foreground font-medium">
                {match.mvp.display_name ?? match.mvp.steam_username}
              </span>
            </p>
          )}
        </section>

        {/* Tabla de jugadores */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">
            Rendimiento por jugador
          </h2>
          <div className="rounded-lg border border-border overflow-hidden">
            {sortedPlayers.map((p) => {
              const kd =
                p.deaths === 0
                  ? p.kills
                  : Math.round((p.kills / p.deaths) * 100) / 100;

              return (
                <Link
                  key={p.id}
                  href={`/jugador/${p.steam_id}`}
                  className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition"
                >
                  {p.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatar_url}
                      alt={p.steam_username}
                      className="h-10 w-10 rounded-full border border-border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {p.display_name ?? p.steam_username}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      K/D {kd.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex gap-4 md:gap-6 text-sm font-mono">
                    <div className="text-center">
                      <p className="text-foreground">{p.kills}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        K
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-foreground">{p.deaths}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        D
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-foreground">{p.assists}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        A
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-foreground">{p.headshots}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        HS
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}