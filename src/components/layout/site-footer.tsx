import Link from "next/link";
import { GithubIcon, LinkedinIcon, MailIcon, XIcon } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { links, site } from "@/lib/site";

/**
 * Social links are icons rather than words: four of them read as a row of one thing
 * at a glance, where four stacked text links read as more site navigation and get
 * skipped next to the actual nav column beside them.
 *
 * Each still carries a visible-to-screen-reader name via aria-label, so the icons
 * are decoration for sighted users only and never the sole label.
 */
const SOCIALS = [
  { href: links.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  { href: links.github, label: "GitHub", Icon: GithubIcon },
  { href: links.x, label: "X", Icon: XIcon },
  { href: `mailto:${site.email}`, label: "Email", Icon: MailIcon },
];

/**
 * Two groups: the work, and the person.
 *
 * **One label per destination, matching the nav exactly.** `/work` was "Work" in the nav
 * and "Case studies" here; `/finance` was "Finance" there and "AI for finance" here. A
 * reader cannot tell whether two differently-named links go to the same place without
 * clicking both, and on a site this size that is the difference between a footer that
 * orients someone and one that makes them re-navigate.
 */
const FOOTER_GROUPS = [
  {
    label: "the work",
    items: [
      { href: "/work", label: "Work" },
      { href: "/labs", label: "Labs" },
      { href: "/demos", label: "Demos" },
      { href: "/finance", label: "Finance" },
    ],
  },
  {
    label: "the person",
    items: [
      { href: "/about", label: "About" },
      { href: "/services", label: "Services" },
      { href: "/teaching", label: "Teaching" },
      { href: "/resume", label: "Resume" },
      { href: "/contact", label: "Contact" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border py-14">
      <Container>
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-h3">{site.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{site.tagline}</p>
            <p className="mt-4 text-sm text-faint" data-readout>
              {site.location} · {site.availability.toLowerCase()}
            </p>

            <ul className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    rel={href.startsWith("mailto:") ? undefined : "me noreferrer"}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    className="flex size-10 items-center justify-center rounded-lg border border-border text-muted transition-colors duration-200 hover:border-border-strong/50 hover:text-text"
                  >
                    <Icon className="size-4" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/*
            Grouped into columns rather than one six-item run.

            A single vertical list of every route is a sitemap, not a footer: it gives a
            reader no sense of which links belong together and leaves a tall thin column
            against a short left block. Two labelled groups read faster and balance the
            row.
          */}
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-8 sm:gap-x-16">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-xs text-faint uppercase" data-readout>
                  {group.label}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors duration-200 hover:text-text"
                      >
                        {item.label}
                        <span
                          aria-hidden
                          className="h-px w-0 bg-ink transition-all duration-300 group-hover:w-3"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
