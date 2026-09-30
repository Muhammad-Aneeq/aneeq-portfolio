import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The kitchen sink is an internal review surface, the API routes are not
        // documents, the admin area is private, and a personal feedback link carries
        // a secret in its URL.
        disallow: ["/dev/", "/api/", "/admin", "/feedback/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
