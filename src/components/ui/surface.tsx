import type { JSX } from "react";
import { cn } from "@/lib/utils";

export function Surface({
  as: As = "div",
  interactive = false,
  className,
  children,
  ...rest
}: {
  as?: keyof JSX.IntrinsicElements;
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const Tag = As as "div";
  return (
    <Tag
      className={cn(
        "raised-surface relative rounded-xl border border-border bg-surface",
        interactive && "interactive-surface",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
