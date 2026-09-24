import type { JSX, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The page shell. There is exactly one width.
 *
 * This used to take `width="prose"`, which shrank the entire shell to 44rem so the
 * paragraphs inside would read well. That conflated two separate decisions and left
 * /contact and /ask at 704px beside neighbours at 1248px, reading as a different site.
 *
 * A page is wide; the text inside it is narrow. Width of text is now set on the text,
 * with `max-w-tight | max-w-read | max-w-wide`. See docs/DESIGN-SYSTEM.md §1.
 */
export function Container({
  as: As = "div",
  className,
  children,
}: {
  // Intrinsic tags only. `ElementType` admits components whose children type is
  // `never`, which makes the generic unresolvable at the call site.
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: ReactNode;
}) {
  // The union of every intrinsic tag intersects to `children: never` (void elements
  // like <br> are in it), so narrow for JSX. The runtime tag is whatever was passed.
  const Tag = As as "div";

  return (
    <Tag
      className={cn("mx-auto w-full max-w-(--container-page) px-5 sm:px-8", className)}
    >
      {children}
    </Tag>
  );
}
