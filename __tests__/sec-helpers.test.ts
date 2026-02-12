import { describe, it, expect } from "vitest";
import { stripHtml } from "../src/lib/sec";

describe("stripHtml", () => {
  it("strips simple HTML tags", () => {
    const html = "<p>Hello <b>world</b></p>";
    expect(stripHtml(html)).toBe("Hello world");
  });

  it("handles &nbsp; entities", () => {
    const html = "We&nbsp;employed&nbsp;75,000&nbsp;employees.";
    expect(stripHtml(html)).toBe("We employed 75,000 employees.");
  });

  it("handles &amp; entity", () => {
    const html = "AT&amp;T Corporation";
    expect(stripHtml(html)).toBe("AT&T Corporation");
  });

  it("handles &lt; and &gt; entities", () => {
    const html = "value &lt; 100 and &gt; 50";
    expect(stripHtml(html)).toBe("value < 100 and > 50");
  });

  it("handles &quot; entity", () => {
    const html = 'He said &quot;hello&quot;';
    expect(stripHtml(html)).toBe('He said "hello"');
  });

  it("collapses whitespace", () => {
    const html = "<p>  Multiple   spaces   here  </p>";
    expect(stripHtml(html)).toBe("Multiple spaces here");
  });

  it("handles numeric entities", () => {
    const html = "Value&#160;is&#32;here";
    expect(stripHtml(html)).toBe("Value is here");
  });

  it("handles empty string", () => {
    expect(stripHtml("")).toBe("");
  });

  it("handles complex nested HTML", () => {
    const html = `
      <div class="content">
        <table><tr><td>Row 1</td></tr></table>
        <p>We had <span style="color:red">50,000</span> employees.</p>
      </div>
    `;
    const text = stripHtml(html);
    expect(text).toContain("50,000");
    expect(text).toContain("employees");
    expect(text).not.toContain("<");
  });
});
