"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  isLoggedIn: boolean;
};

export function MobileMenu({ isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Solo renderizar el portal en el cliente (evita errores de hidratación)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const menuContent = open ? (
    <div
      className="fixed inset-0 md:hidden"
      style={{
        zIndex: 9999,
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* Header del menú */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between border-b border-border">
        <span className="font-display text-xl font-bold">
          CS<span className="text-primary">-</span>MANSILLA
        </span>
        <button
          onClick={() => setOpen(false)}
          className="p-2 hover:bg-muted rounded-lg transition"
          aria-label="Cerrar menú"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Links centrados */}
      <nav
        className="flex flex-col items-center justify-center gap-8 px-6"
        style={{ height: "calc(100vh - 4rem)" }}
      >
        <Link
          href="/miembros"
          onClick={() => setOpen(false)}
          className="font-display text-4xl font-bold hover:text-primary transition-colors"
        >
          Miembros
        </Link>
        <Link
          href="/ranking"
          onClick={() => setOpen(false)}
          className="font-display text-4xl font-bold hover:text-primary transition-colors"
        >
          Ranking
        </Link>

        {isLoggedIn ? (
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className="font-display text-4xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Mi perfil
          </Link>
        ) : (
          <Button asChild size="lg" className="mt-6 h-14 px-8 text-lg">
            <a href="/api/auth/steam">Login con Steam</a>
          </Button>
        )}
      </nav>
    </div>
  ) : null;

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 hover:bg-muted rounded-lg transition"
        aria-label="Abrir menú"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Portal: renderiza el menú en el <body>, fuera del Header */}
      {mounted && createPortal(menuContent, document.body)}
    </>
  );
}