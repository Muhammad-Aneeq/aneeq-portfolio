/// <reference types="next/image-types/global" />

/*
  Declares the static image modules that `import portrait from "@/assets/..."`
  relies on, independently of any generated file.

  Next writes the same reference into `next-env.d.ts`, but that file is gitignored
  (by Next's own default .gitignore) and is only produced once `next dev` or
  `next build` has run. CI type-checks before it builds, so on a clean checkout the
  declaration did not exist yet and both portrait imports failed with TS2307. It
  passed locally only because a previous dev run had already generated the file,
  which is the kind of green that means "this machine", not "this code".

  Committing `next-env.d.ts` instead would not work: it also imports
  `./.next/dev/types/routes.d.ts`, which is absent until a build has happened, so
  it would trade one missing-module error for another.

  This file is hand-written and safe to keep. It adds the image declarations only,
  and duplicating the reference is harmless when `next-env.d.ts` is present too.
*/
