import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Timeline({ children, className }: { children: ReactNode; className?: string }) {
  return <ol className={cn("role-timeline", className)}>{children}</ol>;
}

export function TimelineItem({ meta, title, subtitle, children, className }: {
  meta?: ReactNode; title: ReactNode; subtitle?: ReactNode; children?: ReactNode; className?: string;
}) {
  return <li className={cn("role-timeline-item", className)}>
    {meta && <p className="role-date text-sm text-faint" data-readout>{meta}</p>}
    <div className="role-detail"><h3 className="text-h3">{title}</h3>{subtitle && <p className="mt-2 text-sm text-faint">{subtitle}</p>}{children}</div>
  </li>;
}
