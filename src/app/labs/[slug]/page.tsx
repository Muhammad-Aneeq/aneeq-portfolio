import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { BackLink } from "@/components/ui/back-link";
import { ButtonLink } from "@/components/ui/button";
import { ShotGallery } from "@/components/media/shot-gallery";
import { Walkthrough } from "@/components/media/walkthrough";
import { LinkCluster } from "@/components/ui/link-cluster";
import { TagChip } from "@/components/ui/tag-chip";
import { getLab, labs } from "@/content";

export function generateStaticParams() {
  return labs.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lab = getLab(slug);
  if (!lab) return {};
  return {
    title: lab.name,
    description: `${lab.tagline}. ${lab.body[0]}`.slice(0, 200),
  };
}

export default async function LabPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lab = getLab(slug);
  if (!lab) notFound();

  return (
    /*
      Page width, not prose width.

      This was a 44rem column centred in a 78rem shell, so on any desktop the content
      sat in a narrow strip with roughly 400px of dead space either side and a video
      too small to read. /about, /teaching and /resume had the same problem and were
      fixed the same way: the page uses its full width and the *text* keeps a readable
      measure, via the editorial two-column rhythm rather than by squeezing everything.
    */
    <Container className="inner-page py-16 sm:py-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BackLink fallbackHref="/labs">Back</BackLink>
        {/*
          Separate from the back control on purpose. "Back" returns you to wherever you
          came from; these are deliberate sideways moves to the two indexes, and a
          reader who arrived from a shared link has no history to go back through.
        */}
        <nav aria-label="Browse" className="flex flex-wrap items-center gap-2">
          <ButtonLink href="/demos">All demos</ButtonLink>
          <ButtonLink href="/labs">All labs</ButtonLink>
        </nav>
      </div>

      <p className="mt-10 text-xs text-muted uppercase" data-readout>
        lab
      </p>
      <h1 className="mt-5 max-w-wide text-h1">{lab.name}</h1>
      <p className="mt-5 max-w-read text-lead text-muted">{lab.tagline}</p>

      {/*
        The recording leads, ahead of the prose and the links, and now at the page's
        full width rather than squeezed into a text column. It is the most direct
        evidence the page has: on a project whose argument is "watch what it refuses
        to do", a paragraph describing that is a poor substitute.
      */}
      {lab.walkthrough && (
        <div className="mt-12">
          <Walkthrough walkthrough={lab.walkthrough} />
        </div>
      )}

      {/*
        `editorial-section` is the same two-column rhythm /about and /teaching use: the
        heading sits in a narrow rail and the body runs beside it. The `<ul>` under the
        limits heading is a direct sibling on purpose — it is both the second grid
        column and what `#limits-title + ul` in tests/round2.spec.ts asserts on.
      */}
      <section className="editorial-section">
        <h2 className="text-h2">What it does</h2>
        <div className="space-y-5 leading-relaxed text-muted">
          {lab.body.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
          <LinkCluster className="pt-2" links={lab.links} />
        </div>
      </section>

      {lab.limits.length > 0 && (
        <section className="editorial-section" aria-labelledby="limits-title">
          <h2 id="limits-title" className="text-h2">Limits and current status</h2>
          <ul className="space-y-4 leading-relaxed text-muted">
            {lab.limits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </section>
      )}

      {lab.shots.length > 0 && (
        <section className="editorial-section">
          <h2 className="text-h2">Screens</h2>
          <ShotGallery shots={lab.shots} />
        </section>
      )}

      <section className="editorial-section">
        <h2 className="text-h2">Stack</h2>
        <div>
          <ul className="flex flex-wrap gap-2">
            {lab.stack.map((s) => (
              <li key={s}>
                <TagChip>{s}</TagChip>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-faint">{lab.dataNote}</p>
        </div>
      </section>
    </Container>
  );
}
