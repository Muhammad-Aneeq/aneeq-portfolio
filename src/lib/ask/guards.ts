/**
 * Abuse and cost controls for the public agent endpoint.
 *
 * Both are per-instance and in memory, which is honest about what they are: enough
 * for a personal site on a single deployment, and the wrong tool the moment this runs
 * on more than one. A shared store is the upgrade; pretending otherwise is not.
 */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 12;

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

/** Hard daily ceiling. On breach the endpoint says so rather than erroring. */
const DAILY_OUTPUT_TOKEN_CAP = 120_000;

let spend = { day: new Date().getUTCDate(), tokens: 0 };

export function budgetExhausted(): boolean {
  const today = new Date().getUTCDate();
  if (today !== spend.day) spend = { day: today, tokens: 0 };
  return spend.tokens >= DAILY_OUTPUT_TOKEN_CAP;
}

export function recordSpend(outputTokens: number) {
  spend.tokens += outputTokens;
}

export const MAX_QUESTION_LENGTH = 400;
