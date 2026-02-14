import fs from "node:fs";
import path from "node:path";

describe("Homepage implementation guide", () => {
  it("includes the BizConnect implementation guide with all phase headings", () => {
    const pagePath = path.resolve(process.cwd(), "app/page.tsx");
    const pageSource = fs.readFileSync(pagePath, "utf8");

    expect(pageSource).toContain("BizConnect Implementation Guide");
    expect(pageSource).toContain("Phase 1 - Core MVP");
    expect(pageSource).toContain("Phase 2 - Enhancements");
    expect(pageSource).toContain("Phase 3 - Advanced Features");
  });
});
