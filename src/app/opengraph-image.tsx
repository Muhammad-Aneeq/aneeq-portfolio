import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Aneeq Khatri. AI Engineer";

export default function Image() {
  return ogImage({
    eyebrow: "ai engineer",
    title: "I build multi-agent systems for finance that you can prove are right.",
    subtitle:
      "Production agents backed by evaluation pipelines, guardrails and human gates. Proven in finance first.",
  });
}
