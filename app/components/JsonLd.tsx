const SITE_URL = "https://sports-rulebook-rag-ai.vercel.app";
const DESCRIPTION =
  "Ask any NBA, NFL, MLB, or FIFA rule in plain English and get an instant, citation-backed answer from the official rulebook — every answer cites the exact page.";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "SportRules AI",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      description: DESCRIPTION,
    },
    {
      "@type": "WebSite",
      name: "SportRules AI",
      url: SITE_URL,
      description: DESCRIPTION,
    },
    {
      "@type": "SoftwareApplication",
      name: "SportRules AI",
      applicationCategory: "UtilityApplication",
      operatingSystem: "Web",
      description: DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
