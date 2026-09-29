import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Code2 as Github, Mail } from "lucide-react";
import { AgentWorkbench } from "@/components/agent-workbench";
import { CardLoop } from "@/components/media/card-loop";
import { demoProjects, featuredCaseStudies } from "@/content";
import { HEADLINE_METRICS, metricsFor } from "@/content/metrics";
import { MetricStrip } from "@/components/ui/metric-strip";
import { ContactForm } from "@/components/contact-form";
import { links, site } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="portfolio-home">
      <section className="portfolio-hero" aria-labelledby="hero-title">
        <div className="hero-intro">
          <p className="intro-line"><span className="availability-dot" aria-hidden="true" /> {site.name} <span className="intro-role">/ AI Engineer</span></p>
          <h1 id="hero-title">AI systems.<br />Built to hold up<br />in the real world.</h1>
          <p className="hero-description">I build agent systems, retrieval pipelines, and evaluation tools that make model behavior easier to inspect.</p>
          <ul className="hero-capabilities" aria-label="What I build">{["Agents", "Retrieval", "Evaluation", "Governance"].map(item => <li key={item}>{item}</li>)}</ul>
          <div className="hero-domain"><p>My deepest expertise is finance and accounting. I worked in accounting before I started automating it.</p><Link href="/finance" className="hero-finance-link portfolio-text-link">AI for finance &amp; accounting <ArrowUpRight size={17} aria-hidden /></Link></div>
          <div className="hero-actions"><a href="#selected-work" className="portfolio-button">Explore my work <ArrowDown size={17} aria-hidden /></a><Link href="/contact" className="portfolio-text-link">Let’s talk <ArrowUpRight size={17} aria-hidden /></Link></div>

          <p className="hero-location">Based in {site.location}. Building for teams everywhere.</p>
        </div>
        <AgentWorkbench />
      </section>
      <section aria-label="Experience at a glance"><MetricStrip metrics={metricsFor(HEADLINE_METRICS)} className="career-proof" /></section>

      {/*
        The demos lead, ahead of the written case studies.

        A recording of the thing running is stronger evidence than any paragraph about
        it, and it is what a visitor will actually watch. Each card is a link to the
        project rather than an inline player: three videos autoplaying at once would
        fight each other, and the hover loop already shows what the demo contains.

        `CardLoop` degrades to its poster frame under reduced motion and on devices
        that cannot afford the decode, and never fetches a clip for a card that has not
        been scrolled into view.
      */}
      <section className="home-demos" aria-labelledby="demos-title">
        <div className="portfolio-section-heading">
          <div>
            <p className="section-context">Recorded, narrated, unedited</p>
            <h2 id="demos-title">Watch them run.</h2>
          </div>
          <Link href="/demos" className="portfolio-button portfolio-button-secondary">All demos <ArrowUpRight size={17} aria-hidden /></Link>
        </div>
        <ul className="demo-grid" data-stagger>
          {demoProjects.map((demo) => (
            <li key={demo.slug} data-reveal>
              <Link href={demo.href} className="demo-card interactive-surface">
                <span className="demo-frame">
                  {demo.loop
                    ? <CardLoop loop={demo.loop} />
                    /* eslint-disable-next-line @next/next/no-img-element */
                    : <img src={demo.walkthrough.poster} alt="" loading="lazy" />}
                  <span className="demo-duration" data-readout>
                    {Math.floor(demo.walkthrough.seconds / 60)}:{String(demo.walkthrough.seconds % 60).padStart(2, "0")}
                  </span>
                </span>
                <span className="demo-body">
                  <strong>{demo.name}</strong>
                  <span>{demo.summary}</span>
                  <span className="demo-cue">Watch the walkthrough <ArrowUpRight size={15} aria-hidden /></span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section id="selected-work" className="selected-work" aria-labelledby="work-title">
        <div className="portfolio-section-heading"><div><p className="section-context">Built, tested, documented</p><h2 id="work-title">The work behind the words.</h2></div><Link href="/work" className="portfolio-button portfolio-button-secondary">All projects <ArrowUpRight size={17} aria-hidden /></Link></div>
        <div className="featured-projects" data-stagger>
          {featuredCaseStudies.map((study, index) => <article className={`featured-project project-${index}`} key={study.slug} data-reveal>
            <Link href={`/work/${study.slug}`} className="project-preview" aria-label={`View ${study.name} case study`}>
              <div className="preview-toolbar"><span>{study.name}</span><span>Case study <ArrowUpRight size={14} aria-hidden /></span></div>
              {study.shots[0] && <Image src={study.shots[0].src} alt={study.shots[0].alt} width={study.shots[0].width} height={study.shots[0].height} sizes={index === 0 ? "(min-width: 900px) 1100px, 92vw" : "(min-width: 900px) 540px, 92vw"} className="project-shot" />}
            </Link>
            <div className="project-description"><div><p className="project-stack">{study.stack.slice(0, 3).join(" / ")}</p><h3><Link href={`/work/${study.slug}`}>{study.name}<ArrowUpRight size={22} aria-hidden /></Link></h3></div><p>{study.outcome}</p></div>
          </article>)}
        </div>
      </section>
      <section className="engineering-section" aria-labelledby="approach-title"><div><p className="section-context">How I think</p><h2 id="approach-title">The demo is<br />the beginning.</h2><Link href="/about" className="portfolio-text-link">A little more about me <ArrowUpRight size={17} aria-hidden /></Link></div><div className="engineering-copy"><p>A model response is only one part of a product. I build the retrieval, evaluation, guardrails, and interfaces that make the whole system useful.</p><p className="home-answer">My work spans multi-agent coordination, document extraction, retrieval, and evaluation. An accounting background helps me identify where a plausible answer becomes a costly mistake. Here you can inspect implemented projects, trace their architecture, read measured results and limitations, and see how I separate deterministic checks from model judgment.</p><div className="expertise-links"><Link href="/finance"><span>Domain depth</span><strong>AI, grounded in finance.</strong><ArrowUpRight aria-hidden /></Link><Link href="/teaching"><span>Teaching & leadership</span><strong>Build it. Then teach it.</strong><ArrowUpRight aria-hidden /></Link></div></div></section>
      <section className="home-contact" id="contact" aria-labelledby="contact-title"><div className="home-contact-intro"><p><span className="availability-dot" aria-hidden="true" /> {site.availability}</p><h2 id="contact-title">Have a hard problem?<br />Let’s build through it.</h2><p className="contact-pitch">Tell me what you are building, where it gets difficult, and how I can help. You can also reach me directly by email.</p><div className="contact-links"><a href={`mailto:${site.email}`} className="portfolio-text-link"><Mail size={17} aria-hidden /> Email me</a><a href={links.github} target="_blank" rel="noreferrer" className="portfolio-text-link"><Github size={18} aria-hidden /> Explore the code <ArrowUpRight size={16} aria-hidden /></a><a href={links.linkedin} target="_blank" rel="noreferrer" className="portfolio-text-link">LinkedIn <ArrowUpRight size={16} aria-hidden /></a></div></div><ContactForm /></section>
    </div>
  );
}
