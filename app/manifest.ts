import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SportRules AI — Sports Rulebook Assistant",
    short_name: "SportRules AI",
    description:
      "Instant, citation-backed answers to NBA, NFL, MLB, and FIFA rules.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e0e0e",
    theme_color: "#ff6b00",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
  };
}
