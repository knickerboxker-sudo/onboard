/**
 * SEC filing text helpers — fetch and strip HTML from primary documents.
 */

import { secFetch, filingDocUrl } from "./sec-client";

const MAX_FILING_BYTES = 5 * 1024 * 1024; // 5 MB
const FILING_CACHE_TTL = 86400 * 30; // 30 days

/**
 * Strip HTML tags and normalise whitespace, producing plain text.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fetch the primary HTML document of a filing and return it as plain text.
 */
export async function fetchFilingPrimaryDocumentText(args: {
  cik: string;
  accessionNo: string;
  primaryDoc: string;
}): Promise<{ url: string; text: string }> {
  const { cik, accessionNo, primaryDoc } = args;
  const accNoDashes = accessionNo.replace(/-/g, "");
  const url = filingDocUrl(cik, accNoDashes, primaryDoc);

  const html = await secFetch<string>(url, {
    maxBytes: MAX_FILING_BYTES,
    ttlSeconds: FILING_CACHE_TTL,
  });

  return { url, text: stripHtml(html) };
}
