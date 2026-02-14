import fs from "node:fs";
import path from "node:path";

describe("PWA manifest", () => {
  it("references bundled public icons including Safari home-screen icon", () => {
    const manifestPath = path.resolve(process.cwd(), "public/manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
      icons: Array<{ src: string }>;
      short_name: string;
    };

    expect(manifest.short_name).toBe("Onboard");
    expect(manifest.icons.map((icon) => icon.src)).toEqual(
      expect.arrayContaining(["/sortir-logo-192.png", "/sortir-logo-512.png", "/apple-touch-icon.png"]),
    );

    for (const icon of manifest.icons) {
      expect(fs.existsSync(path.resolve(process.cwd(), `public${icon.src}`))).toBe(true);
    }
  });
});
