import { getGroupMembers, getPlayerSummaries } from "./lib/steam";
import { supabaseAdmin } from "./lib/supabase-admin";

const GROUP_VANITY = "mansilla-cs";

async function main() {
  console.log("🔍 Consultando grupo:", GROUP_VANITY);

  // 1. Obtener SteamIDs del grupo
  const { groupId64, memberCount, steamIds } = await getGroupMembers(
    GROUP_VANITY
  );

  console.log(`✅ Grupo encontrado: ${groupId64}`);
  console.log(`👥 Miembros públicos: ${steamIds.length} de ${memberCount}`);

  if (steamIds.length === 0) {
    console.log("⚠️  No hay miembros públicos para procesar.");
    return;
  }

  // 2. Obtener perfiles desde Steam API
  console.log("🎮 Obteniendo perfiles desde Steam API...");
  const players = await getPlayerSummaries(steamIds);

  console.log(`✅ Perfiles obtenidos: ${players.length}`);

  // 3. Insertar / actualizar en Supabase
  for (const p of players) {
    const { error } = await supabaseAdmin
  .from("players")
  .upsert(
    {
      steam_id: p.steamid,
      steam_username: p.personaname,
      display_name: p.personaname,
      avatar_url: p.avatarfull,
      active: true,
    } as any,
    { onConflict: "steam_id" }
  );

    if (error) {
      console.error(`❌ Error con ${p.personaname}:`, error.message);
    } else {
      console.log(`✅ ${p.personaname} (${p.steamid})`);
    }
  }

  console.log("\n🎉 Listo. Miembros cargados en Supabase.");
}

main().catch((err) => {
  console.error("💥 Error:", err);
  process.exit(1);
});