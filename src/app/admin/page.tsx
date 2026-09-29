import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Admin · CS-Mansilla",
};

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-bold mb-4">
          Panel de administración
        </h1>
        <p className="text-muted-foreground">
          Próximamente: gestión de miembros, partidas y stats.
        </p>
      </main>
      <Footer />
    </div>
  );
}