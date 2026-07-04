import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/login", "/chat"],
    },
    sitemap: "https://sports-rulebook-rag-ai.vercel.app/sitemap.xml",
  };
}
