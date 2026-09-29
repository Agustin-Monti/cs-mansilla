import { createClient } from "@/lib/supabase/server";

// ============================================
// Tipos de dominio (los que usamos en la UI)
// ============================================

export type PlayerWithStats = {
  id: string;
  steam_id: string | null;
  steam_username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: "member" | "admin" | "founder";
  joined_at: string;
  active: boolean;
  stats: {
    kills: number;
    deaths: number;
    assists: number;
    headshots: number;
    wins: number;
    losses: number;
    mvps: number;
    matches_played: number;
    premier_rank: number | null;
    leetify_rating: number | null;
    aim: number | null;
    positioning: number | null;
    utility: number | null;
    preaim: number | null;
    reaction_time_ms: number | null;
    accuracy_head: number | null;
    winrate: number | null;
    leetify_available: boolean | null;
    playtime_hours: number | null;
  } | null;
  kd: number;
  winrate: number;
  hsPercent: number;
};

export type MatchWithDetails = {
  id: string;
  map: string;
  score_team: number;
  score_enemy: number;
  result: "W" | "L";
  played_at: string;
  mvp_player_id: string | null;
  mvp: { display_name: string | null; steam_username: string } | null;
};

// ============================================
// Helpers de cálculo
// ============================================

export function calculateKd(kills: number, deaths: number): number {
  if (deaths === 0) return kills;
  return Math.round((kills / deaths) * 100) / 100;
}

export function calculateWinrate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

export function calculateHsPercent(
  headshots: number,
  kills: number
): number {
  if (kills === 0) return 0;
  return Math.round((headshots / kills) * 100);
}

// ============================================
// Queries
// ============================================

export async function getAllPlayers(): Promise<PlayerWithStats[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
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
      active,
      player_stats (
        kills,
        deaths,
        assists,
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
        playtime_hours
      )
    `
    )
    .eq("active", true)
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("Error en getAllPlayers:", error.message);
    return [];
  }

  return (data ?? []).map((p) => {
    const stats = Array.isArray(p.player_stats)
      ? p.player_stats[0] ?? null
      : p.player_stats;

    return {
      id: p.id,
      steam_id: p.steam_id,
      steam_username: p.steam_username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      role: p.role as "member" | "admin" | "founder",
      joined_at: p.joined_at,
      active: p.active,
      stats,
      kd: stats ? calculateKd(stats.kills, stats.deaths) : 0,
      winrate: stats ? calculateWinrate(stats.wins, stats.losses) : 0,
      hsPercent: stats
        ? calculateHsPercent(stats.headshots, stats.kills)
        : 0,
    };
  });
}

export async function getPlayerBySteamId(
  steamId: string
): Promise<PlayerWithStats | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
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
      active,
      player_stats (
        kills,
        deaths,
        assists,
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
        playtime_hours
      )
    `
    )
    .eq("steam_id", steamId)
    .maybeSingle();

  if (error || !data) {
    console.error("Error en getPlayerBySteamId:", error?.message);
    return null;
  }

  const stats = Array.isArray(data.player_stats)
    ? data.player_stats[0] ?? null
    : data.player_stats;

  return {
    id: data.id,
    steam_id: data.steam_id,
    steam_username: data.steam_username,
    display_name: data.display_name,
    avatar_url: data.avatar_url,
    role: data.role as "member" | "admin" | "founder",
    joined_at: data.joined_at,
    active: data.active,
    stats,
    kd: stats ? calculateKd(stats.kills, stats.deaths) : 0,
    winrate: stats ? calculateWinrate(stats.wins, stats.losses) : 0,
    hsPercent: stats ? calculateHsPercent(stats.headshots, stats.kills) : 0,
  };
}

export async function getRecentMatches(limit = 8): Promise<MatchWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      map,
      score_team,
      score_enemy,
      played_at,
      mvp_player_id,
      mvp:players!matches_mvp_player_id_fkey (
        display_name,
        steam_username
      )
    `
    )
    .order("played_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error en getRecentMatches:", error.message);
    return [];
  }

  return (data ?? []).map((m) => ({
    id: m.id,
    map: m.map,
    score_team: m.score_team,
    score_enemy: m.score_enemy,
    result: m.score_team > m.score_enemy ? "W" : "L",
    played_at: m.played_at,
    mvp_player_id: m.mvp_player_id,
    mvp: Array.isArray(m.mvp) ? m.mvp[0] ?? null : m.mvp,
  }));
}

export async function getPlayerMatches(
  playerId: string,
  limit = 5
): Promise<
  {
    match_id: string;
    map: string;
    score_team: number;
    score_enemy: number;
    result: "W" | "L";
    played_at: string;
    kills: number;
    deaths: number;
    assists: number;
    headshots: number;
  }[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("match_players")
    .select(
      `
      match_id,
      kills,
      deaths,
      assists,
      headshots,
      matches:match_id (
        map,
        score_team,
        score_enemy,
        played_at
      )
    `
    )
    .eq("player_id", playerId)
    .limit(limit);

  if (error) {
    console.error("Error en getPlayerMatches:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => {
      const match = Array.isArray(row.matches) ? row.matches[0] : row.matches;
      if (!match) return null;
      return {
        match_id: row.match_id,
        map: match.map,
        score_team: match.score_team,
        score_enemy: match.score_enemy,
        result:
          match.score_team > match.score_enemy ? ("W" as const) : ("L" as const),
        played_at: match.played_at,
        kills: row.kills,
        deaths: row.deaths,
        assists: row.assists,
        headshots: row.headshots,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

export async function getMatchById(matchId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      map,
      score_team,
      score_enemy,
      played_at,
      mvp_player_id,
      mvp:players!matches_mvp_player_id_fkey (
        display_name,
        steam_username
      ),
      match_players (
        kills,
        deaths,
        assists,
        headshots,
        players:player_id (
          id,
          steam_id,
          display_name,
          steam_username,
          avatar_url
        )
      )
    `
    )
    .eq("id", matchId)
    .maybeSingle();

  if (error || !data) {
    console.error("Error en getMatchById:", error?.message);
    return null;
  }

  return {
    id: data.id,
    map: data.map,
    score_team: data.score_team,
    score_enemy: data.score_enemy,
    result: data.score_team > data.score_enemy ? ("W" as const) : ("L" as const),
    played_at: data.played_at,
    mvp: Array.isArray(data.mvp) ? data.mvp[0] ?? null : data.mvp,
    players: (data.match_players ?? []).map((mp) => {
      const p = Array.isArray(mp.players) ? mp.players[0] : mp.players;
      return {
        id: p?.id ?? "",
        steam_id: p?.steam_id ?? null,
        display_name: p?.display_name ?? null,
        steam_username: p?.steam_username ?? "",
        avatar_url: p?.avatar_url ?? null,
        kills: mp.kills,
        deaths: mp.deaths,
        assists: mp.assists,
        headshots: mp.headshots,
      };
    }),
  };
}