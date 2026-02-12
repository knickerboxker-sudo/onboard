export default function MethodologyPage() {
  return (
    <div className="prose prose-slate mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-ink">Methodology</h1>

      <section className="mt-6 space-y-4 text-sm text-ink">
        <h2 className="text-lg font-semibold">Data Source</h2>
        <p>
          All data comes from the{" "}
          <a
            href="https://www.sec.gov/edgar"
            className="text-accent underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            SEC EDGAR
          </a>{" "}
          system. We use the structured XBRL companyfacts endpoint and
          submissions metadata. Every number links back to the original SEC
          filing.
        </p>

        <h2 className="text-lg font-semibold">XBRL Tags Used</h2>

        <h3 className="font-medium">Dividends Paid</h3>
        <p>We search for these US-GAAP XBRL tags (in order of preference):</p>
        <ul className="list-inside list-disc font-mono text-xs">
          <li>PaymentsOfDividends</li>
          <li>PaymentsOfDividendsCommonStock</li>
          <li>DividendsPaid</li>
        </ul>

        <h3 className="font-medium">Share Repurchases (Buybacks)</h3>
        <p>We search for these US-GAAP XBRL tags (in order of preference):</p>
        <ul className="list-inside list-disc font-mono text-xs">
          <li>PaymentsForRepurchaseOfCommonStock</li>
          <li>PaymentsForRepurchaseOfEquity</li>
          <li>RepurchaseOfCommonStock</li>
        </ul>
        <p>
          If the broader &quot;equity&quot; tag is used instead of
          &quot;common stock,&quot; a warning is shown because it may include
          preferred stock repurchases.
        </p>

        <h3 className="font-medium">Employee Count</h3>
        <p>We first check XBRL tags:</p>
        <ul className="list-inside list-disc font-mono text-xs">
          <li>EntityNumberOfEmployees</li>
          <li>NumberOfEmployees</li>
        </ul>
        <p>
          If no XBRL employee count is available, we attempt to extract the
          count from the 10-K filing text by matching phrases such as
          &quot;approximately X employees&quot; or &quot;we employed X
          people.&quot; We filter out mentions of customers, suppliers, and
          contractors to reduce false positives. If multiple candidates are
          found, we use the largest value and add a warning.
        </p>
        <p>
          If no employee count can be determined, it is marked as
          &quot;unknown&quot; and per-employee metrics are not calculated.
        </p>

        <h2 className="text-lg font-semibold">Sign Normalization</h2>
        <p>
          Cash outflows (dividends paid, share repurchases) are stored as
          positive USD values regardless of how they appear in the XBRL data.
          Some companies report these as negative numbers (outflows); we take
          the absolute value.
        </p>

        <h2 className="text-lg font-semibold">Trailing 12 Months (TTM)</h2>
        <p>
          TTM values are computed by summing the last 4 quarterly (10-Q) filing
          periods. If fewer than 4 quarters are available, we fall back to the
          most recent annual (10-K) filing. If neither is available, TTM is
          shown as unavailable.
        </p>

        <h2 className="text-lg font-semibold">Per-Employee Calculations</h2>
        <p>
          When employee count is available and greater than zero:
        </p>
        <ul className="list-inside list-disc text-xs">
          <li>perEmployeeBuybacks = shareRepurchaseUSD / employeeCount</li>
          <li>perEmployeeDividends = dividendsPaidUSD / employeeCount</li>
          <li>perEmployeeTotal = (buybacks + dividends) / employeeCount</li>
        </ul>
        <p>Values are rounded to the nearest dollar.</p>

        <h2 className="text-lg font-semibold">Limitations</h2>
        <ul className="list-inside list-disc">
          <li>
            Not all companies file XBRL-tagged financial data for every metric.
          </li>
          <li>
            Employee text extraction from filing HTML is best-effort and may not
            capture all formats.
          </li>
          <li>
            Some companies use fiscal years that don&apos;t align with calendar
            quarters, which may affect TTM calculations.
          </li>
          <li>
            Data may be delayed based on SEC filing schedules and our cache
            refresh intervals.
          </li>
        </ul>

        <h2 className="text-lg font-semibold">Disclaimer</h2>
        <p>
          This tool is for informational and educational purposes only. It is
          not investment advice. Always verify data against the original SEC
          filings. We are not affiliated with the SEC.
        </p>
      </section>
    </div>
  );
}
