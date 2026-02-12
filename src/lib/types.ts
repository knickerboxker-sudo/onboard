/** Core domain types — no database, pure data. */

export interface Company {
  cik: string; // 10-digit zero-padded
  ticker?: string;
  name: string;
}

export interface Filing {
  formType: "10-K" | "10-Q";
  accessionNo: string;
  filingDate: string; // YYYY-MM-DD
  periodEndDate: string; // YYYY-MM-DD
  primaryDocumentUrl: string;
}

export interface MetricNotes {
  tagsUsed: string[];
  usedXbrl: boolean;
  fallbacks: string[];
  warnings: string[];
  evidence?: {
    matchedSentence: string;
    url: string;
  };
}

export interface MetricSnapshot {
  filing: Filing;
  dividendsPaidUSD: number | null;
  shareRepurchaseUSD: number | null;
  totalReturnedUSD: number | null;
  employeeCount: number | null;
  employeeCountSource: "reported" | "unknown";
  perEmployeeBuybacksUSD: number | null;
  perEmployeeDividendsUSD: number | null;
  perEmployeeTotalUSD: number | null;
  notes: MetricNotes;
}

export interface TTMSummary {
  available: boolean;
  reason?: string;
  dividendsPaidUSD: number | null;
  shareRepurchaseUSD: number | null;
  totalReturnedUSD: number | null;
  employeeCount: number | null;
  employeeCountSource: "reported" | "unknown";
  perEmployeeBuybacksUSD: number | null;
  perEmployeeDividendsUSD: number | null;
  perEmployeeTotalUSD: number | null;
  quartersUsed: number;
}

export interface CompanyMetrics {
  company: Company;
  snapshots: MetricSnapshot[];
  ttm: TTMSummary | null;
  lastUpdated: string; // ISO timestamp
}

export interface SearchResult {
  cik: string;
  ticker: string;
  name: string;
}
