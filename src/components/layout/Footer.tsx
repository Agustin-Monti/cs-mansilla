import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-16">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>{SITE.name} · {SITE.location}</p>
        <p className="mt-1">Counter-Strike 2 © Valve Corporation</p>
      </div>
    </footer>
  );
}