import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StatBadge } from "@/components/players/StatBadge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { LeetifySyncButton } from "@/components/profile/LeetifySyncButton";

export const metadata = {
  title: "Mi perfil · CS-Mansilla",
};

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: player } = await supabase
    .from("players")
    .select(
      `
      id,
      steam_id,
      steam_username,
      display_name,
      avatar_url,
      role,
      joined_at,
      player_stats (
        kills,
        deaths,
        headshots,
        wins,
        losses,
        mvps,
        matches_played,
        premier_rank,
        leetify_rating,
        aim,
        positioning,
        utility,
        preaim,
        reaction_time_ms,
        accuracy_head,
        winrate,
        leetify_available,
        leetify_synced_at
      )
    `
    )
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!player) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <p className="text-muted-foreground">
            No encontramos tu perfil. Contactá a un admin.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const stats = Array.isArray(player.player_stats)
    ? player.player_stats[0]
    : player.player_stats;

  const displayName = player.display_name ?? player.steam_username;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Header del perfil */}
        <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 mb-8 md:mb-10 text-center md:text-left">
          {player.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.avatar_url}
              alt={displayName}
              className="h-20 w-20 md:h-24 md:w-24 rounded-full border-2 border-primary/30 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-display text-xs tracking-[0.3em] text-primary mb-2">
              MI PERFIL
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-bold truncate">
              {displayName}
            </h1>
            {player.steam_id && (
              <p className="text-muted-foreground mt-1 font-mono text-xs md:text-sm">
                {player.steam_id}
              </p>
            )}
          </div>
          {player.steam_id && (
            <Button asChild variant="outline" className="w-full md:w-auto">
              <Link href={`/jugador/${player.steam_id}`}>
                Ver perfil público
              </Link>
            </Button>
          )}
        </div>

        {/* Stats de Leetify */}
        {stats?.leetify_available ? (
          <section className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl font-semibold">
                  Stats de Leetify
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-primary border border-primary/30 rounded px-2 py-0.5">
                  Sincronizado
                </span>
              </div>
              <LeetifySyncButton />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatBadge
                label="Premier"
                value={stats.premier_rank?.toLocaleString("es-AR") ?? "N/A"}
                highlight
              />
              <StatBadge
                label="Leetify Rating"
                value={stats.leetify_rating?.toFixed(2) ?? "N/A"}
              />
              <StatBadge
                label="Winrate"
                value={stats.winrate ? `${stats.winrate}%` : "N/A"}
              />
              <StatBadge
                label="Partidas"
                value={stats.matches_played ?? 0}
              />
              <StatBadge
                label="Aim"
                value={stats.aim?.toFixed(1) ?? "N/A"}
              />
              <StatBadge
                label="Positioning"
                value={stats.positioning?.toFixed(1) ?? "N/A"}
              />
              <StatBadge
                label="Utility"
                value={stats.utility?.toFixed(1) ?? "N/A"}
              />
              <StatBadge
                label="Reaction"
                value={
                  stats.reaction_time_ms
                    ? `${Math.round(stats.reaction_time_ms)} ms`
                    : "N/A"
                }
              />
            </div>
          </section>
        ) : (
          <section className="mb-10">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 md:p-6">
              <p className="font-display text-sm tracking-wider text-primary mb-2">
                SIN LEETIFY
              </p>
              <h2 className="font-display text-xl md:text-2xl font-bold mb-3">
                Todavía no tenés stats
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-2xl">
                Para que tus partidas de CS2 aparezcan en CS-Mansilla,
                necesitás registrarte en Leetify. Es gratis, toma 2 minutos
                y se vincula automáticamente con tu cuenta de Steam.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <Button asChild className="w-full sm:w-auto">
                  <a
                    href="https://leetify.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Registrarme en Leetify →
                  </a>
                </Button>
                <LeetifySyncButton />
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}