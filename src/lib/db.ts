import "server-only";
import { neon } from "@neondatabase/serverless";

/**
 * The one database connection, and the only file that reads DATABASE_URL.
 *
 * Neon's HTTP driver rather than a pooled TCP client: each query is a single HTTPS
 * request, which is what a serverless function wants. There is no connection to hold
 * open between invocations, and nothing to exhaust when many cold starts land at once.
 *
 * Optional by design. The site builds and runs with no database at all, which is how
 * CI builds it: every caller checks `hasDatabase()` and degrades to "nothing to show"
 * rather than failing the page.
 */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let client: ReturnType<typeof neon> | null = null;

export function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  client ??= neon(url);
  return client;
}
