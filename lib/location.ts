export const MIN_LOCATIONS = 1;
export const MAX_LOCATIONS = 4;

export function parseLocationsParam(value: string | null | undefined): string[] {
  if (!value) return [];
  const seen = new Set<string>();
  return value
    .split("|")
    .map((item) => item.trim())
    .filter((item) => {
      const key = item.toLowerCase();
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_LOCATIONS);
}

export function serializeLocationsParam(locations: string[]): string {
  return locations.map((value) => value.trim()).filter(Boolean).join("|");
}

export function validationMessage(candidate: string, locations: string[]): string | null {
  const trimmed = candidate.trim();
  if (!trimmed) return "Enter a city or ZIP code.";
  if (locations.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
    return "Location already added.";
  }
  if (locations.length >= MAX_LOCATIONS) {
    return "You can compare up to 4 locations.";
  }
  return null;
}
