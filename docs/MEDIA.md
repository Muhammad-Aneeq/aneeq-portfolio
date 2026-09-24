# Video on this site: how it works, and where it lives

Written because "will `npm run media` upload my videos to Vercel?" is a reasonable question
with a non-obvious answer. Short version: **no, nothing is uploaded, and you do not need
Vercel Blob.** The long version explains why, and when that answer would change.

---

## 1. What `npm run media` actually does

It is a local video compressor. Nothing more.

The script is `scripts/build-media.ts`. It contains **zero network calls** — no upload, no
API, no cloud service. It runs ffmpeg on your own machine, reads a big raw video from your
disk, and writes small web-shaped copies into `public/media/`.

```
your raw recording                 ffmpeg, on your laptop            files in the repo
projects/Revledger/0915.mp4   ->   npm run media               ->    public/media/revledger/
113 MB, 2560x1440, narrated                                          ~2 MB total
```

That is the whole job. The raw file never moves, never uploads, and never enters git.

### The five files it produces per project

| File | Size | What it is for |
|---|---|---|
| `loop.webm` | ~70 KB | silent 6-second loop that plays on card hover |
| `loop.mp4` | ~30 KB | same loop, for Safari |
| `loop.jpg` | ~40 KB | poster frame, shown before the loop plays |
| `walkthrough.mp4` | ~2 MB | the full demo, click-to-play |
| `walkthrough.jpg` | ~80 KB | poster frame for the full demo |

The hover loop is **deliberately silent**. Browsers block autoplaying video that has an audio
track, so a loop with sound would simply refuse to play. The full walkthrough keeps its
narration, because you click it on purpose.

---

## 2. How the videos get to Vercel

They ride along with your code. There is no separate upload step.

```
1. npm run media          ffmpeg writes ~2 MB files into public/media/
2. git add + commit       those small files go into the repo like any other asset
3. git push               GitHub receives them
4. Vercel builds          pulls the repo, serves public/ from its CDN
```

Anything inside `public/` is served at the matching URL. `public/media/revledger/loop.mp4`
becomes `https://yoursite.com/media/revledger/loop.mp4`. You do not configure this; it is
just how Next.js and Vercel treat that folder.

**Your 347 MB of raw recordings never reach Vercel.** They sit in `projects/`, which is
listed in `.gitignore`, so git ignores them, GitHub never sees them, and Vercel never sees
them. Only the compressed output is committed.

---

## 3. Why the raw files could never be deployed anyway

Two hard walls, either of which stops you:

| Wall | Limit | Your raw files |
|---|---|---|
| GitHub file size | 100 MB per file, rejected outright | 113, 121, 113 MB — all over |
| Vercel static upload | 100 MB total on Hobby, 1 GB on Pro | 347 MB total |

So this is not a preference. Compressing is the only route that works, and the pipeline
exists precisely to do it.

---

## 4. What Vercel Blob is, and how you would use it

Vercel Blob is object storage — think S3 with a Vercel-shaped wrapper. You put a file in,
you get back a public URL, and Vercel serves it from a storage network tuned for large
media. Files can be up to 5 TB, so it comfortably handles things `public/` cannot.

If you ever needed it, the flow is:

1. Create a store in the Vercel dashboard, choosing **public** access (a public blob is
   readable by anyone with the URL; a private one has to be proxied through a function).
   The access mode cannot be changed after creation.
2. Connect the store to the project in its **Projects** tab. Vercel injects the credentials
   automatically via OIDC, so there is no secret to manage.
3. Install the SDK and upload:

```js
import { put } from "@vercel/blob";

const blob = await put("demos/revledger.mp4", file, { access: "public" });
console.log(blob.url); // https://<id>.public.blob.vercel-storage.com/demos/revledger-<hash>.mp4
```

4. Use `blob.url` as the video `src` instead of a local path.

A script running on your own machine rather than on Vercel needs a `BLOB_READ_WRITE_TOKEN`
instead of OIDC. Vercel recommends multipart uploads above 100 MB, which the SDK handles
for you.

---

## 5. So do we need it? No.

Blob solves a problem this site does not have. The deciding number:

