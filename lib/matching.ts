import type { BusinessRecord, SwipeFilters } from "@/lib/types";

const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (value: number) => (value * Math.PI) / 180;

export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));
  return EARTH_RADIUS_MILES * c;
}

export function buildMatchPair(businessA: string, businessB: string): [string, string] {
  return businessA < businessB ? [businessA, businessB] : [businessB, businessA];
}

export function filterBusinessesForSwipe(
  origin: BusinessRecord,
  candidates: BusinessRecord[],
  swipedBusinessIds: Set<string>,
  filters: SwipeFilters,
): Array<BusinessRecord & { distanceMiles: number | null }> {
  return candidates
    .filter((candidate) => candidate.id !== origin.id)
    .filter((candidate) => !swipedBusinessIds.has(candidate.id))
    .map((candidate) => {
      if (origin.lat == null || origin.lng == null || candidate.lat == null || candidate.lng == null) {
        return { ...candidate, distanceMiles: null };
      }
      return {
        ...candidate,
        distanceMiles: haversineMiles(origin.lat, origin.lng, candidate.lat, candidate.lng),
      };
    })
    .filter((candidate) => candidate.distanceMiles == null || candidate.distanceMiles <= filters.radiusMiles)
    .filter((candidate) => filters.categories.length === 0 || filters.categories.includes(candidate.business_type))
    .filter(
      (candidate) =>
        filters.partnershipTypes.length === 0 ||
        (candidate.partnership_types ?? []).some((type) => filters.partnershipTypes.includes(type)),
    )
    .sort((a, b) => {
      if (a.distanceMiles == null) return 1;
      if (b.distanceMiles == null) return -1;
      return a.distanceMiles - b.distanceMiles;
    });
}
