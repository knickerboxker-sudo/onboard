import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sortir.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/discover",
          "/messages",
          "/matches",
          "/connections",
          "/settings",
          "/onboarding",
          "/partnerships",
          "/profile-views",
          "/refer",
          "/analytics",
          "/partnership-builder",
          "/partnership-agreement",
          "/verify",
          "/api/",
          "/admin/",
          "/maintenance",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
