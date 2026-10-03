import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowDown, ArrowUpRight, Code2 as Github, Mail } from "lucide-react";
import { AgentWorkbench } from "@/components/agent-workbench";
import { CardLoop } from "@/components/media/card-loop";
import { demoProjects } from "@/content";
import { HEADLINE_METRICS, metricsFor } from "@/content/metrics";
import { MetricStrip } from "@/components/ui/metric-strip";
import { ContactForm } from "@/components/contact-form";
import { FeedbackWall } from "@/components/feedback/feedback-wall";
import { links, site } from "@/lib/site";
import { Aurora } from "@/components/motion/aurora";
import { Faq } from "@/components/faq";

/**
 * The three the home page leads with. Named rather than `slice(0, 3)` so a new demo
 * cannot quietly change the home page: these are the three original narrated
 * walkthroughs. The others are one click away on /work and /demos.
 */
const FEATURED = ["revledger", "invoiceaudit", "ledgerlens"];
const featuredDemos = FEATURED.map((slug) => demoProjects.find((d) => d.slug === slug)).filter(
  (d): d is (typeof demoProjects)[number] => Boolean(d),
);

export default function HomePage() {
  return (
    <div className="portfolio-home">
      <section className="portfolio-hero" aria-labelledby="hero-title">
        <Aurora />
        <div className="hero-intro">
          <p className="intro-line"><span className="availability-dot" aria-hidden="true" /> {site.name} <span className="intro-role">/ AI Engineer</span></p>
          <h1 id="hero-title"><span className="hero-line">AI systems.</span> <span className="hero-line">Built to hold up</span> <span className="hero-line hero-shine">in the real world.</span></h1>
          <p className="hero-description">I build agent systems, retrieval pipelines, and evaluation tools that make model behavior easier to inspect.</p>
          <ul className="hero-capabilities" aria-label="What I build">{["Agents", "Retrieval", "Evaluation", "Governance"].map(item => <li key={item}>{item}</li>)}</ul>
          <div className="hero-domain"><p>My deepest expertise is finance and accounting. I worked in accounting before I started automating it.</p><Link href="/finance" className="hero-finance-link portfolio-text-link">AI for finance &amp; accounting <ArrowUpRight size={17} aria-hidden /></Link></div>
          <div className="hero-actions"><a href="#featured-work" className="portfolio-button">Explore my work <ArrowDown size={17} aria-hidden /></a><Link href="/contact" className="portfolio-text-link">Let’s talk <ArrowUpRight size={17} aria-hidden /></Link></div>

          <p className="hero-location">Based in {site.location}. Building for teams everywhere.</p>
        </div>
        <AgentWorkbench />
      </section>
      <section aria-label="Experience at a glance"><MetricStrip metrics={metricsFor(HEADLINE_METRICS)} className="career-proof" /></section>

      {/*
        One featured row, three projects, each with its narrated walkthrough.

        This used to be two sections back to back: four demo cards, then three case
        study screenshots. Seven dense application screens in a row, with LedgerLens in
        both, and nowhere for the eye to rest. A visitor deciding in a few seconds
        needs the best three, not everything; /work and /demos hold the rest.

        Each card links to the project, not an inline player: the hover loop shows what
        the demo contains, and the frame morphs into the project page's header on
        navigation. `CardLoop` stays a poster until hovered or focused.
      */}
      <section id="featured-work" className="home-demos home-band" aria-labelledby="featured-title">
        <div className="portfolio-section-heading">
          <div>
            <p className="section-context">Recorded, narrated, unedited</p>
            <h2 id="featured-title">Featured work.</h2>
          </div>
          <div className="featured-links">
            <Link href="/demos" className="portfolio-text-link">All demos <ArrowUpRight size={16} aria-hidden /></Link>
            <Link href="/work" className="portfolio-button portfolio-button-secondary">All projects <ArrowUpRight size={17} aria-hidden /></Link>
          </div>
        </div>
        <ul className="demo-grid" data-stagger>
          {featuredDemos.map((demo) => (
            <li key={demo.slug} data-reveal>
              <Link href={demo.href} className="demo-card interactive-surface">
                <ViewTransition name={`media-${demo.slug}`} share="morph" default="none">
                  <span className="demo-frame">
                    {demo.loop
                      ? <CardLoop loop={demo.loop} />
                      /* eslint-disable-next-line @next/next/no-img-element */
                      : <img src={demo.walkthrough.poster} alt="" loading="lazy" />}
                    <span className="demo-duration" data-readout>
                      {Math.floor(demo.walkthrough.seconds / 60)}:{String(demo.walkthrough.seconds % 60).padStart(2, "0")}
                    </span>
                  </span>
                </ViewTransition>
                <span className="demo-body">
                  {/* A heading, so screen-reader users can jump between the featured projects. */}
                  <h3 className="demo-title">{demo.name}</h3>
                  <span>{demo.summary}</span>
                  <span className="demo-cue">Watch the walkthrough <ArrowUpRight size={15} aria-hidden /></span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {/*
        The newest three approved reviews, straight after the work they are about.
        Renders nothing at all until one exists, so the page never shows an empty
        testimonial section.
      */}
      <FeedbackWall
        limit={3}
        className="home-feedback"
        header={
          <div className="portfolio-section-heading">
            <div>
              <h2>From people I have worked with.</h2>
            </div>
            <Link href="/feedback" className="portfolio-button portfolio-button-secondary">All feedback <ArrowUpRight size={17} aria-hidden /></Link>
          </div>
        }
      />
      <section className="engineering-section" aria-labelledby="approach-title"><div><h2 id="approach-title">The demo is<br />the beginning.</h2><Link href="/about" className="portfolio-text-link">A little more about me <ArrowUpRight size={17} aria-hidden /></Link></div><div className="engineering-copy"><p>A model response is only one part of a product. I build the retrieval, evaluation, guardrails, and interfaces that make the whole system useful.</p><p className="home-answer">My work spans multi-agent coordination, document extraction, retrieval, and evaluation. An accounting background helps me identify where a plausible answer becomes a costly mistake. Here you can inspect implemented projects, trace their architecture, read measured results and limitations, and see how I separate deterministic checks from model judgment.</p><div className="expertise-links"><Link href="/finance"><span>Domain depth</span><strong>AI, grounded in finance.</strong><ArrowUpRight aria-hidden /></Link><Link href="/teaching"><span>Teaching & leadership</span><strong>Build it. Then teach it.</strong><ArrowUpRight aria-hidden /></Link></div></div></section>
      <Faq />
      <section className="home-contact" id="contact" aria-labelledby="contact-title"><div className="home-contact-intro"><p><span className="availability-dot" aria-hidden="true" /> {site.availability}</p><h2 id="contact-title">Have a hard problem?<br />Let’s build through it.</h2><p className="contact-pitch">Tell me what you are building, where it gets difficult, and how I can help. You can also reach me directly by email.</p><div className="contact-links"><a href={`mailto:${site.email}`} className="portfolio-text-link"><Mail size={17} aria-hidden /> Email me</a><a href={links.github} target="_blank" rel="noreferrer" className="portfolio-text-link"><Github size={18} aria-hidden /> Explore the code <ArrowUpRight size={16} aria-hidden /></a><a href={links.linkedin} target="_blank" rel="noreferrer" className="portfolio-text-link">LinkedIn <ArrowUpRight size={16} aria-hidden /></a></div></div><ContactForm /></section>
    </div>
  );
}
