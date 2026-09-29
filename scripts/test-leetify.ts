import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const LEETIFY_API_KEY = process.env.LEETIFY_API_KEY;

if (!LEETIFY_API_KEY) {
  throw new Error("Falta LEETIFY_API_KEY en .env.local");
}

const STEAM_IDS = [
  "76561198282206144", // El Toro Monti
  "76561199014587598", // Bambanator
  "76561199043984347", // BIRIBIIIRI
  "76561198792870743", // Miguel Angel Russo
];

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

async function fetchProfile(steamId: string): Promise<LeetifyProfile | null> {
  const url = `https://api-public.cs-prod.leetify.com/v3/profile?steam64_id=${steamId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${LEETIFY_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    console.error(`❌ ${steamId}: HTTP ${res.status}`);
    return null;
  }

  return res.json();
}

async function main() {
  console.log("🎮 Probando Leetify API con los 4 jugadores de CS-Mansilla\n");

  const allTeammates = new Map<string, number>();

  for (const steamId of STEAM_IDS) {
    const profile = await fetchProfile(steamId);

    if (!profile) {
      console.log(`⚠️  ${steamId}: sin datos\n`);
      continue;
    }

    console.log("=".repeat(60));
    console.log(`👤 ${profile.name} (${profile.steam64_id})`);
    console.log(`   Privacidad: ${profile.privacy_mode}`);
    console.log(
      `   Total partidas: ${profile.total_matches} | Winrate: ${(profile.winrate * 100).toFixed(1)}%`
    );
    console.log(`   Primer match: ${profile.first_match_date}`);
    console.log(`   Premier rank: ${profile.ranks.premier ?? "N/A"}`);
    console.log(`   Leetify rating: ${profile.ranks.leetify}`);
    console.log(
      `   Aim: ${profile.rating.aim.toFixed(1)} | Positioning: ${profile.rating.positioning.toFixed(1)} | Utility: ${profile.rating.utility.toFixed(1)}`
    );
    console.log(`   Partidas recientes: ${profile.recent_matches.length}`);

    // Contar outcomes
    const wins = profile.recent_matches.filter((m) => m.outcome === "win").length;
    const losses = profile.recent_matches.filter((m) => m.outcome === "loss").length;
    const ties = profile.recent_matches.filter((m) => m.outcome === "tie").length;
    console.log(`   Últimas ${profile.recent_matches.length}: ${wins}W / ${losses}L / ${ties}T`);

    // Acumular teammates
    for (const tm of profile.recent_teammates) {
      allTeammates.set(
        tm.steam64_id,
        (allTeammates.get(tm.steam64_id) ?? 0) + tm.recent_matches_count
      );
    }

    console.log();
  }

  // Reporte de teammates
  console.log("=".repeat(60));
  console.log("🤝 Compañeros frecuentes detectados:");
  const knownIds = new Set(STEAM_IDS);
  const sorted = [...allTeammates.entries()].sort((a, b) => b[1] - a[1]);

  for (const [id, count] of sorted) {
    const known = knownIds.has(id) ? "✅ ya en DB" : "🆕 nuevo";
    console.log(`   ${id} — ${count} partidas juntos — ${known}`);
  }

  console.log("\n🎉 Listo.");
}

main().catch((err) => {
  console.error("💥 Error:", err);
  process.exit(1);
});