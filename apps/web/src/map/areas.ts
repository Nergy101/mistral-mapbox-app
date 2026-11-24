/**
 * The areas drawn on the map. Shared by the client (which renders them as Mapbox polygons) and the
 * server (which describes them to the chat model), so the chat always answers from the same data
 * the user sees.
 */

export interface Area {
  id: string;
  name: string;
  /** One-line description shown in the selection card and given to the chat model. */
  description: string;
  /** Short facts the chat model may cite. */
  facts: string[];
  /** Polygon ring in [lng, lat], closed (first point repeated). */
  polygon: [number, number][];
  /** [lng, lat] used to fly the camera when the area is selected. */
  center: [number, number];
}

export const MAP_CENTER: [number, number] = [2.337, 48.858];
export const MAP_ZOOM = 12.5;

export const AREAS: readonly Area[] = [
  {
    id: "louvre",
    name: "Louvre & Palais-Royal",
    description:
      "The world's largest art museum, housed in a former royal palace on the Right Bank, next to the Tuileries Garden.",
    facts: [
      "Home of the Mona Lisa and the Venus de Milo",
      "The glass pyramid entrance opened in 1989",
      "About 35,000 works on display",
    ],
    polygon: [
      [2.327, 48.858],
      [2.344, 48.858],
      [2.344, 48.866],
      [2.327, 48.866],
      [2.327, 48.858],
    ],
    center: [2.3355, 48.862],
  },
  {
    id: "eiffel",
    name: "Eiffel Tower & Champ de Mars",
    description:
      "The 330 m iron lattice tower on the Champ de Mars park, built for the 1889 World's Fair.",
    facts: [
      "Designed by Gustave Eiffel, completed in 1889",
      "Repainted every seven years, about 60 tonnes of paint",
      "Sparkles for five minutes every hour after sunset",
    ],
    polygon: [
      [2.288, 48.849],
      [2.302, 48.849],
      [2.302, 48.859],
      [2.288, 48.859],
      [2.288, 48.849],
    ],
    center: [2.295, 48.854],
  },
  {
    id: "montmartre",
    name: "Montmartre & Sacré-Cœur",
    description:
      "The hilltop village with cobbled streets, artists' square, and the white basilica of Sacré-Cœur.",
    facts: [
      "Sacré-Cœur was completed in 1914",
      "Place du Tertre has been an artists' gathering spot since the 1800s",
      "At 130 m it is the highest point in Paris",
    ],
    polygon: [
      [2.334, 48.882],
      [2.35, 48.882],
      [2.35, 48.892],
      [2.334, 48.892],
      [2.334, 48.882],
    ],
    center: [2.342, 48.887],
  },
  {
    id: "latin-quarter",
    name: "Latin Quarter",
    description:
      "The student quarter on the Left Bank around the Sorbonne, with narrow streets, bookshops and cafés.",
    facts: [
      "Named after the Latin students spoke at the medieval university",
      "The Panthéon and the Sorbonne are here",
      "Rue Mouffetard is its famous market street",
    ],
    polygon: [
      [2.338, 48.847],
      [2.352, 48.847],
      [2.352, 48.854],
      [2.338, 48.854],
      [2.338, 48.847],
    ],
    center: [2.345, 48.8505],
  },
  {
    id: "marais",
    name: "Le Marais",
    description:
      "A historic district straddling the 3rd and 4th arrondissements, known for mansions, galleries and nightlife.",
    facts: [
      "Place des Vosges is Paris's oldest planned square",
      "The Picasso and Carnavalet museums are here",
      "A center of LGBTQ+ life and vintage shopping",
    ],
    polygon: [
      [2.354, 48.853],
      [2.368, 48.853],
      [2.368, 48.861],
      [2.354, 48.861],
      [2.354, 48.853],
    ],
    center: [2.361, 48.857],
  },
  {
    id: "saint-germain",
    name: "Saint-Germain-des-Prés",
    description:
      "The Left Bank quarter of literary cafés, boutiques and the church of Saint-Germain-des-Prés.",
    facts: [
      "Café de Flore and Les Deux Magots opened in the 1880s",
      "The church is one of Paris's oldest, founded in the 6th century",
      "Former home of Sartre, de Beauvoir and Hemingway",
    ],
    polygon: [
      [2.326, 48.85],
      [2.34, 48.85],
      [2.34, 48.857],
      [2.326, 48.857],
      [2.326, 48.85],
    ],
    center: [2.333, 48.8535],
  },
];

export const areaById = (id: string | null | undefined): Area | undefined =>
  id === null || id === undefined
    ? undefined
    : AREAS.find((area) => area.id === id);

/** The areas as a GeoJSON feature collection, ready for a Mapbox source. */
export const areasGeoJson = () => ({
  type: "FeatureCollection" as const,
  features: AREAS.map((area) => ({
    type: "Feature" as const,
    properties: { id: area.id, name: area.name },
    geometry: { type: "Polygon" as const, coordinates: [area.polygon] },
  })),
});
