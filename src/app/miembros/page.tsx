import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PlayerTable } from "@/components/players/PlayerTable";
import { getAllPlayers } from "@/lib/queries";

export const metadata = {
  title: "Miembros · CS-Mansilla",
  description: "Todos los jugadores de la comunidad CS-Mansilla.",
};

export default async function MiembrosPage() {
  const players = await getAllPlayers();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="font-display text-xs tracking-[0.3em] text-primary mb-2">
            COMUNIDAD
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            Miembros
          </h1>
          <p className="text-muted-foreground mt-2">
            {players.length} jugador{players.length !== 1 ? "es" : ""} activo
            {players.length !== 1 ? "s" : ""} en CS-Mansilla.
          </p>
        </div>

        {players.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              Todavía no hay jugadores cargados.
            </p>
          </div>
        ) : (
          <PlayerTable players={players} />
        )}
      </main>

      <Footer />
    </div>
  );
}