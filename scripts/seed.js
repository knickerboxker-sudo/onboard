const { PrismaClient } = require("@prisma/client");
const { createHash } = require("crypto");

const prisma = new PrismaClient();

const demoEvents = [
  {
    source: "CPSC",
    sourceRecordId: "demo-cpsc-001",
    category: "consumer",
    title: "Air Fryers Recalled Due to Fire Hazard",
    summary:
      "Certain air fryer models have been recalled due to overheating and fire risk. The units can overheat and melt, posing fire and burn hazards to consumers.",
    hazard: "Fire and burn hazards",
    companyName: "HomeChef Appliances Inc.",
    brandNames: ["HomeChef", "QuickFry"],
    productKeywords: ["air fryer", "kitchen", "appliance", "cooking"],
    sourceUrl: "https://www.cpsc.gov/Recalls/demo-001",
  },
  {
    source: "NHTSA",
    sourceRecordId: "demo-nhtsa-001",
    category: "vehicle",
    title: "2024 Ford Explorer - Brake System Recall",
    summary:
      "Ford Motor Company is recalling certain 2024 Explorer vehicles. The brake pedal may become inoperative due to a software error in the electronic brake control module.",
    hazard: "Loss of braking ability increases risk of a crash",
    companyName: "Ford Motor Company",
    brandNames: ["Ford"],
    productKeywords: ["Explorer", "SUV", "brakes", "brake system"],
    identifiers: {
      campaignNumber: "24V-DEMO-001",
      make: "Ford",
      model: "Explorer",
      modelYear: "2024",
    },
    sourceUrl: "https://www.nhtsa.gov/recalls?nhtsaId=24V-DEMO-001",
  },
  {
    source: "FDA",
    sourceRecordId: "demo-fda-drug-001",
    category: "drug",
    title: "PharmaCo - Ibuprofen Tablets Voluntary Recall",
    summary:
      "PharmaCo is voluntarily recalling certain lots of Ibuprofen 200mg tablets due to the potential presence of foreign particulate matter.",
    hazard: "Foreign particulate matter contamination",
    recallClass: "Class II",
    companyName: "PharmaCo Industries LLC",
    brandNames: ["PharmaCo"],
    productKeywords: ["ibuprofen", "tablets", "pain reliever", "NSAID"],
    identifiers: {
      recallNumber: "D-DEMO-001",
      classification: "Class II",
    },
    sourceUrl: null,
  },
  {
    source: "FSIS",
    sourceRecordId: "demo-fsis-001",
    category: "food",
    title: "Walmart Deli - Ready-to-Eat Chicken Salad Recall",
    summary:
      "Walmart stores are recalling approximately 10,000 pounds of ready-to-eat chicken salad products due to possible Listeria monocytogenes contamination.",
    hazard: "Listeria monocytogenes contamination",
    recallClass: "Class I",
    companyName: "Walmart Inc.",
    brandNames: ["Walmart", "Great Value"],
    productKeywords: [
      "chicken salad",
      "deli",
      "ready-to-eat",
      "listeria",
      "salmonella",
    ],
    identifiers: {
      recallNumber: "FSIS-DEMO-001",
    },
    sourceUrl: "https://www.fsis.usda.gov/recalls-alerts/demo-001",
    locations: ["Nationwide"],
  },
  {
    source: "FDA",
    sourceRecordId: "demo-fda-device-001",
    category: "device",
    title: "MedTech - Blood Glucose Monitor Recall",
    summary:
      "MedTech Corp is recalling its AccuCheck Plus blood glucose monitoring system due to inaccurate readings that may result in incorrect insulin dosing.",
    hazard:
      "Inaccurate blood glucose readings may lead to incorrect treatment decisions",
    recallClass: "Class I",
    companyName: "MedTech Corporation",
    brandNames: ["AccuCheck"],
    productKeywords: [
      "blood glucose monitor",
      "diabetes",
      "medical device",
      "glucose meter",
    ],
    identifiers: {
      recallNumber: "Z-DEMO-001",
      classification: "Class I",
    },
    sourceUrl: null,
  },
];

