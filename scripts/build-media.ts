/**
 * Media pipeline.
 *
 * Turns the raw capture in the project repos into web-shaped assets:
 *   - a muted micro-loop (WebM + MP4 + poster) for card hovers
 *   - a bitrate-reduced full walkthrough (MP4 + poster) for click-to-play
 *
 * Run with `npm run media`. Sources live outside this repo, so it is a
 * deliberately manual step rather than part of the build — if a source is
 * missing it says so and moves on rather than failing the pipeline.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import ffmpegPath from "ffmpeg-static";

const FFMPEG = ffmpegPath as unknown as string;
const LABS = resolve(process.cwd(), "../aneeq-labs");
const OUT = resolve(process.cwd(), "public/media");

type Job = {
  slug: string;
  source: string;
  /** Seconds into the source to start the micro-loop. */
  loopStart: number;
  loopSeconds: number;
  /** Set when the source is a full walkthrough worth shipping in full. */
  full?: boolean;
};

/**
 * The narrated demos. Gitignored, ~115 MB each, so they live here and only their
 * compressed output is committed. See docs/MEDIA.md.
 */
const DEMOS = resolve(process.cwd(), "projects");

/*
  `loopStart` is chosen by looking at the footage, not by guessing.

  All three demos cut between screen capture and full-screen shots of the presenter
  talking. A hover loop is silent and autoplays, so landing it on a talking head gives
  you a person mouthing silently at the visitor. Every start below sits inside a
  product-only stretch, with six seconds of room before the next cut to camera.
*/
const JOBS: Job[] = [
  {
    slug: "revledger",
    source: join(DEMOS, "Revledger/0915.mp4"),
    // The summary panel with the recognised-revenue figure and the reports table.
    loopStart: 72,
    loopSeconds: 6,
    full: true,
  },
  {
    slug: "invoiceaudit",
    source: join(DEMOS, "InvoiceAudit/0915 (1)(1).mp4"),
    // The violations panel: the arithmetic disagreeing with the model, which is the
    // entire argument of the project. 12s looked right on a contact sheet and was not
    // — it lands mid-cut on the presenter. Checked frame by frame.
    loopStart: 46,
    loopSeconds: 6,
    full: true,
  },
  {
    slug: "ledgerlens",
    // Replaces the older silent 3m35s screen recording from aneeq-labs. This one is
    // 1m48s and narrated, so all three projects now present the same way.
    source: join(DEMOS, "LedgerLens/0916.mp4"),
    // A transaction open with its evidence panel beside it.
    loopStart: 72,
    loopSeconds: 6,
    full: true,
  },

  /*
    Silent screen recordings from the lab repos, as opposed to the three narrated
    demos above. They carry no audio track, so the `-c:a aac` on the walkthrough step
    finds nothing to encode and writes a video-only file, which is the intended
    behaviour rather than a special case.
  */
  {
    slug: "statementlens",
    source: join(LABS, "statementlens/docs/demo/statementlens-demo.webm"),
    // A computed statement with its figures and the commentary beside them.
    loopStart: 45,
    loopSeconds: 6,
    full: true,
  },
  {
    slug: "spendsort",
    source: join(LABS, "spendsort/demo/output/spendsort-demo.webm"),
    loopStart: 45,
    loopSeconds: 6,
    full: true,
  },
  {
    slug: "finxpia",
    source: join(LABS, "finxpia/docs/demo/finxpia-demo.webm"),
    loopStart: 30,
    loopSeconds: 6,
    full: true,
  },
  {
    slug: "reportsmith",
    source: join(LABS, "reportsmith/docs/demo.webm"),
    loopStart: 30,
    loopSeconds: 6,
    full: true,
  },
  {
    slug: "trace2evals",
    source: join(LABS, "trace2evals/demo/trace2evals-demo.mp4"),
    // The labeling screen, which its own coverage note calls "the whole product".
    loopStart: 50,
    loopSeconds: 6,
    full: true,
  },
  {
    slug: "policyground",
    source: join(LABS, "policyground/media/policyground_demo.mp4"),
    loopStart: 24,
    loopSeconds: 6,
    full: true,
  },
  {
    slug: "ledgerguard",
    source: join(LABS, "LedgerGuard/demo/output/ledgerguard-full-loop.mp4"),
    loopStart: 60,
    loopSeconds: 6,
    /*
      Loop only, same reasoning as LedgerLab below: 4m39s of a silent run is a large
      asset for a recording few people finish, and this project already carries the
      argument in prose. The loop is enough to show it moving.
    */
    full: false,
  },
  {
    slug: "ledgerlab",
    source: join(LABS, "ledgerlab/dist/demo/ledgerlab-demo-nightmare.webm"),
    // The live feed mid-run, where tool calls are actually arriving.
    loopStart: 90,
    loopSeconds: 6,
    /*
      Loop only. The source is 7m47s of a scrolling tool-call log: shipping it whole
      would be the largest asset on the site by a wide margin, for a recording almost
      nobody watches to the end. The hover loop shows what it is; the case study
      already carries stills for the detail.
    */
    full: false,
  },
];

