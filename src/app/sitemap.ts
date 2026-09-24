import type { MetadataRoute } from "next";
import { caseStudies, labs } from "@/content";
import { ASK_ENABLED } from "@/lib/features";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${site.url}${path}`;

  return [
    { url: url("/"), priority: 1 },
    { url: url("/finance"), priority: 0.9 },
    { url: url("/work"), priority: 0.9 },
    ...caseStudies.map((c) => ({ url: url(`/work/${c.slug}`), priority: 0.9 })),
    { url: url("/work/case-studies"), priority: 0.9 },
    ...labs.map((l) => ({ url: url(`/labs/${l.slug}`), priority: 0.6 })),
    { url: url("/demos"), priority: 0.8 },
    { url: url("/demos/case-studies"), priority: 0.7 },
    { url: url("/services"), priority: 0.8 },
    { url: url("/about"), priority: 0.8 },
    { url: url("/teaching"), priority: 0.7 },
    { url: url("/resume"), priority: 0.8 },
    ...(ASK_ENABLED ? [{ url: url("/ask"), priority: 0.7 }] : []),
    { url: url("/contact"), priority: 0.6 },
  ];
}
