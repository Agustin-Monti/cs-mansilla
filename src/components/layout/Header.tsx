import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let player = null;
  if (user) {
    const { data } = await supabase
      .from("players")
      .select("steam_id, steam_username, display_name, avatar_url")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    player = data;
  }

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl md:text-2xl font-bold tracking-tight whitespace-nowrap"
        >
          CS<span className="text-primary">-</span>MANSILLA
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/miembros"
            className="hover:text-primary transition-colors"
          >
            Miembros
          </Link>
          <Link
            href="/ranking"
            className="hover:text-primary transition-colors"
          >
            Ranking
          </Link>

          {user && player ? (
            <UserMenu player={player} />
          ) : (
            <Button asChild size="sm">
              <a href="/api/auth/steam">Login con Steam</a>
            </Button>
          )}
        </nav>

        {/* Mobile: user menu + hamburguesa */}
        <div className="flex md:hidden items-center gap-2">
          {user && player && <UserMenu player={player} />}
          <MobileMenu isLoggedIn={!!user} />
        </div>
      </div>
    </header>
  );
}