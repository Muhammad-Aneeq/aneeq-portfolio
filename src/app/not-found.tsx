import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { caseStudies } from "@/content";

export default function NotFound() {
  return (
    <Container className="py-28">
      <p className="text-xs text-halt uppercase" data-readout>
        404
      </p>
      <h1 className="mt-5 text-h1">Nothing here</h1>
      <p className="mt-6 text-lead text-muted">
        That page does not exist. Here is what does.
      </p>

      <ul className="mt-10 space-y-3">
        {caseStudies.map((study) => (
          <li key={study.slug}>
            <Link
              href={`/work/${study.slug}`}
              className="text-muted transition-colors duration-200 hover:text-text"
            >
              {study.name}
              <span className="text-faint">. {study.outcome}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-wrap gap-3">
        <ButtonLink href="/" variant="primary">
          Home
        </ButtonLink>
        <ButtonLink href="/work">All work</ButtonLink>
      </div>
    </Container>
  );
}
