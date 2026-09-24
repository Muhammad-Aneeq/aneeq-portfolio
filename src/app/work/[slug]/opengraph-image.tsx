import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "@/content";
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Case study";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const headline = study.metrics[0];

  return ogImage({
    eyebrow: "case study",
    title: study.name,
    subtitle: `${study.outcome} · ${headline.prefix ?? ""}${headline.value}${headline.suffix ?? ""} ${headline.label}`,
  });
}
