export type PremierTier = {
  name: string;
  color: string;       // clase tailwind de texto
  bgColor: string;     // clase tailwind de fondo
  borderColor: string; // clase tailwind de borde
  min: number;
  max: number | null;
};

export const PREMIER_TIERS: PremierTier[] = [
  {
    name: "Gray",
    color: "text-gray-300",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/40",
    min: 0,
    max: 4999,
  },
  {
    name: "Light Blue",
    color: "text-sky-300",
    bgColor: "bg-sky-500/20",
    borderColor: "border-sky-500/40",
    min: 5000,
    max: 9999,
  },
  {
    name: "Blue",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/40",
    min: 10000,
    max: 14999,
  },
  {
    name: "Purple",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/40",
    min: 15000,
    max: 19999,
  },
  {
    name: "Pink",
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
    borderColor: "border-pink-500/40",
    min: 20000,
    max: 24999,
  },
  {
    name: "Red",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/40",
    min: 25000,
    max: 29999,
  },
  {
    name: "Gold",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/40",
    min: 30000,
    max: null,
  },
];

export function getPremierTier(points: number | null): PremierTier | null {
  if (points === null || points === undefined) return null;
  return PREMIER_TIERS.find(
    (t) => points >= t.min && (t.max === null || points <= t.max)
  ) ?? null;
}