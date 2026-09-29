"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

type Props = {
  player: {
    steam_id: string | null;
    steam_username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
};

export function UserMenu({ player }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = player.display_name ?? player.steam_username;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 hover:opacity-80 transition"
      >
        {player.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.avatar_url}
            alt={displayName}
            className="h-8 w-8 rounded-full border border-border"
          />
        )}
        <span className="hidden md:inline text-sm font-medium">
          {displayName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
          <Link
            href="/perfil"
            className="block px-4 py-2 text-sm hover:bg-muted transition"
            onClick={() => setOpen(false)}
          >
            Mi perfil
          </Link>
          {player.steam_id && (
            <Link
              href={`/jugador/${player.steam_id}`}
              className="block px-4 py-2 text-sm hover:bg-muted transition"
              onClick={() => setOpen(false)}
            >
              Ver perfil público
            </Link>
          )}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}