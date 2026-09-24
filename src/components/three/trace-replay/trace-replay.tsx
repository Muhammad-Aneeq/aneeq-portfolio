import { TraceFallback } from "@/components/three/trace-replay/fallback";
import type { TraceStation } from "@/content/schema";

/**
 * The case-study trace.
 *
 * **This used to be a second WebGL scene, and it no longer is.**
 *
 * The brief for this pass asked for one scene family rather than two, with the hero's
 * renderer driving this as well. Doing that literally would have meant rendering a case
 * study's six-to-nine real steps as slabs on a track — and the thing it would have
 * replaced is a numbered list with each step's label, kind and description as selectable
 * text, which the deleted canvas's own fallback already described as "a document rather
 * than a picture of one... the better artefact in every case where someone is reading".
 *
 * That was right. A reader on a case-study page is reading. The canvas was a flourish in
 * front of the reference, it cost a second three.js scene in the bundle, and everything
 * it conveyed was already in the list underneath it.
 *
 * So the scene family is one: the hero. This is the document, promoted from fallback to
 * the actual treatment, and it is now what every visitor gets rather than only those on
 * narrow screens, reduced motion, or without WebGL. The `StateLegend` beside it carries
 * the colour code.
 */
export function TraceReplay({ stations }: { stations: readonly TraceStation[] }) {
  return <TraceFallback stations={stations} className="mt-10" />;
}
