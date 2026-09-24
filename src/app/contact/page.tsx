import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { links, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with Aneeq Khatri. Agentic AI engineer building multi-agent systems you can prove are right. ${site.availability}.`,
};

export default function ContactPage() {
  return (
    <Container className="inner-page py-20">
      <Reveal>
        <p className="text-xs text-muted uppercase" data-readout>
          contact
        </p>
      </Reveal>
      <Reveal as="h1" delay={0.05} className="mt-5 text-h1">
        Let’s talk
      </Reveal>

      <Reveal as="p" delay={0.1} className="mt-8 max-w-read text-lead text-muted">
        I am open to fully remote roles worldwide. Agentic AI, applied AI, LLM and
        AI-for-finance teams. As well as contract and consulting work. If you are working
        out where agents fit, or whether the ones you have can be trusted, that is the
        conversation I want.
      </Reveal>

      {/*
        The details and the form sit inside one raised panel.

        Before this they were bare on the page ground, which in the light theme meant
        white inputs floating on a near-white page with nothing holding them together:
        the flattest surface on the site, and the one a visitor is most likely to be
        looking at when they decide whether to write. `contact-panel` carries the same
        gradient, shadow and glow as the home contact block, so the two read as the
        same component rather than two unrelated forms.
      */}
      <Reveal delay={0.08} className="contact-panel mt-12">
        <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-border pb-6 text-sm">
          <a href={`mailto:${site.email}`} className="text-muted transition-colors hover:text-text">
            {site.email}
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-muted transition-colors hover:text-text"
          >
            LinkedIn
          </a>
          <span className="text-faint" data-readout>
            {site.location} · PKT (UTC+5)
          </span>
        </div>

        <ContactForm />
      </Reveal>
    </Container>
  );
}
