import { NextResponse } from "next/server";
import { SteamAuth } from "@skhashaev/steam-login";

export const runtime = "nodejs";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const steamAuth = new SteamAuth({
    realm: baseUrl,
    returnUrl: `${baseUrl}/api/auth/steam/callback`,
  });

  const redirectUrl = steamAuth.getRedirectUrl();
  return NextResponse.redirect(redirectUrl);
}