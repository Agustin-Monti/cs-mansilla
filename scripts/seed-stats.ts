import { supabaseAdmin } from "./lib/supabase-admin";

// Stats de ejemplo por jugador (mapeadas por steam_username)
// Ajustá los valores a gusto. Son realistas para CS2.
const STATS_SEED: Record<
  string,
  {
    kills: number;
    deaths: number;
    assists: number;
    headshots: number;
    wins: number;
    losses: number;
    mvps: number;
    matches_played: number;
  }
> = {
  "El Toro Monti": {
    kills: 4250,
    deaths: 3510,
    assists: 820,
    headshots: 2100,
    wins: 198,
    losses: 144,
    mvps: 312,
    matches_played: 342,
  },
  Bambanator: {
    kills: 3120,
    deaths: 2890,
    assists: 640,
    headshots: 1400,
    wins: 152,
    losses: 129,
    mvps: 198,
    matches_played: 281,
  },
  BIRIBIIIRI: {
    kills: 2890,
    deaths: 3120,
    assists: 590,
    headshots: 1180,
    wins: 128,
    losses: 155,
    mvps: 156,
    matches_played: 283,
  },
  "Miguel Angel Russo": {
    kills: 1980,
    deaths: 2240,
    assists: 410,
    headshots: 720,
    wins: 89,
    losses: 112,
    mvps: 98,
    matches_played: 201,
  },
};

// Partidas de ejemplo (se asignan al azar entre los jugadores)
const MATCHES_SEED = [
  { map: "Mirage", score_team: 16, score_enemy: 12, days_ago: 0 },
  { map: "Inferno", score_team: 10, score_enemy: 13, days_ago: 0 },
  { map: "Dust II", score_team: 16, score_enemy: 8, days_ago: 1 },
  { map: "Ancient", score_team: 14, score_enemy: 16, days_ago: 2 },
  { map: "Nuke", score_team: 16, score_enemy: 14, days_ago: 3 },
  { map: "Anubis", score_team: 9, score_enemy: 13, days_ago: 4 },
  { map: "Overpass", score_team: 16, score_enemy: 6, days_ago: 5 },
  { map: "Vertigo", score_team: 13, score_enemy: 16, days_ago: 6 },
];

async function main() {
  console.log("🌱 Cargando seed de stats y partidas...\n");

  // 1. Traer jugadores existentes
  const { data: players, error: playersError } = await supabaseAdmin
    .from("players")
    .select("id, steam_username");

  if (playersError || !players) {
    throw new Error(
      `Error al traer players: ${playersError?.message ?? "sin datos"}`
    );
  }

  if (players.length === 0) {
    throw new Error(
      "No hay jugadores en la DB. Corré primero: npm run fetch-members"
    );
  }

  console.log(`👥 Jugadores encontrados: ${players.length}`);

  // 2. Insertar/actualizar player_stats
  for (const player of players) {
    const stats = STATS_SEED[player.steam_username];
    if (!stats) {
      console.log(`⚠️  Sin stats para ${player.steam_username}, se omite.`);
      continue;
    }

    const { error } = await supabaseAdmin.from("player_stats").upsert(
      {
        player_id: player.id,
        ...stats,
      },
      { onConflict: "player_id" }
    );

    if (error) {
      console.error(`❌ Error con ${player.steam_username}:`, error.message);
    } else {
      console.log(`✅ Stats de ${player.steam_username} cargadas.`);
    }
  }

  // 3. Limpiar partidas viejas (opcional, para evitar duplicados)
  console.log("\n🧹 Limpiando partidas previas...");
  await supabaseAdmin.from("match_players").delete().neq("match_id", "00000000-0000-0000-0000-000000000000");
  await supabaseAdmin.from("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 4. Insertar partidas
  console.log("\n🎮 Insertando partidas de ejemplo...");
  for (const m of MATCHES_SEED) {
    const playedAt = new Date();
    playedAt.setDate(playedAt.getDate() - m.days_ago);

    // MVP aleatorio
    const mvp = players[Math.floor(Math.random() * players.length)];

    const { data: match, error: matchError } = await supabaseAdmin
      .from("matches")
      .insert({
        map: m.map,
        score_team: m.score_team,
        score_enemy: m.score_enemy,
        mvp_player_id: mvp.id,
        played_at: playedAt.toISOString(),
      })
      .select("id")
      .single();

    if (matchError || !match) {
      console.error(`❌ Error con partida ${m.map}:`, matchError?.message);
      continue;
    }

    // Stats por jugador en esa partida (valores random razonables)
    const matchPlayers = players.map((p) => ({
      match_id: match.id,
      player_id: p.id,
      kills: Math.floor(Math.random() * 20) + 8,
      deaths: Math.floor(Math.random() * 15) + 8,
      assists: Math.floor(Math.random() * 8) + 2,
      headshots: Math.floor(Math.random() * 12) + 3,
    }));

    const { error: mpError } = await supabaseAdmin
      .from("match_players")
      .insert(matchPlayers);

    if (mpError) {
      console.error(`❌ Error en match_players de ${m.map}:`, mpError.message);
    } else {
      console.log(`✅ Partida ${m.map} (${m.score_team}-${m.score_enemy})`);
    }
  }

  console.log("\n🎉 Seed completado.");
}

main().catch((err) => {
  console.error("💥 Error:", err);
  process.exit(1);
});