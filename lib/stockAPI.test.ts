import { fetchQuote } from "@/lib/stockAPI";

describe("stockAPI fetchQuote", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_STOCK_API_KEY;
  });

  it("parses API quote payload", async () => {
    process.env.NEXT_PUBLIC_STOCK_API_KEY = "test-key";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        "Global Quote": {
          "05. price": "212.34",
          "09. change": "2.10",
          "10. change percent": "1.00%",
          "03. high": "214.00",
          "04. low": "210.00",
          "06. volume": "55500000",
        },
      }),
    }) as unknown as typeof fetch;

    const quote = await fetchQuote("AAPL");

    expect(quote.price).toBe(212.34);
    expect(quote.changePercent).toBe(1);
    expect(quote.volume).toBe(55_500_000);
  });

  it("falls back to mock data when request fails", async () => {
    process.env.NEXT_PUBLIC_STOCK_API_KEY = "test-key";
    global.fetch = vi.fn().mockRejectedValue(new Error("Network down")) as unknown as typeof fetch;

    const quote = await fetchQuote("AAPL");

    expect(quote.symbol).toBe("AAPL");
    expect(Number.isFinite(quote.price)).toBe(true);
  });
});
