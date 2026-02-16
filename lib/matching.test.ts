import { buildMatchPair, filterBusinessesForSwipe, haversineMiles } from "@/lib/matching";
import type { BusinessRecord, SwipeFilters } from "@/lib/types";

const origin: BusinessRecord = {
  id: "a",
  owner_id: "owner-a",
  name: "Origin",
  description: "",
  business_type: "Cafe",
  address: "A",
  lat: 40.7128,
  lng: -74.006,
  photos: [],
  products: [],
  partnership_types: ["cross-promotion"],
};

const filters: SwipeFilters = {
  radiusMiles: 10,
  categories: [],
  partnershipTypes: [],
};

describe("matching helpers", () => {
  it("calculates haversine distance in miles", () => {
    const miles = haversineMiles(40.7128, -74.006, 40.73061, -73.935242);
    expect(miles).toBeGreaterThan(3);
    expect(miles).toBeLessThan(5);
  });

  it("normalizes match pair ordering", () => {
    expect(buildMatchPair("zz", "aa")).toEqual(["aa", "zz"]);
  });

  it("filters swiped businesses and radius", () => {
    const nearby: BusinessRecord = {
      id: "nearby",
      owner_id: "owner-b",
      name: "Nearby",
      description: "",
      business_type: "Bakery",
      address: "B",
      lat: 40.73061,
      lng: -73.935242,
      photos: [],
      products: [],
      partnership_types: ["event-collab"],
    };

    const far: BusinessRecord = {
      ...nearby,
      id: "far",
      lat: 34.0522,
      lng: -118.2437,
    };

    const result = filterBusinessesForSwipe(origin, [nearby, far], new Set(["far"]), filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("nearby");
  });
});
