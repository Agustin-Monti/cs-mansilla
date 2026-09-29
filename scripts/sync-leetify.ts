import * as dotenv from "dotenv";
import path from "path";
import { supabaseAdmin } from "./lib/supabase-admin";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const LEETIFY_API_KEY = process.env.LEETIFY_API_KEY;

if (!LEETIFY_API_KEY) {
  throw new Error("Falta LEETIFY_API_KEY en .env.local");
}

const LEETIFY_BASE = "https://api-public.cs-prod.leetify.com";

type LeetifyProfile = {
  privacy_mode: string;
  name: string;
  steam64_id: string;
  winrate: number;
  total_matches: number;
  first_match_date: string;
  ranks: {
    leetify: number;
    premier: number | null;
    faceit: number | null;
  };
  rating: {
    aim: number;
    positioning: number;
    utility: number;
    clutch: number;
    opening: number;
  };
  stats: {
    preaim: number;
    reaction_time_ms: number;
    accuracy_head: number;
    accuracy_enemy_spotted: number;
    spray_accuracy: number;
  };
  recent_matches: Array<{
    id: string;
    finished_at: string;
    outcome: "win" | "loss" | "tie";
    map_name: string;
    score: [number, number];
    leetify_rating: number;
  }>;
  recent_teammates: Array<{
    steam64_id: string;
    recent_matches_count: number;
  }>;
};

async function fetchLeetifyProfile(
  steamId: string
): Promise<LeetifyProfile | null> {
  const url = `${LEETIFY_BASE}/v3/profile?steam64_id=${steamId}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${LEETIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 404) return null; // no tiene perfil en Leetify
    if (!res.ok) {
      console.error(`   ⚠️  HTTP ${res.status}`);
      return null;
    }

    return (await res.json()) as LeetifyProfile;
  } catch (err) {
    console.error(`   ⚠️  Error de red:`, err);
    return null;
  }
}

async function main() {
  console.log("🔄 Sync de Leetify → Supabase\n");

  // 1. Traer todos los jugadores activos con su player_stats
  const { data: players, error } = await supabaseAdmin
    .from("players")
    .select("id, steam_id, steam_username, player_stats(player_id)")
    .eq("active", true);

  if (error || !players) {
    throw new Error(`Error al traer players: ${error?.message}`);
  }

  console.log(`👥 Jugadores a sincronizar: ${players.length}\n`);

  let ok = 0;
  let missing = 0;

  for (const player of players) {
    console.log(`🎮 ${player.steam_username} (${player.steam_id})`);

    if (!player.steam_id) {
      console.log(`   ⚠️  Sin steam_id, se omite.\n`);
      continue;
    }

    const profile = await fetchLeetifyProfile(player.steam_id);

    if (!profile) {
      console.log(`   ❌ No tiene perfil en Leetify\n`);

      // Marcar como no disponible
      const statsRow = Array.isArray(player.player_stats)
        ? player.player_stats[0]
        : player.player_stats;

      if (statsRow) {
        await supabaseAdmin
          .from("player_stats")
          .update({
            leetify_available: false,
            leetify_synced_at: new Date().toISOString(),
          })
          .eq("player_id", player.id);
      } else {
        await supabaseAdmin.from("player_stats").insert({
          player_id: player.id,
          leetify_available: false,
          leetify_synced_at: new Date().toISOString(),
        });
      }

      missing++;
      continue;
    }

    console.log(`   ✅ Perfil encontrado`);
    console.log(`   Total partidas: ${profile.total_matches}`);
    console.log(
      `   Winrate: ${(profile.winrate * 100).toFixed(1)}%`
    );
    console.log(`   Premier: ${profile.ranks.premier ?? "N/A"}`);
    console.log(`   Leetify rating: ${profile.ranks.leetify}`);
    console.log(
      `   Aim: ${profile.rating.aim.toFixed(1)} | Positioning: ${profile.rating.positioning.toFixed(1)} | Utility: ${profile.rating.utility.toFixed(1)}`
    );

    // Calcular wins/losses aproximados a partir del winrate
    const total = profile.total_matches;
    const wins = Math.round(total * profile.winrate);
    const losses = total - wins;

    const upsertData = {
      player_id: player.id,
      // Mapear lo que ya teníamos
      matches_played: total,
      wins,
      losses,
      // Stats Leetify
      premier_rank: profile.ranks.premier,
      leetify_rating: profile.ranks.leetify,
      aim: profile.rating.aim,
      positioning: profile.rating.positioning,
      utility: profile.rating.utility,
      preaim: profile.stats.preaim,
      reaction_time_ms: profile.stats.reaction_time_ms,
      accuracy_head: profile.stats.accuracy_head,
      winrate: Math.round(profile.winrate * 10000) / 100, // 0.5172 → 51.72
      leetify_id: profile.steam64_id,
      leetify_synced_at: new Date().toISOString(),
      leetify_available: true,
    };

    const { error: upsertError } = await supabaseAdmin
      .from("player_stats")
      .upsert(upsertData, { onConflict: "player_id" });

    if (upsertError) {
      console.error(`   ❌ Error guardando:`, upsertError.message);
    } else {
      console.log(`   💾 Guardado en DB\n`);
      ok++;
    }
  }

  console.log("=".repeat(50));
  console.log(`✅ Con Leetify: ${ok}`);
  console.log(`❌ Sin Leetify: ${missing}`);
  console.log(`\n🎉 Sync completado.`);
}

main().catch((err) => {
  console.error("💥 Error:", err);
  process.exit(1);
});