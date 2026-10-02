import { DecodeText } from "@/components/motion/decode-text";
import { Reveal, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Shared section heading and optional trailing action. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "start",
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "between";
  className?: string;
  /** Trailing slot — usually a "view all" link. */
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "between" && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      {/* data-stagger: the eyebrow, the title and the description arrive one after another. */}
      <div className="max-w-read" data-stagger>
        {eyebrow && (
          <StaggerItem>
            <p className="text-xs text-muted uppercase" data-readout>
              <DecodeText text={eyebrow} />
            </p>
          </StaggerItem>
        )}
        <StaggerItem>
          <h2 className={cn("text-h2", eyebrow && "mt-3")}>{title}</h2>
        </StaggerItem>
        {description && (
          <StaggerItem>
            <p className="mt-4 text-lead text-muted">{description}</p>
          </StaggerItem>
        )}
      </div>
      {children && <Reveal className="shrink-0">{children}</Reveal>}
    </div>
  );
}