function normalizeName(s) {
  if (!s) return "";
  let n = s.toLowerCase().trim();
  n = n.replace(/&/g, "and");
  n = n.replace(/[^\w\s]/g, "");
  n = n.replace(/\s+/g, " ").trim();
  const suffixes = [
    "incorporated",
    "limited",
    "company",
    "corp",
    "inc",
    "llc",
    "ltd",
    "co",
  ];
  const words = n.split(" ");
  while (words.length > 1 && suffixes.includes(words[words.length - 1])) {
    words.pop();
  }
  return words.join(" ").trim();
}

async function seed() {
  console.log("Seeding demo data...");

  for (const event of demoEvents) {
    const raw = { demo: true, ...event };
    const hash = createHash("sha256").update(JSON.stringify(raw)).digest("hex");

    const rawRecord = await prisma.rawRecallRecord.upsert({
      where: {
        source_sourceRecordId: {
          source: event.source,
          sourceRecordId: event.sourceRecordId,
        },
      },
      update: {
        raw,
        hash,
        title: event.title,
        publishedAt: new Date(),
      },
      create: {
        source: event.source,
        sourceRecordId: event.sourceRecordId,
        raw,
        hash,
        title: event.title,
        publishedAt: new Date(),
      },
    });

    const companyNormalized = normalizeName(event.companyName);
    const searchText = [
      event.title,
      event.summary,
      event.companyName,
      ...(event.brandNames || []),
      ...(event.productKeywords || []),
      event.category,
      event.source,
    ]
      .filter(Boolean)
      .join(" ");

    const existingEvent = await prisma.recallEvent.findFirst({
      where: { rawRecordId: rawRecord.id },
    });

    if (existingEvent) {
      await prisma.recallEvent.update({
        where: { id: existingEvent.id },
        data: {
          title: event.title,
          summary: event.summary,
          hazard: event.hazard || null,
          recallClass: event.recallClass || null,
          companyName: event.companyName,
          companyNormalized,
          brandNames: event.brandNames || [],
          productKeywords: event.productKeywords || [],
          identifiers: event.identifiers || undefined,
          locations: event.locations || [],
          searchText,
        },
      });
      console.log(`  Updated: ${event.title}`);
    } else {
      await prisma.recallEvent.create({
        data: {
          source: event.source,
          sourceUrl: event.sourceUrl || null,
          category: event.category,
          title: event.title,
          summary: event.summary,
          hazard: event.hazard || null,
          recallClass: event.recallClass || null,
          publishedAt: new Date(),
          companyName: event.companyName,
          companyNormalized,
          brandNames: event.brandNames || [],
          productKeywords: event.productKeywords || [],
          identifiers: event.identifiers || undefined,
          locations: event.locations || [],
          rawRecordId: rawRecord.id,
          searchText,
        },
      });
      console.log(`  Inserted: ${event.title}`);
    }

    // Update search vector
    await prisma.$executeRawUnsafe(
      `UPDATE recall_events SET "searchVector" = to_tsvector('english', "searchText") WHERE "rawRecordId" = $1`,
      rawRecord.id
    );
  }

  // Seed some entity aliases
  const aliases = [
    { type: "company", canonical: "ford", alias: "Ford Motor Company" },
    { type: "company", canonical: "walmart", alias: "Walmart Inc." },
    { type: "company", canonical: "walmart", alias: "Wal-Mart Stores" },
  ];

  for (const a of aliases) {
    const normalizedAlias = normalizeName(a.alias);
    await prisma.entityAlias.upsert({
      where: {
        type_normalizedAlias: {
          type: a.type,
          normalizedAlias,
        },
      },
      update: {
        canonical: a.canonical,
        alias: a.alias,
      },
      create: {
        type: a.type,
        canonical: a.canonical,
        alias: a.alias,
        normalizedAlias,
        source: "manual",
        confidence: 100,
      },
    });
  }
  console.log("  Seeded entity aliases.");

  console.log("Seeding complete!");
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  prisma.$disconnect();
  process.exit(1);
});
