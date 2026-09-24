import type { JSX, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Server wrappers. Only selected card groups opt into progressive CSS motion. */
export function Reveal({ as: As = "div", children, className }: {
  as?: keyof JSX.IntrinsicElements; children: ReactNode; className?: string;
  delay?: number; band?: "left" | "right";
}) {
  const Tag = As as "div";
  return <Tag data-reveal className={cn("min-w-0", className)}>{children}</Tag>;
}
export function Stagger({ children, className }: { children: ReactNode; className?: string; cascade?: boolean }) {
  return <div data-stagger className={cn("min-w-0", className)}>{children}</div>;
}
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div data-reveal className={cn("min-w-0", className)}>{children}</div>;
}
