import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MatchCard } from "@/components/matches/MatchCard";
import { getRecentMatches } from "@/lib/queries";

export const metadata = {
  title: "Partidas · CS-Mansilla",
  description: "Historial de partidas de CS-Mansilla.",
};

export default async function PartidasPage() {
  const matches = await getRecentMatches(50);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="font-display text-xs tracking-[0.3em] text-primary mb-2">
            HISTORIAL
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            Partidas
          </h1>
          <p className="text-muted-foreground mt-2">
            {matches.length} partida{matches.length !== 1 ? "s" : ""}{" "}
            registrada{matches.length !== 1 ? "s" : ""}.
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              Todavía no hay partidas cargadas.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}