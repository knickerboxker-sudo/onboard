import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "sortir",
    short_name: "sortir",
    description: "A calm, pull-based internal team feed for small businesses.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#111111",
    icons: [
      {
        src: "/sortir-logo-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/sortir-logo-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
