import { slugify, toTitleCaseIfAllCaps } from "@/lib/utils";

type DaycareRow = Record<string, string>;

type MetroArea = {
  slug: string;
  name: string;
  polygon: Array<[number, number]>;
};

const METRO_AREAS: MetroArea[] = [
  {
    slug: "columbus-metro",
    name: "Columbus Metro",
    polygon: [
      [40.315, -83.285],
      [40.385, -83.055],
      [40.33, -82.8],
      [40.215, -82.67],
      [40.055, -82.6],
      [39.9, -82.64],
      [39.79, -82.76],
      [39.735, -82.93],
      [39.75, -83.17],
      [39.84, -83.36],
      [40.02, -83.47],
      [40.19, -83.44],
      [40.29, -83.36],
    ],
  },
  {
    slug: "cleveland-metro",
    name: "Cleveland Metro",
    polygon: [
      [41.73, -81.98],
      [41.79, -81.7],
      [41.78, -81.41],
      [41.64, -81.18],
      [41.47, -81.14],
      [41.32, -81.26],
      [41.26, -81.49],
      [41.27, -81.75],
      [41.36, -81.95],
      [41.52, -82.04],
    ],
  },
  {
    slug: "cincinnati-metro",
    name: "Cincinnati Metro",
    polygon: [
      [39.38, -84.79],
      [39.43, -84.54],
      [39.38, -84.27],
      [39.25, -84.14],
      [39.08, -84.13],
      [38.95, -84.28],
      [38.9, -84.5],
      [38.95, -84.71],
      [39.07, -84.83],
      [39.23, -84.85],
    ],
  },
  {
    slug: "dayton-metro",
    name: "Dayton Metro",
    polygon: [
      [39.98, -84.43],
      [40.04, -84.1],
      [39.92, -83.89],
      [39.73, -83.84],
      [39.54, -83.94],
      [39.46, -84.17],
      [39.51, -84.4],
      [39.68, -84.51],
      [39.86, -84.51],
    ],
  },
  {
    slug: "akron-metro",
    name: "Akron Metro",
    polygon: [
      [41.24, -81.75],
      [41.26, -81.41],
      [41.14, -81.21],
      [40.97, -81.18],
      [40.84, -81.28],
      [40.79, -81.47],
      [40.84, -81.66],
      [40.97, -81.76],
      [41.12, -81.78],
    ],
  },
  {
    slug: "canton-massillon-metro",
    name: "Canton-Massillon Metro",
    polygon: [
      [40.97, -81.67],
      [41.02, -81.37],
      [40.93, -81.18],
      [40.77, -81.14],
      [40.62, -81.22],
      [40.56, -81.39],
      [40.6, -81.58],
      [40.73, -81.68],
      [40.87, -81.71],
    ],
  },
];

const METRO_AREA_BY_SLUG = new Map(METRO_AREAS.map((metro) => [metro.slug, metro]));

const METRO_CITY_ALIASES: Record<string, string[]> = {
  "columbus-metro": ["columbus"],
  "cleveland-metro": ["cleveland"],
  "cincinnati-metro": ["cincinnati"],
  "dayton-metro": ["dayton"],
  "akron-metro": ["akron"],
  "canton-massillon-metro": ["canton", "massillon"],
};

export const COLUMBUS_METRO_SLUG = "columbus-metro";

function pointInPolygon(lat: number, lng: number, polygon: Array<[number, number]>) {
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];

    const intersects =
      lngI > lng !== lngJ > lng &&
      lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;

    if (intersects) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function parseCoordinates(daycare: DaycareRow) {
  const lat = Number(daycare["LAT"]);
  const lng = Number(daycare["LNG"]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

function isMetroDaycareFor(daycare: DaycareRow, polygon: Array<[number, number]>) {
  const coords = parseCoordinates(daycare);
  if (!coords) return false;
  return pointInPolygon(coords.lat, coords.lng, polygon);
}

export function isMetroCitySlug(citySlug?: string) {
  if (!citySlug) return false;
  return METRO_AREA_BY_SLUG.has(citySlug);
}

export function getMetroCitySlugs(daycares?: DaycareRow[]) {
  if (!daycares) {
    return METRO_AREAS.map((metro) => metro.slug);
  }

  return METRO_AREAS
    .filter((metro) => getDaycaresForMetroSlug(daycares, metro.slug).length > 0)
    .map((metro) => metro.slug);
}

export function getMetroDisplayNameBySlug(citySlug: string) {
  return METRO_AREA_BY_SLUG.get(citySlug)?.name;
}

export function getMetroByCoordinates(lat: number, lng: number) {
  for (const metroArea of METRO_AREAS) {
    if (pointInPolygon(lat, lng, metroArea.polygon)) {
      return { slug: metroArea.slug, name: metroArea.name };
    }
  }

  return null;
}

export function getMetroByCitySlug(citySlug: string) {
  if (!citySlug) return null;

  for (const metroArea of METRO_AREAS) {
    const aliases = METRO_CITY_ALIASES[metroArea.slug] || [];
    if (aliases.includes(citySlug)) {
      return { slug: metroArea.slug, name: metroArea.name };
    }
  }

  return null;
}

export function getMetroForDaycare(daycare: DaycareRow) {
  const coords = parseCoordinates(daycare);
  const metroByCoordinates = coords ? getMetroByCoordinates(coords.lat, coords.lng) : null;
  if (metroByCoordinates) return metroByCoordinates;

  const citySlug = slugify(daycare["CITY"] || "");
  return getMetroByCitySlug(citySlug);
}

export function getDaycaresForMetroSlug(daycares: DaycareRow[], metroSlug: string) {
  const metro = METRO_AREA_BY_SLUG.get(metroSlug);
  if (!metro) return [];
  return daycares.filter((daycare) => isMetroDaycareFor(daycare, metro.polygon));
}

export function getDaycaresForCitySlug(daycares: DaycareRow[], citySlug: string) {
  if (isMetroCitySlug(citySlug)) {
    return getDaycaresForMetroSlug(daycares, citySlug);
  }

  return daycares.filter((daycare) => slugify(daycare["CITY"] || "") === citySlug);
}

export function getCitiesWithMetroEntry(daycares: DaycareRow[]) {
  const cityMap = new Map<string, number>();

  daycares.forEach((daycare) => {
    const city = daycare["CITY"];
    if (city) {
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    }
  });

  const allCities = Array.from(cityMap.entries()).map(([name, count]) => ({
    name: toTitleCaseIfAllCaps(name),
    slug: slugify(name),
    count,
  }));

  METRO_AREAS.forEach((metroArea) => {
    const metroCount = getDaycaresForMetroSlug(daycares, metroArea.slug).length;
    if (metroCount > 0) {
      allCities.push({
        name: metroArea.name,
        slug: metroArea.slug,
        count: metroCount,
      });
    }
  });

  return allCities.sort((a, b) => a.name.localeCompare(b.name));
}
