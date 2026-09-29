import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col">
          {/* Imagen de fondo */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero.png"
              alt="CS-Mansilla"
              className="w-full h-full object-cover"
            />
            {/* Overlay oscuro abajo para que se lean los botones */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>

          {/* Botones centrados abajo */}
          <div className="relative z-10 mt-auto pb-12 md:pb-20 w-full">
            <div className="flex flex-wrap items-center justify-center gap-4 px-4">
              <Button asChild size="lg" className="h-14 px-8 text-lg">
                <Link href="/miembros">Ver miembros</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg"
              >
                <Link href="/ranking">Ranking</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}