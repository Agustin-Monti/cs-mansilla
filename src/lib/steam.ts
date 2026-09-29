import { XMLParser } from "fast-xml-parser";

const STEAM_API_KEY = process.env.STEAM_API_KEY!;
const CS2_APP_ID = 730;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: true,
});

// ============================================
// 1. Obtener miembros del grupo (XML público)
// ============================================
export async function getGroupMembers(groupVanityUrl: string): Promise<{
  groupId64: string;
  memberCount: number;
  steamIds: string[];
}> {
  const url = `https://steamcommunity.com/groups/${groupVanityUrl}/memberslistxml/?xml=1`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error al consultar el grupo: ${res.status}`);
  }

  const xml = await res.text();
  const parsed = xmlParser.parse(xml);

  const memberList = parsed.memberList;
  if (!memberList) {
    throw new Error(
      "No se pudo parsear la lista de miembros. ¿El grupo es público?"
    );
  }

  const groupId64 = String(memberList.groupID64);
  const memberCount = Number(memberList.memberCount);

  let steamIds: string[] = [];
  if (memberList.members?.steamID64) {
    const raw = memberList.members.steamID64;
    steamIds = Array.isArray(raw) ? raw.map(String) : [String(raw)];
  }

  return { groupId64, memberCount, steamIds };
}

// ============================================
// 2. Obtener perfiles de jugadores (Steam API)
// ============================================
export type SteamPlayer = {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  communityvisibilitystate: number;
  loccountrycode?: string;
};

export async function getPlayerSummaries(
  steamIds: string[]
): Promise<SteamPlayer[]> {
  if (steamIds.length === 0) return [];

  const ids = steamIds.join(",");
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${ids}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error en GetPlayerSummaries: ${res.status}`);
  }

  const data = await res.json();
  return data.response?.players ?? [];
}

// ============================================
// 3. Obtener horas jugadas de CS2
// ============================================
export async function getCs2Playtime(steamId: string): Promise<number | null> {
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=0&include_played_free_games=1`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const games = data.response?.games ?? [];

  const cs2 = games.find((g: { appid: number }) => g.appid === CS2_APP_ID);

  if (!cs2) return null;

  // playtime_forever viene en minutos → convertir a horas
  return Math.round((cs2.playtime_forever / 60) * 10) / 10;
}

// ============================================
// 4. Resolver vanity URL a SteamID64
// ============================================
export async function resolveVanityUrl(
  vanity: string
): Promise<string | null> {
  const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${STEAM_API_KEY}&vanityurl=${vanity}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.response?.success === 1) {
    return data.response.steamid;
  }
  return null;
}