import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StatBadge } from "@/components/players/StatBadge";
import {
  getPlayerBySteamId,
  getPlayerMatches,
} from "@/lib/queries";
import { cn } from "@/lib/utils";
import { getMapInfo } from "@/lib/maps";

type Props = {
  params: Promise<{ steamId: string }>;
};

export default async function JugadorPage({ params }: Props) {
  const { steamId } = await params;
  const player = await getPlayerBySteamId(steamId);

  if (!player) {
    notFound();
  }

  const matches = await getPlayerMatches(player.id, 5);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Header del perfil */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
          {player.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.avatar_url}
              alt={player.steam_username}
              className="h-24 w-24 rounded-full border-2 border-primary/30"
            />
          )}
          <div className="flex-1">
            <p className="font-display text-xs tracking-[0.3em] text-primary mb-2">
              CS-MANSILLA
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold">
              {player.display_name ?? player.steam_username}
            </h1>
            {player.steam_id && (
              <p className="text-muted-foreground mt-1 font-mono text-sm">
                {player.steam_id}
              </p>
            )}
            {player.role !== "member" && (
              <span className="inline-block mt-2 text-xs uppercase tracking-wider text-primary border border-primary/30 rounded px-2 py-0.5">
                {player.role}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold mb-4">
            Estadísticas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBadge label="K/D" value={player.kd.toFixed(2)} highlight />
            <StatBadge label="Winrate" value={`${player.winrate}%`} />
            <StatBadge label="HS%" value={`${player.hsPercent}%`} />
            <StatBadge
              label="Partidas"
              value={player.stats?.matches_played ?? 0}
            />
            <StatBadge label="Kills" value={player.stats?.kills ?? 0} />
            <StatBadge label="Deaths" value={player.stats?.deaths ?? 0} />
            <StatBadge label="Assists" value={player.stats?.assists ?? 0} />
            <StatBadge label="Horas jugadas" value={player.stats?.playtime_hours ? `${player.stats.playtime_hours}h` : "N/A"}/>
          </div>
        </section>

        {/* Stats de Leetify (si están disponibles) */}
        {player.stats?.leetify_available && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-xl font-semibold">
                Stats de Leetify
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-primary border border-primary/30 rounded px-2 py-0.5">
                Sincronizado
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatBadge
                label="Premier"
                value={player.stats.premier_rank?.toLocaleString("es-AR") ?? "N/A"}
                highlight
              />
              <StatBadge
                label="Leetify Rating"
                value={player.stats.leetify_rating?.toFixed(2) ?? "N/A"}
              />
              <StatBadge
                label="Aim"
                value={player.stats.aim?.toFixed(1) ?? "N/A"}
              />
              <StatBadge
                label="Positioning"
                value={player.stats.positioning?.toFixed(1) ?? "N/A"}
              />
              <StatBadge
                label="Utility"
                value={player.stats.utility?.toFixed(1) ?? "N/A"}
              />
              <StatBadge
                label="Preaim"
                value={player.stats.preaim?.toFixed(1) ?? "N/A"}
              />
              <StatBadge
                label="Reaction"
                value={
                  player.stats.reaction_time_ms
                    ? `${Math.round(player.stats.reaction_time_ms)} ms`
                    : "N/A"
                }
              />
              <StatBadge
                label="HS%"
                value={
                  player.stats.accuracy_head?.toFixed(1) ?? "N/A"
                }
              />
            </div>
          </section>
        )}

        {/* Cartel si NO tiene Leetify */}
        {!player.stats?.leetify_available && (
          <section className="mb-10">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="font-display text-sm tracking-wider text-muted-foreground mb-2">
                SIN LEETIFY
              </p>
              <p className="text-muted-foreground">
                Este jugador todavía no tiene perfil en Leetify. Las stats avanzadas
                no están disponibles.
              </p>
            </div>
          </section>
        )}

        {/* Últimas partidas */}
        <section>
          <h2 className="font-display text-xl font-semibold mb-4">
            Últimas partidas
          </h2>
          {matches.length === 0 ? (
            <p className="text-muted-foreground">
              Sin partidas registradas todavía.
            </p>
          ) : (
            <div className="space-y-3">
              {matches.map((m) => {
                const mapInfo = getMapInfo(m.map);
                const isWin = m.result === "W";

                return (
                  <div
                    key={m.match_id}
                    className="rounded-lg border border-border bg-card overflow-hidden"
                  >
                    {/* Layout móvil: vertical */}
                    <div className="flex flex-col md:hidden">
                      {/* Header con imagen + mapa + resultado */}
                      <div className="flex items-center gap-3 p-3 border-b border-border">
                        <div className="relative w-20 h-14 shrink-0 rounded overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mapInfo.imagePath}
                            alt={mapInfo.displayName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-base font-semibold truncate">
                            {mapInfo.displayName}
                          </p>
                          <p
                            className={cn(
                              "font-display text-xs font-bold",
                              isWin ? "text-green-500" : "text-red-500"
                            )}
                          >
                            {isWin ? "Victoria" : "Derrota"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={cn(
                              "font-display text-lg font-bold",
                              isWin
                                ? "text-green-500"
                                : "text-muted-foreground"
                            )}
                          >
                            {m.score_team}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                          <span
                            className={cn(
                              "font-display text-lg font-bold",
                              !isWin
                                ? "text-red-500"
                                : "text-muted-foreground"
                            )}
                          >
                            {m.score_enemy}
                          </span>
                        </div>
                      </div>

                      {/* Stats K/M/A abajo */}
                      <div className="grid grid-cols-3 divide-x divide-border">
                        <div className="py-2 text-center">
                          <p className="font-mono text-base font-bold">
                            {m.kills}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Kills
                          </p>
                        </div>
                        <div className="py-2 text-center">
                          <p className="font-mono text-base font-bold">
                            {m.deaths}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Muertes
                          </p>
                        </div>
                        <div className="py-2 text-center">
                          <p className="font-mono text-base font-bold">
                            {m.assists}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Asistencias
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Layout desktop: horizontal (igual al actual) */}
                    <div className="hidden md:flex items-center gap-4">
                      {/* Imagen del mapa */}
                      <div className="relative w-32 h-20 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mapInfo.imagePath}
                          alt={mapInfo.displayName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80" />
                      </div>

                      {/* Info del mapa y resultado */}
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-lg font-semibold truncate">
                          {mapInfo.displayName}
                        </p>
                        <p
                          className={cn(
                            "font-display text-sm font-bold",
                            isWin ? "text-green-500" : "text-red-500"
                          )}
                        >
                          {isWin ? "Victoria" : "Derrota"}
                        </p>
                      </div>

                      {/* Stats K/M/A */}
                      <div className="flex items-center gap-4 md:gap-6 px-4 shrink-0">
                        <div className="text-center">
                          <p className="font-mono text-lg font-bold text-foreground">
                            {m.kills}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            K
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-mono text-lg font-bold text-foreground">
                            {m.deaths}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            M
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-mono text-lg font-bold text-foreground">
                            {m.assists}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            A
                          </p>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-2 px-4 shrink-0 border-l border-border py-4">
                        <span
                          className={cn(
                            "font-display text-xl font-bold",
                            isWin
                              ? "text-green-500"
                              : "text-muted-foreground"
                          )}
                        >
                          {m.score_team}
                        </span>
                        <span className="text-muted-foreground">-</span>
                        <span
                          className={cn(
                            "font-display text-xl font-bold",
                            !isWin
                              ? "text-red-500"
                              : "text-muted-foreground"
                          )}
                        >
                          {m.score_enemy}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}