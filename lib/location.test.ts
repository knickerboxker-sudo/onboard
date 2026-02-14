import {
  MAX_LOCATIONS,
  parseLocationsParam,
  serializeLocationsParam,
  validationMessage,
} from "@/lib/location";

describe("location utilities", () => {
  it("parses locations from URL param and removes duplicates", () => {
    expect(parseLocationsParam("Austin|Dallas|austin||Houston")).toEqual([
      "Austin",
      "Dallas",
      "Houston",
    ]);
  });

  it("caps parsed locations to max allowed", () => {
    expect(parseLocationsParam("A|B|C|D|E")).toHaveLength(MAX_LOCATIONS);
  });

  it("serializes locations for sharing", () => {
    expect(serializeLocationsParam([" Austin ", "Dallas", ""])).toBe(
      "Austin|Dallas",
    );
  });

  it("returns helpful validation errors", () => {
    expect(validationMessage("", [])).toBe("Enter a city or ZIP code.");
    expect(validationMessage("Austin", ["Austin"])).toBe(
      "Location already added.",
    );
    expect(validationMessage("El Paso", ["A", "B", "C", "D"])).toBe(
      "You can compare up to 4 locations.",
    );
  });
});
