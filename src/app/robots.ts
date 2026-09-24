import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The kitchen sink is an internal review surface, and the agent endpoint
        // is not a document.
        disallow: ["/dev/", "/api/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