| | Size |
|---|---|
| Vercel's own guidance: consider a CDN above | ~1 MB per file |
| Hobby static upload ceiling | 100 MB total |
| All 9 compressed walkthroughs together | ~15.6 MB |
| **Everything under `public/media`** | **~29 MB, 81 files** |

Twenty-nine megabytes against a hundred. Blob would add a storage service, a store to
configure, credentials, an SDK dependency, and URLs that live outside the repo — and buy
nothing, because nothing here is under pressure.

**This number has moved.** It was ~7 MB across three walkthroughs when this was written;
eight more projects have been recorded since. The answer is still no, but the margin is
now roughly 3x rather than 14x, and the first revisit trigger below is 40–50 MB. Measure
before assuming, with `du -sh public/media`.

There is also a real cost to moving them out: files in `public/` are versioned with the code.
Check out an old commit and you get the video that matched it. Blob URLs are not versioned
that way, so the repo and its media can drift apart.

**Revisit this decision if any of the following becomes true:**

- Compressed media grows past roughly 40–50 MB total, where the deployment starts to feel it
- You want long-form video (10 minutes and up) where 2 MB per file stops being realistic
- Bandwidth on the Hobby plan becomes a problem, since Blob transfer is cheaper per GB for
  large assets
- You want to swap a video without redeploying the site

None of those apply today. If they ever do, section 4 is the recipe.

---

## 6. Adding another demo later

1. Drop the recording somewhere outside the repo, or in `projects/` (already gitignored).
2. Add a job to the `JOBS` array in `scripts/build-media.ts`:

```ts
{
  slug: "yourproject",          // becomes public/media/yourproject/
  source: "…/your-recording.mp4",
  loopStart: 42,                // seconds into the video where the loop starts
  loopSeconds: 6,
  full: true,                   // also build the click-to-play walkthrough
}
```

3. Pick `loopStart` on a moment that reads at a glance with no sound and no context — a
   result appearing, a state changing. Not a mouse travelling across a menu.
4. Run `npm run media`, check the printed sizes, commit the output.

The script skips any job whose source file is missing and says so, rather than failing the
run. Sources are expected to be absent on a machine that does not have the recordings, which
is why this is a manual step and not part of `npm run build`.

---

## 7. Which projects need a screenshot, and which do not

The site had five projects with a recording and no stills, five with stills and no
recording, and three with neither. That is inconsistency by accident, not by design, so
here is the rule.

As of the latest pass the split is: 14 of 16 projects have a capture, 13 of those have a
walkthrough or stills and so appear on /demos, and 2 have nothing. LedgerGuard is the odd
one: a hover loop and nothing else, so it counts as captured but has no /demos section.
FinSight and Payment Reconciliation have no capture at all.

**A recording is the evidence.** Where one exists it is the card image, via its poster
frame, and the lead of the project page. A project with a recording is not missing a
screenshot: the poster *is* a screenshot, and it is the frame a visitor sees before
deciding whether to press play.

**A still earns its place only when the caption says something the recording cannot.**
CloseOps' caption reads "the planted anomaly in red: account 1000, 17 of 17 unmatched
against a 55% tolerance". That is analysis pointing at one detail on one screen. A
recording moves on; a caption holds still. Where a still has no such caption, it is
decoration and the recording already covers it.

**Where there is neither, the card says so** rather than reserving empty space for media
that does not exist. `tests/media.spec.ts` asserts that every card either shows a real
capture or states it has none.

### Captures come from the project repositories

Most of the lab repos run `make capture`, which screenshots every screen in both themes
and **fails rather than writes** if a screen renders empty, shows an error, scrolls
horizontally, logs to the console, or is missing a claim its README makes about it. Those
are better evidence than anything driven by hand here, and they are what the site uses.

This matters more than it sounds. Two captures on the site had gone stale in a way that
understated the work rather than merely looking old:

- **FinXPIA** showed `validation: PENDING (mock)` with a banner reading "this is not a
  validation pass". The project had since been run against a real model.
- **PolicyGround** showed a "no model credential" banner and an answer rendering raw
  markdown asterisks. The refreshed capture has neither.

Both were replaced from repository captures at lower resolution than the originals, which
is the right trade: a sharp screenshot of a degraded run is worse evidence than a softer
screenshot of a real one.
