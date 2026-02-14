const michiganCities = [
  "Detroit",
  "Grand Rapids",
  "Ann Arbor",
  "Lansing",
  "Warren",
  "Flint",
  "Dearborn",
  "Kalamazoo",
  "Troy",
  "Novi",
];

export async function listMunicipalitiesByState(state: string) {
  if (state.toUpperCase() !== "MI") {
    return [];
  }

  return michiganCities;
}
