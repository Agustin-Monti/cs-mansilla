import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const LEETIFY_API_KEY = process.env.LEETIFY_API_KEY!;
const STEAM_API_KEY = process.env.STEAM_API_KEY!;

// ============================================
// Tipos de Leetify (estructura real del endpoint /v3/profile/matches)
// ============================================

type LeetifyMatchPlayer = {
  steam64_id: string;
  total_kills?: number;
  total_deaths?: number;
  total_assists?: number;
  total_headshots?: number;
};

type LeetifyTeamScore = {
  team_number: number;
  score: number;
};

type LeetifyMatch = {
  id: string;
  finished_at: string;
  outcome: "win" | "loss" | "tie";
  map_name: string;
  team_scores?: LeetifyTeamScore[]; // ← ACÁ ESTABA EL ERROR
  stats?: LeetifyMatchPlayer[];
};

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: player } = await supabaseAdmin
    .from("players")
    .select("id, steam_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!player?.steam_id) {
    return NextResponse.json({ error: "Sin steam_id" }, { status: 400 });
  }

  // 1. Consultar Leetify profile
  const profileRes = await fetch(
    `https://api-public.cs-prod.leetify.com/v3/profile?steam64_id=${player.steam_id}`,
    {
      headers: {
        Authorization: `Bearer ${LEETIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (profileRes.status === 404) {
    await supabaseAdmin.from("player_stats").upsert(
      {
        player_id: player.id,
        leetify_available: false,
        leetify_synced_at: new Date().toISOString(),
      },
      { onConflict: "player_id" }
    );

    return NextResponse.json(
      { error: "Sin perfil en Leetify" },
      { status: 404 }
    );
  }

  const profile = await profileRes.json();

  // 2. Consultar historial de partidas
  const matchesRes = await fetch(
    `https://api-public.cs-prod.leetify.com/v3/profile/matches?steam64_id=${player.steam_id}`,
    {
      headers: {
        Authorization: `Bearer ${LEETIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalHeadshots = 0;
  let recentMatches: LeetifyMatch[] = [];

  if (matchesRes.ok) {
    const matches: LeetifyMatch[] = await matchesRes.json();

    // Ordenar por fecha descendente
    const sorted = [...matches].sort(
      (a, b) =>
        new Date(b.finished_at).getTime() - new Date(a.finished_at).getTime()
    );

    // Sumar TODAS para stats totales
    for (const match of matches) {
      const ps = match.stats?.find((s) => s.steam64_id === player.steam_id);
      if (ps) {
        totalKills += ps.total_kills ?? 0;
        totalDeaths += ps.total_deaths ?? 0;
        totalAssists += ps.total_assists ?? 0;
        totalHeadshots += ps.total_headshots ?? 0;
      }
    }

    // Tomar solo las últimas 5 para insertar en matches
    recentMatches = sorted.slice(0, 5);
  }

  // 3. Obtener horas jugadas de CS2 desde Steam API
  let playtimeHours: number | null = null;
  try {
    const steamRes = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${player.steam_id}&include_appinfo=0&include_played_free_games=1`
    );

    if (steamRes.ok) {
      const steamData = await steamRes.json();
      const cs2 = steamData.response?.games?.find(
        (g: { appid: number }) => g.appid === 730
      );

      if (cs2?.playtime_forever) {
        playtimeHours = Math.round((cs2.playtime_forever / 60) * 10) / 10;
      }
    }
  } catch (err) {
    console.error("Error obteniendo horas de Steam:", err);
  }

  // 4. Guardar stats agregadas
  const total = profile.total_matches;
  const wins = Math.round(total * profile.winrate);

  const { error } = await supabaseAdmin.from("player_stats").upsert(
    {
      player_id: player.id,
      matches_played: total,
      wins,
      losses: total - wins,
      kills: totalKills,
      deaths: totalDeaths,
      assists: totalAssists,
      headshots: totalHeadshots,
      premier_rank: profile.ranks.premier,
      leetify_rating: profile.ranks.leetify,
      aim: profile.rating.aim,
      positioning: profile.rating.positioning,
      utility: profile.rating.utility,
      preaim: profile.stats.preaim,
      reaction_time_ms: profile.stats.reaction_time_ms,
      accuracy_head: profile.stats.accuracy_head,
      winrate: Math.round(profile.winrate * 10000) / 100,
      leetify_id: profile.steam64_id,
      leetify_synced_at: new Date().toISOString(),
      leetify_available: true,
      playtime_hours: playtimeHours,
    },
    { onConflict: "player_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 5. Insertar las últimas 5 partidas en `matches` y `match_players`
  for (const match of recentMatches) {
    // 5.1. Extraer scores desde team_scores + outcome
    const scores = (match.team_scores ?? [])
      .map((s) => s.score)
      .sort((a, b) => b - a); // mayor a menor

    let scoreTeam: number;
    let scoreEnemy: number;

    if (match.outcome === "win") {
      scoreTeam = scores[0] ?? 0;
      scoreEnemy = scores[1] ?? 0;
    } else if (match.outcome === "loss") {
      scoreTeam = scores[1] ?? 0;
      scoreEnemy = scores[0] ?? 0;
    } else {
      // tie
      scoreTeam = scores[0] ?? 0;
      scoreEnemy = scores[1] ?? scores[0] ?? 0;
    }

    // 5.2. Insertar la partida (o actualizar si ya existe)
    const { data: insertedMatch, error: matchError } = await supabaseAdmin
      .from("matches")
      .upsert(
        {
          leetify_match_id: match.id,
          map: match.map_name,
          score_team: scoreTeam,
          score_enemy: scoreEnemy,
          played_at: match.finished_at,
        },
        { onConflict: "leetify_match_id", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    if (matchError || !insertedMatch) {
      console.error(
        `Error insertando partida ${match.id}:`,
        matchError?.message
      );
      continue;
    }

    // 5.3. Para cada jugador de la partida que esté en nuestra DB, guardar stats
    for (const ps of match.stats ?? []) {
      const { data: playerRow } = await supabaseAdmin
        .from("players")
        .select("id")
        .eq("steam_id", ps.steam64_id)
        .maybeSingle();

      if (!playerRow) continue; // jugador no está en nuestra DB

      await supabaseAdmin.from("match_players").upsert(
        {
          match_id: insertedMatch.id,
          player_id: playerRow.id,
          kills: ps.total_kills ?? 0,
          deaths: ps.total_deaths ?? 0,
          assists: ps.total_assists ?? 0,
          headshots: ps.total_headshots ?? 0,
        },
        { onConflict: "match_id,player_id" }
      );
    }
  }

  return NextResponse.json({ ok: true });
}