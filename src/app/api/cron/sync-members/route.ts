// src/app/api/cron/sync-members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGroupMembers, getPlayerSummaries } from "@/lib/steam";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const GROUP_VANITY = "mansilla-cs";

export async function GET(request: NextRequest) {
  // Verificar que sea Vercel quien llama
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Obtener SteamIDs del grupo
    const { groupId64, memberCount, steamIds } = await getGroupMembers(
      GROUP_VANITY
    );

    console.log(`🔍 Grupo: ${groupId64}`);
    console.log(`👥 Miembros públicos: ${steamIds.length} de ${memberCount}`);

    if (steamIds.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No hay miembros públicos para procesar",
        groupId64,
        memberCount,
      });
    }

    // 2. Obtener perfiles desde Steam API
    const players = await getPlayerSummaries(steamIds);
    console.log(`✅ Perfiles obtenidos: ${players.length}`);

    // 3. Insertar / actualizar en Supabase
    let inserted = 0;
    let errors = 0;

    for (const p of players) {
      const { error } = await supabaseAdmin.from("players").upsert(
        {
          steam_id: p.steamid,
          steam_username: p.personaname,
          display_name: p.personaname,
          avatar_url: p.avatarfull,
          active: true,
        },
        { onConflict: "steam_id" }
      );

      if (error) {
        console.error(`❌ Error con ${p.personaname}:`, error.message);
        errors++;
      } else {
        inserted++;
      }
    }

    return NextResponse.json({
      ok: true,
      groupId64,
      memberCount,
      publicMembers: steamIds.length,
      profilesFetched: players.length,
      synced: inserted,
      errors,
    });
  } catch (err) {
    console.error("💥 Error en sync-members:", err);
    return NextResponse.json(
      {
        error: "Error en el sync",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}