function run(args: string[]) {
  execFileSync(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    stdio: "inherit",
  });
}

function mb(path: string) {
  return (statSync(path).size / 1024 / 1024).toFixed(1);
}

for (const job of JOBS) {
  if (!existsSync(job.source)) {
    console.log(`skip  ${job.slug} — source not found: ${job.source}`);
    continue;
  }

  const dir = join(OUT, job.slug);
  mkdirSync(dir, { recursive: true });

  const loopBase = join(dir, "loop");
  const clip = ["-ss", String(job.loopStart), "-t", String(job.loopSeconds), "-i", job.source];

  // Micro-loop, 960px wide, silent. `-an` is not an oversight: these autoplay,
  // and an autoplaying clip with an audio track is blocked by every browser.
  console.log(`build ${job.slug} micro-loop…`);
  run([
    ...clip,
    "-an",
    "-vf", "scale=960:-2,fps=24",
    "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1",
    `${loopBase}.webm`,
  ]);
  run([
    ...clip,
    "-an",
    "-vf", "scale=960:-2,fps=24",
    "-c:v", "libx264", "-crf", "30", "-preset", "slow",
    "-movflags", "+faststart", "-pix_fmt", "yuv420p",
    `${loopBase}.mp4`,
  ]);
  run([
    "-ss", String(job.loopStart), "-i", job.source,
    "-frames:v", "1", "-vf", "scale=960:-2", "-q:v", "4",
    `${loopBase}.jpg`,
  ]);

  console.log(
    `      loop.webm ${mb(`${loopBase}.webm`)}MB · loop.mp4 ${mb(`${loopBase}.mp4`)}MB · poster ${mb(`${loopBase}.jpg`)}MB`,
  );

  if (job.full) {
    const fullBase = join(dir, "walkthrough");
    console.log(`build ${job.slug} walkthrough…`);
    /*
      Audio is kept here, unlike the loop above.

      The loop must be silent because browsers refuse to autoplay a clip with an audio
      track. The walkthrough is click-to-play, and all three demos are narrated: the
      presenter explaining why the system refuses, or why the arithmetic overrules the
      model, is most of the value. Shipping these silent would leave a screen recording
      of an interface with no account of what it is doing.

      `-c:a aac -b:a 96k` is harmless on a source with no audio track: ffmpeg finds
      nothing to encode and writes a video-only file.
    */
    run([
      "-i", job.source,
      "-vf", "scale=1280:-2",
      "-c:v", "libx264", "-crf", "30", "-preset", "slow",
      "-c:a", "aac", "-b:a", "96k",
      "-movflags", "+faststart", "-pix_fmt", "yuv420p",
      `${fullBase}.mp4`,
    ]);
    /*
      Poster taken at `loopStart`, not at a fixed 12 seconds.

      12s was chosen for a screen recording that opened on the product. These demos
      open on the presenter, so a fixed offset produced a poster of a talking head with
      a burned-in subtitle across it — which tells a visitor nothing about what they are
      about to watch. `loopStart` is already a hand-checked product frame for each job,
      so reusing it costs nothing and cannot drift from the loop.
    */
    run([
      "-ss", String(job.loopStart), "-i", job.source,
      "-frames:v", "1", "-vf", "scale=1280:-2", "-q:v", "4",
      `${fullBase}.jpg`,
    ]);
    console.log(
      `      walkthrough.mp4 ${mb(`${fullBase}.mp4`)}MB · poster ${mb(`${fullBase}.jpg`)}MB`,
    );
  }
}

console.log("\nmedia build complete");
console.log(dirname(OUT) === OUT ? "" : `output: ${OUT}`);
