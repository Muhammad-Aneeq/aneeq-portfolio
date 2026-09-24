import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-on-ink hover:opacity-90 border border-transparent font-medium",
  ghost: "border border-border text-text hover:border-border-strong hover:bg-surface-2",
};

/**
 * Focus is a ring on every variant, offset so it clears the button's own border.
 * It is the same treatment on both, because a keyboard reader should not have to learn
 * two focus languages on one page.
 */
const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm transition-[background-color,border-color,filter] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text";

export function ButtonLink({
  href,
  variant = "ghost",
  external = false,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const cls = cn(base, VARIANTS[variant], className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "ghost",
  className,
  children,
  ...rest
}: { variant?: Variant } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, VARIANTS[variant], "disabled:opacity-50", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
