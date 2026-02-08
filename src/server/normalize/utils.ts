export function normalizeName(s: string | null | undefined): string {
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

export function buildSearchText(event: {
  title: string;
  summary: string;
  companyName?: string | null;
  brandNames?: string[];
  productKeywords?: string[];
  identifiers?: unknown;
  category: string;
  source: string;
}): string {
  const parts = [
    event.title,
    event.summary,
    event.companyName || "",
    ...(event.brandNames || []),
    ...(event.productKeywords || []),
    event.category,
    event.source,
  ];
  if (event.identifiers) {
    try {
      parts.push(JSON.stringify(event.identifiers));
    } catch {
      // ignore
    }
  }
  return parts.filter(Boolean).join(" ");
}

export function extractKeywords(text: string): string[] {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return [...new Set(words)];
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
