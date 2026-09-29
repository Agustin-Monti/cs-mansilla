import { NextRequest, NextResponse } from "next/server";
import { SteamAuth } from "@skhashaev/steam-login";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const steamAuth = new SteamAuth({
    realm: baseUrl,
    returnUrl: `${baseUrl}/api/auth/steam/callback`,
  });

  // 1. Validar respuesta de Steam
  const steamId = await steamAuth.verify(req.url);

  if (!steamId) {
    return NextResponse.redirect(`${baseUrl}/login?error=steam`);
  }

  // 2. Ver si el jugador ya existe en nuestra tabla players
  const { data: existingPlayer } = await supabaseAdmin
    .from("players")
    .select("id, auth_user_id")
    .eq("steam_id", steamId)
    .maybeSingle();

  // 3. Si no existe en players, traer datos de Steam API y crearlo
  if (!existingPlayer) {
    const apiKey = process.env.STEAM_API_KEY!;
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
    );
    const data = await res.json();
    const profile = data.response?.players?.[0];

    if (!profile) {
      return NextResponse.redirect(`${baseUrl}/login?error=noprofile`);
    }

    const { error: insertError } = await supabaseAdmin
      .from("players")
      .insert({
        steam_id: steamId,
        steam_username: profile.personaname,
        display_name: profile.personaname,
        avatar_url: profile.avatarfull,
        active: true,
      });

    if (insertError) {
      console.error("Error creando player:", insertError);
      return NextResponse.redirect(`${baseUrl}/login?error=db`);
    }
  }

  // 4. Crear o recuperar el auth user de Supabase
  const dummyEmail = `steam_${steamId}@cs-mansilla.app`;

  // Buscar si ya existe un auth user con ese email
  const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
  const existingAuthUser = usersList?.users?.find(
    (u) => u.email === dummyEmail
  );

  let authUserId: string;

  if (existingAuthUser) {
    authUserId = existingAuthUser.id;
  } else {
    // Crear nuevo auth user
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: dummyEmail,
        email_confirm: true,
        user_metadata: { provider: "steam", steam_id: steamId },
      });

    if (createError || !newUser.user) {
      console.error("Error creando auth user:", createError);
      return NextResponse.redirect(`${baseUrl}/login?error=auth`);
    }

    authUserId = newUser.user.id;
  }

  // 5. Vincular player con auth user (si no está vinculado ya)
  await supabaseAdmin
    .from("players")
    .update({ auth_user_id: authUserId })
    .eq("steam_id", steamId);

    // 6. Generar un magic link para iniciar sesión
  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: dummyEmail,
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
      },
    });

  if (linkError || !linkData?.properties?.action_link) {
    console.error("Error generando link:", linkError);
    return NextResponse.redirect(`${baseUrl}/login?error=session`);
  }

  // 7. Redirigir al magic link
  return NextResponse.redirect(linkData.properties.action_link);
}