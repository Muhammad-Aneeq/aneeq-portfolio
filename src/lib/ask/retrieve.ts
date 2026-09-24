import { CORPUS, type Chunk } from "@/lib/ask/corpus";

/**
 * Retrieval: BM25 over the whole corpus, scored in process.
 *
 * SPEC §6 called for build-time embeddings plus cosine similarity. This is BM25
 * instead, and the reasoning is the same reasoning that ruled out a vector database
 * — just carried one step further. At ~65 chunks of technical prose, where the
 * question and the document share vocabulary ("what evals does CloseOps run"),
 * lexical scoring retrieves the right passage, and it does so with no embedding
 * provider, no API key, no build-time network call and no artefact to keep in sync.
 *
 * The honest cost: a question phrased entirely in synonyms of the corpus's wording
 * will retrieve worse than embeddings would. That is stated on the page rather than
 * hidden, and the vector-store version of this problem is PolicyGround.
 */

const K1 = 1.5;
const B = 0.75;

/** Words that carry no retrieval signal in a corpus that is entirely about one person's work. */
const STOP = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "than", "that", "this", "these", "those",
  "is", "are", "was", "were", "be", "been", "being", "am", "do", "does", "did", "doing",
  "have", "has", "had", "having", "i", "you", "he", "she", "it", "we", "they", "them",
  "what", "which", "who", "whom", "when", "where", "why", "how", "all", "any", "both",
  "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only",
  "own", "same", "so", "too", "very", "can", "will", "just", "of", "to", "in", "on",
  "for", "with", "as", "at", "by", "from", "about", "into", "over", "your", "his", "her",
  "its", "their", "there", "here", "does", "did", "use", "used", "using",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

type Index = {
  docs: { chunk: Chunk; tokens: string[]; length: number; freq: Map<string, number> }[];
  df: Map<string, number>;
  avgLength: number;
};

function buildIndex(): Index {
  const docs = CORPUS.map((chunk) => {
    const tokens = tokenize(chunk.text);
    const freq = new Map<string, number>();
    for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
    return { chunk, tokens, length: tokens.length, freq };
  });

  const df = new Map<string, number>();
  for (const doc of docs) {
    for (const term of doc.freq.keys()) df.set(term, (df.get(term) ?? 0) + 1);
  }

  const avgLength = docs.reduce((sum, d) => sum + d.length, 0) / Math.max(docs.length, 1);
  return { docs, df, avgLength };
}

const INDEX = buildIndex();

export type Retrieved = { chunk: Chunk; score: number };

/** IDF for a query term. Terms absent from the corpus get the maximum weight. */
function idf(term: string): number {
  const n = INDEX.docs.length;
  const df = INDEX.df.get(term) ?? 0;
  if (df === 0) return Math.log(1 + (n + 0.5) / 0.5);
  return Math.max(0, Math.log(1 + (n - df + 0.5) / (df + 0.5)));
}

const BY_ID = new Map(INDEX.docs.map((d) => [d.chunk.id, d]));

/**
 * How much of the question the best retrieved passage actually accounts for,
 * weighted by how informative each term is.
 *
 * Two iterations of the eval suite produced this. A raw BM25 floor could not tell
 * "scored low" from "is not in the corpus" — "how much does Aneeq want to be paid"
 * cleared any sane floor on common words alone. Weighting by IDF helped but still
 * measured the question against the *whole corpus*, so a query whose rare term was
 * missing still passed on its common ones.
 *
 * Measuring against the retrieved passages is the version that discriminates,
 * because it asks the question that actually matters: can *this* passage answer
 * *this* question? A rare term the top passages have never seen carries maximum
 * weight against them, which is exactly what `quicksort` and `football` are.
 */
export function coverage(query: string, results: Retrieved[]): number {
  const terms = [...new Set(tokenize(query))];
  if (terms.length === 0 || results.length === 0) return 0;

  const weights = terms.map(idf);
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;

  let best = 0;
  for (const { chunk } of results) {
    const doc = BY_ID.get(chunk.id);
    if (!doc) continue;
    let matched = 0;
    terms.forEach((term, i) => {
      if (doc.freq.has(term)) matched += weights[i];
    });
    best = Math.max(best, matched / total);
  }

  return best;
}

export function retrieve(query: string, k = 5): Retrieved[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const n = INDEX.docs.length;

  const scored = INDEX.docs.map((doc) => {
    let score = 0;
    for (const term of terms) {
      const f = doc.freq.get(term);
      if (!f) continue;
      const df = INDEX.df.get(term) ?? 0;
      // Standard BM25 IDF, floored at zero so a term present in almost every
      // chunk contributes nothing rather than a negative score.
      const idf = Math.max(0, Math.log(1 + (n - df + 0.5) / (df + 0.5)));
      const norm = f * (K1 + 1);
      const denom = f + K1 * (1 - B + (B * doc.length) / INDEX.avgLength);
      score += idf * (norm / denom);
    }
    return { chunk: doc.chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/**
 * Refusal thresholds. Both must clear — coverage answers "is this question about
 * something the corpus contains", the score floor answers "did we find a passage
 * worth quoting". Tuned against `evals.ts`: every in-scope case clears both, every
 * out-of-scope case fails at least one.
 */
export const MIN_COVERAGE = 0.5;
export const MIN_SCORE = 2.0;

/**
 * Is the single most informative word in the question accounted for?
 *
 * Aggregate coverage has a failure mode that a growing corpus makes worse: a question
 * made of one rare term plus several common ones can clear the threshold on the common
 * ones alone. "What football team does he support?" is exactly that shape — `football`
 * is the whole question, while `team` and `support` are filler that any corpus about
 * software teams and support agents will happen to contain.
 *
 * It was caught by the eval suite the moment the case studies gained their "where else
 * this applies" sections: adding the words `support`, `team` and `appeals` to the corpus
 * pushed that question over the line without making it any more answerable. The corpus
 * got broader; the question did not get more in-scope.
 *
 * So the rarest term is required outright. If the word carrying the most information in
 * the question appears in nothing that was retrieved, the corpus does not hold the
 * answer, whatever the aggregate says. This is the third iteration of this test — the
 * first two are described above — and each failure has been the same lesson: coverage
 * has to be measured against what discriminates, not against what merely matches.
 */
function rarestTermCovered(query: string, results: Retrieved[]): boolean {
  const terms = [...new Set(tokenize(query))];
  if (terms.length === 0) return false;

  let rarest = terms[0];
  let best = -Infinity;
  for (const term of terms) {
    const w = idf(term);
    if (w > best) {
      best = w;
      rarest = term;
    }
  }

  return results.some(({ chunk }) => BY_ID.get(chunk.id)?.freq.has(rarest) ?? false);
}

export function shouldRefuse(query: string, results: Retrieved[]): boolean {
  if (results.length === 0) return true;
  if (!rarestTermCovered(query, results)) return true;
  if (coverage(query, results) < MIN_COVERAGE) return true;
  return results[0].score < MIN_SCORE;
}

export const CORPUS_SIZE = CORPUS.length;
