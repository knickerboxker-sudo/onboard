import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import HomePage from "./page";

describe("HomePage implementation guide", () => {
  it("renders the BizConnect implementation guide with all phase headings", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).toContain("BizConnect Implementation Guide");
    expect(html).toContain("Phase 1 - Core MVP");
    expect(html).toContain("Phase 2 - Enhancements");
    expect(html).toContain("Phase 3 - Advanced Features");
    expect(html).toContain("JWT authentication, email verification, and password reset workflows");
    expect(html).toContain("Advanced multi-filter discovery with URL persistence and sorting");
    expect(html).toContain("In-app messaging with real-time updates, read states, and abuse controls");
  });
});
