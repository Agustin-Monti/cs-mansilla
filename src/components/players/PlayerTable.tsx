import Link from "next/link";
import type { PlayerWithStats } from "@/lib/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  players: PlayerWithStats[];
};

export function PlayerTable({ players }: Props) {
  return (
    <>
      {/* ============================================ */}
      {/* VISTA DESKTOP: tabla (oculta en mobile)      */}
      {/* ============================================ */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-12">#</TableHead>
              <TableHead className="max-w-[180px] md:max-w-[240px]">
                Jugador
              </TableHead>
              <TableHead className="text-right">K/D</TableHead>
              <TableHead className="text-right">Winrate</TableHead>
              <TableHead className="text-right">Aim</TableHead>
              <TableHead className="text-right">Partidas</TableHead>
              <TableHead className="text-right">Horas jugadas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((p, i) => (
              <TableRow key={p.id}>
                <TableCell className="text-muted-foreground">
                  {i + 1}
                </TableCell>
                <TableCell className="max-w-[180px] md:max-w-[240px]">
                  <Link
                    href={`/jugador/${p.steam_id}`}
                    className="flex items-center gap-3 hover:text-primary transition min-w-0"
                  >
                    {p.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.avatar_url}
                        alt={p.steam_username}
                        className="h-8 w-8 rounded-full border border-border shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className="font-medium truncate"
                        title={p.display_name ?? p.steam_username}
                      >
                        {p.display_name ?? p.steam_username}
                      </span>
                      {p.role !== "member" && (
                        <span className="text-[10px] uppercase tracking-wider text-primary">
                          {p.role}
                        </span>
                      )}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {p.kd.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {p.winrate}%
                </TableCell>
                <TableCell className="text-right font-mono">
                  {p.stats?.aim !== null && p.stats?.aim !== undefined
                    ? p.stats.aim.toFixed(1)
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {p.stats?.matches_played ?? 0}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {p.stats?.playtime_hours !== null &&
                  p.stats?.playtime_hours !== undefined
                    ? `${p.stats.playtime_hours}h`
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ============================================ */}
      {/* VISTA MOBILE: cards (oculta en desktop)      */}
      {/* ============================================ */}
      <div className="md:hidden space-y-3">
        {players.map((p, i) => (
          <Link
            key={p.id}
            href={`/jugador/${p.steam_id}`}
            className="block rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition"
          >
            {/* Header de la card: # + avatar + nombre */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-muted-foreground font-mono text-sm w-5 shrink-0">
                #{i + 1}
              </span>
              {p.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.avatar_url}
                  alt={p.steam_username}
                  className="h-12 w-12 rounded-full border border-border shrink-0"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium truncate"
                  title={p.display_name ?? p.steam_username}
                >
                  {p.display_name ?? p.steam_username}
                </p>
                {p.role !== "member" && (
                  <span className="text-[10px] uppercase tracking-wider text-primary">
                    {p.role}
                  </span>
                )}
              </div>
            </div>

            {/* Stats en grid 2 columnas */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">K/D</span>
                <span className="font-mono font-medium">
                  {p.kd.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Winrate</span>
                <span className="font-mono font-medium">{p.winrate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aim</span>
                <span className="font-mono font-medium">
                  {p.stats?.aim !== null && p.stats?.aim !== undefined
                    ? p.stats.aim.toFixed(1)
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Partidas</span>
                <span className="font-mono font-medium">
                  {p.stats?.matches_played ?? 0}
                </span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-muted-foreground">Horas jugadas</span>
                <span className="font-mono font-medium">
                  {p.stats?.playtime_hours !== null &&
                  p.stats?.playtime_hours !== undefined
                    ? `${p.stats.playtime_hours}h`
                    : "N/A"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}