import { slugify, toTitleCaseIfAllCaps } from "@/lib/utils";

type DaycareRow = Record<string, string>;

export const COLUMBUS_METRO_SLUG = "columbus-metro";
export const COLUMBUS_METRO_NAME = "Columbus Metro";

export function isMetroCitySlug(citySlug?: string) {
  return citySlug === COLUMBUS_METRO_SLUG;
}

const COLUMBUS_METRO_POLYGON: Array<[number, number]> = [
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
];

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

export function isColumbusMetroDaycare(daycare: DaycareRow) {
  const coords = parseCoordinates(daycare);
  if (!coords) return false;
  return pointInPolygon(coords.lat, coords.lng, COLUMBUS_METRO_POLYGON);
}

export function getDaycaresForCitySlug(daycares: DaycareRow[], citySlug: string) {
  if (citySlug === COLUMBUS_METRO_SLUG) {
    return daycares.filter(isColumbusMetroDaycare);
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

  const metroCount = daycares.filter(isColumbusMetroDaycare).length;

  if (metroCount > 0) {
    allCities.push({
      name: COLUMBUS_METRO_NAME,
      slug: COLUMBUS_METRO_SLUG,
      count: metroCount,
    });
  }

  return allCities.sort((a, b) => a.name.localeCompare(b.name));
}
