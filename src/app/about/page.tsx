import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import portrait from "@/assets/aneeq-portrait.jpg";
import { Container } from "@/components/layout/container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { MetricStrip } from "@/components/ui/metric-strip";
import { ABOUT_METRICS, metricsFor } from "@/content/metrics";
import { links, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Aneeq Khatri started his career reconciling accounts and closing the month, moved into software, then into AI. He now builds production multi-agent systems with reliability as the engineering standard, proven in accounting and finance.",
};

export default function AboutPage() {
  return (
    <Container className="inner-page py-20">
      <p className="text-xs text-muted uppercase" data-readout>
        about
      </p>
      <h1 className="mt-5 max-w-wide text-h1">I build AI that people can actually rely on</h1>

      {/* The 40–60 word answer block. */}
      <div className="about-intro"><p className="text-lead text-muted">
        I am an AI engineer with more than four years of engineering experience. I build and evaluate AI
        systems: multi-agent orchestration, retrieval, evaluation and the guardrails that
        make them safe to put in front of real users. My deepest specialisation is finance
        and accounting, because I worked in it before I automated it.
      </p>

      {/* The page's only figure strip, from the one canonical source. There used to be a
          second one 400px below this, restating three of the same four numbers under
          different labels. */}
      <Reveal>
        <MetricStrip layout="grid" metrics={metricsFor(ABOUT_METRICS)} />
      </Reveal>
      </div>

      <section className="editorial-section"><div>
      <h2 className="text-h2">From the books<br />to the systems</h2>
      {/*
        The one photograph on the site at a size worth looking at.

        It sits in this rail because the rail was empty: `editorial-section` puts the
        heading in a 1fr column against 2fr of prose, so everything below the heading
        was dead space on the page where a reader is deciding whether they want to
        work with this person. Real alt text, not `alt=""` like the navigation
        avatar, because here the portrait is content rather than decoration beside a
        name that already says who it is.
      */}
      <Image
        src={portrait}
        alt="Aneeq Khatri"
        sizes="(min-width: 768px) 22rem, 12rem"
        placeholder="blur"
        className="about-portrait raised-surface"
      />
      </div>
      <Stagger className="space-y-6 leading-relaxed text-text">
        <StaggerItem>
          <p>
            <span className="text-text">{`Getting a model to produce something impressive is the easy part now, and it has been for a while. The hard part is everything around it: knowing whether the output is right, catching it when it stops being right, deciding what the system is allowed to do on its own, and giving a person a way to see what happened and disagree. That is where I spend almost all of my time, and it is why my work is organised around reliability rather than capability.`}</span>
          </p>
        </StaggerItem>
        <StaggerItem>
          <p>
          I learned that lesson somewhere specific. Before software I worked in accounting,
          reconciling accounts and closing the month, so I have been the person who finds the
          mistake three weeks later when the numbers are already signed. It taught me what an
          unreliable system actually costs, which turns out to generalise well beyond
          accounting. If you want that thread in full, it is on{" "}
          <Link
            href="/finance"
            className="text-text underline decoration-border underline-offset-4 transition-colors hover:decoration-text"
          >
            the finance page
          </Link>
          .
        </p>
        </StaggerItem>
        <StaggerItem>
          <p>
            {`I came up through full-stack TypeScript and React before Python and LangGraph, which turns out to matter more than it sounds. An AI feature is not finished when the agent works; it is finished when a reviewer can see what the agent did and disagree with it. Being able to carry a feature from the graph through the API and into the screen is what makes that possible rather than aspirational.`}
          </p>
        </StaggerItem>
        <StaggerItem>
          <p>
            {`Alongside the engineering I lead a faculty of around a hundred instructors at the Governor Sindh Initiative and teach at PIAIC and Saylani. Thousands of engineers have come through those programmes. Teaching keeps me honest: you cannot hand-wave a concept to a room of three hundred people who are about to try it themselves.`}
          </p>
        </StaggerItem>
      </Stagger></section>


      <section className="editorial-section"><h2 className="text-h2">How I work</h2><p className="leading-relaxed text-text">I use written specifications, evaluation suites, and browser checks to test engineering decisions. Each case study explains the alternatives, the evidence behind the choice, and the limitations that remain. Those details are part of the work, not something added after it.</p></section>

      <section className="editorial-section"><h2 id="data" className="scroll-mt-24 text-h2">
        Why everything here is synthetic
      </h2>
      <div className="space-y-4 leading-relaxed text-text">
        <p>
          Every project on this site runs on generated books. Companies, counterparties,
          invoices and bank transactions produced from a seed by a data engine I wrote for
          exactly this purpose. None of it corresponds to a real organisation, and nothing
          is ever posted to a real system.
        </p>
        <p>
          That is a deliberate constraint, not a limitation I worked around. Client
          financial data stays with clients; publishing a portfolio built on it would be a
          breach whatever the engineering merit. The alternative most people take is to
          demo on data so clean it proves nothing, so the generator deliberately produces
          books that are wrong in the ways real books are wrong: mixed date formats, missing
          references, aliased payee names, duplicate payments, and payments that nothing in
          the ledger explains.
        </p>
        <p>
          The honest cost is that a perfect score on synthetic data is a much weaker claim
          than a good score on real books, and every case study says so in its own words
          rather than leaving you to infer it.
        </p>
      </div>

      </section><section className="editorial-section"><h2 className="text-h2">Where I am now</h2><div>
      <p className="mt-5 leading-relaxed text-muted">
        AI Engineer at Voya AI, remote from {site.location}, building multi-agent systems
        proven against accounting and finance work. Open to fully remote roles worldwide.
        Agentic AI, applied AI and LLM teams, in any domain where agents must be trusted. If you are drowning in month-end work, or trying to
        work out whether the agents you already have can be trusted, that is the conversation
        I want to have.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/contact" variant="primary">
          Get in touch
        </ButtonLink>
        <ButtonLink href={links.linkedin} external>
          LinkedIn
        </ButtonLink>
        <ButtonLink href="/resume">Resume</ButtonLink>
      </div>
      </div></section>
    </Container>
  );
}
