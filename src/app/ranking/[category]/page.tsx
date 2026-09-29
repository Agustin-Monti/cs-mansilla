import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RankingList } from "@/components/ranking/RankingList";
import { PremierBadge } from "@/components/ranking/PremierBadge";
import { getAllPlayers } from "@/lib/queries";

type Category = "premier" | "aim" | "winrate" | "positioning" | "utility";

const CATEGORY_META: Record<
  Category,
  { title: string; valueLabel: string; sortKey: string; formatter: (v: number | null) => string }
> = {
  premier: {
    title: "Ranking de Premier",
    valueLabel: "Puntos de Premier",
    sortKey: "premier_rank",
    formatter: (v) => (v !== null ? v.toLocaleString("es-AR") : "N/A"),
  },
  aim: {
    title: "Ranking de Aim",
    valueLabel: "Rating de Aim (Leetify)",
    sortKey: "aim",
    formatter: (v) => (v !== null ? v.toFixed(1) : "N/A"),
  },
  winrate: {
    title: "Ranking de Winrate",
    valueLabel: "Porcentaje de victorias",
    sortKey: "winrate",
    formatter: (v) => (v !== null ? `${v.toFixed(1)}%` : "N/A"),
  },
  positioning: {
    title: "Ranking de Positioning",
    valueLabel: "Rating de posicionamiento (Leetify)",
    sortKey: "positioning",
    formatter: (v) => (v !== null ? v.toFixed(1) : "N/A"),
  },
  utility: {
    title: "Ranking de Utility",
    valueLabel: "Rating de utility (Leetify)",
    sortKey: "utility",
    formatter: (v) => (v !== null ? v.toFixed(1) : "N/A"),
  },
};

type Props = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return Object.keys(CATEGORY_META).map((category) => ({ category }));
}

export default async function RankingCategoryPage({ params }: Props) {
  const { category } = await params;

  if (!(category in CATEGORY_META)) {
    notFound();
  }

  const meta = CATEGORY_META[category as Category];

  const players = await getAllPlayers();
  const withLeetify = players.filter((p) => p.stats?.leetify_available);

  const getValue = (p: (typeof players)[number]): number | null => {
    if (!p.stats) return null;
    const raw = p.stats[meta.sortKey as keyof typeof p.stats];
    return typeof raw === "number" ? raw : null;
  };

  const ranked = [...withLeetify]
    .sort((a, b) => (getValue(b) ?? -Infinity) - (getValue(a) ?? -Infinity))
    .map((p) => ({
      id: p.id,
      href: `/jugador/${p.steam_id}`,
      avatarUrl: p.avatar_url,
      displayName: p.display_name ?? p.steam_username,
      steamId: p.steam_id,
      value: (
        <span className={category === "premier" ? "" : "text-primary"}>
          {category === "premier" ? (
            <PremierBadge points={getValue(p)} size="md" />
          ) : (
            meta.formatter(getValue(p))
          )}
        </span>
      ),
      valueRaw: getValue(p) ?? 0,
      subtitle: p.steam_id ? `Steam: ${p.steam_id}` : undefined,
    }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <Link
          href="/ranking"
          className="text-sm text-muted-foreground hover:text-primary transition mb-6 inline-block"
        >
          ← Volver al ranking
        </Link>

        <div className="mb-10">
          <p className="font-display text-xs tracking-[0.3em] text-primary mb-2">
            RANKING COMPLETO
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            {meta.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {ranked.length} jugador{ranked.length !== 1 ? "es" : ""} con stats
            de Leetify disponibles.
          </p>
        </div>

        <RankingList items={ranked} valueLabel={meta.valueLabel} />
      </main>

      <Footer />
    </div>
  );
}