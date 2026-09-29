export type MapInfo = {
  /** Nombre técnico que viene de Leetify (ej: "de_mirage") */
  technicalName: string;
  /** Nombre para mostrar (ej: "Mirage") */
  displayName: string;
  /** Path de la imagen en /public */
  imagePath: string;
};

const MAPS: MapInfo[] = [
  {
    technicalName: "de_mirage",
    displayName: "Mirage",
    imagePath: "/images/maps/mirage.webp",
  },
  {
    technicalName: "de_inferno",
    displayName: "Inferno",
    imagePath: "/images/maps/inferno.webp",
  },
  {
    technicalName: "de_dust2",
    displayName: "Dust II",
    imagePath: "/images/maps/dust2.webp",
  },
  {
    technicalName: "de_ancient",
    displayName: "Ancient",
    imagePath: "/images/maps/ancient.webp",
  },
  {
    technicalName: "de_anubis",
    displayName: "Anubis",
    imagePath: "/images/maps/anubis.webp",
  },
  {
    technicalName: "de_nuke",
    displayName: "Nuke",
    imagePath: "/images/maps/nuke.webp",
  },
  {
    technicalName: "de_overpass",
    displayName: "Overpass",
    imagePath: "/images/maps/overpass.webp",
  },
  {
    technicalName: "de_vertigo",
    displayName: "Vertigo",
    imagePath: "/images/maps/vertigo.webp",
  },
  {
    technicalName: "de_train",
    displayName: "Train",
    imagePath: "/images/maps/train.webp",
  },
  {
    technicalName: "de_cache",
    displayName: "Cache",
    imagePath: "/images/maps/cache.webp",
  },
];

const MAP_BY_TECHNICAL = new Map(MAPS.map((m) => [m.technicalName, m]));

/**
 * Devuelve la info del mapa a partir del nombre técnico de Leetify.
 * Si no lo encuentra, devuelve un fallback con el nombre limpio.
 */
export function getMapInfo(technicalName: string): MapInfo {
  const found = MAP_BY_TECHNICAL.get(technicalName);

  if (found) return found;

  // Fallback: si Leetify manda un mapa que no tenemos mapeado
  return {
    technicalName,
    displayName: technicalName.replace(/^de_/, "").replace(/^cs_/, ""),
    imagePath: "/images/maps/placeholder.jpg",
  };
}