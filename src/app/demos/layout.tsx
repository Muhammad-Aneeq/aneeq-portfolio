import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { demoCaseStudies, demoLabs, projectCount } from "@/content";

/**
 * The hero both demo tabs share.
 *
 * In a layout rather than repeated in each page so the two views cannot drift in
 * wording, and so switching tabs replaces only the list underneath — the heading a
 * reader is looking at stays where it is.
 */
export default function DemosLayout({ children }: { children: ReactNode }) {
  /*
    This number must equal the two tab counts added together, or it is describing a
    page other than this one.

    It briefly counted every project with a capture, which is a different and larger
    set: LedgerGuard has a hover loop but no walkthrough and no stills, so it is
    captured, yet there is nothing here to build a section around. That read 14 above
    tabs adding to 13, which is the same one-off mismatch the /labs chips had.

    So it counts what the page can actually show, and the wording says which test it
    applied rather than the vaguer "captured".
  */
  const shown = demoCaseStudies.length + demoLabs.length;

  return (
    <Container className="py-20">
      <p className="text-xs text-muted uppercase" data-readout>
        demos
      </p>
      <h1 className="mt-5 max-w-wide text-h1">The systems, running</h1>

      {/* The 40–60 word answer block. */}
      <p className="mt-7 max-w-read text-lead text-muted">
        Walkthroughs and screens captured from the real applications. Everything here was
        rendered by the project it belongs to. No mockups, no concept art. Projects that
        have not been captured yet are simply absent rather than represented by something
        that looks like a screenshot.
      </p>

      <p className="mt-7 text-sm text-faint" data-readout>
        {shown} of {projectCount} projects have a walkthrough or screens · all data synthetic
      </p>

      {children}
    </Container>
  );
}
