import { cn } from "@/lib/utils";

export function TagChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border px-2 py-1 text-xs text-muted",
        className,
      )}
      data-readout
    >
      {children}
    </span>
  );
}

export function TagRow({
  tags,
  className,
}: {
  tags: readonly string[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((t) => (
        <li key={t}>
          <TagChip>{t}</TagChip>
        </li>
      ))}
    </ul>
  );
}
