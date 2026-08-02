import { createClient } from "@libsql/client/web";

const rawUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_TURSO_DATABASE_URL) ||
  (typeof process !== "undefined" ? process.env?.VITE_TURSO_DATABASE_URL || process.env?.TURSO_DATABASE_URL : "") ||
  "";

const rawToken =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_TURSO_AUTH_TOKEN) ||
  (typeof process !== "undefined" ? process.env?.VITE_TURSO_AUTH_TOKEN || process.env?.TURSO_AUTH_TOKEN : "") ||
  "";

function normalizeUrl(u: string): string {
  if (!u) return "";
  if (u.startsWith("libsql://")) {
    return u.replace("libsql://", "https://");
  }
  return u;
}

export const isTursoConfigured = Boolean(rawUrl);

export const turso = createClient({
  url: normalizeUrl(rawUrl) || "https://placeholder-db.turso.io",
  authToken: rawToken || "placeholder",
});

export async function queryRows<T = Record<string, unknown>>(
  sql: string,
  args: (string | number | boolean | null)[] = []
): Promise<T[]> {
  if (!isTursoConfigured) return [];
  const res = await turso.execute({ sql, args });
  return (res.rows ?? []) as unknown as T[];
}

export async function queryRow<T = Record<string, unknown>>(
  sql: string,
  args: (string | number | boolean | null)[] = []
): Promise<T | null> {
  if (!isTursoConfigured) return null;
  const res = await turso.execute({ sql, args });
  if (!res.rows || res.rows.length === 0) return null;
  return res.rows[0] as unknown as T;
}

export async function execSql(
  sql: string,
  args: (string | number | boolean | null)[] = []
): Promise<void> {
  if (!isTursoConfigured) return;
  await turso.execute({ sql, args });
}

export async function execBatch(
  statements: { sql: string; args?: (string | number | boolean | null)[] }[]
): Promise<void> {
  if (!isTursoConfigured) return;
  await turso.batch(
    statements.map((s) => ({ sql: s.sql, args: s.args ?? [] })),
    "write"
  );
}
