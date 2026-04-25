// T105 — founder utility: fetch the waitlist audience from Resend
// and write CSV to stdout.
//
// Usage:
//   RESEND_API_KEY=rsk_xxx RESEND_AUDIENCE_ID=aud_xxx \
//     node scripts/export-waitlist.mjs > waitlist-2026-04-25.csv
//
// Or with pnpm:
//   pnpm export:waitlist > waitlist.csv
//
// Why a CLI script instead of an authed /api/waitlist/export
// endpoint: a public endpoint requires another secret to manage
// + adds an attack surface for what is fundamentally a one-shot
// founder query. The CLI keeps RESEND_API_KEY on the founder's
// machine, has zero public surface, and the founder runs it
// ad-hoc when curious.
//
// Why .mjs not .ts: the project has typescript installed but no
// TS runner (tsx / ts-node). Adding a devDep just to run a
// one-off script is overkill. JSDoc types in the .mjs give the
// editor most of the type help, vitest tests the same module
// for real type coverage on the pure functions.

/**
 * @typedef {Object} ResendContact
 * @property {string} id
 * @property {string} email
 * @property {boolean} unsubscribed
 * @property {string} created_at
 */

/**
 * Escape a single CSV field per RFC 4180. Wraps the value in
 * double quotes if it contains a comma, double quote, or newline;
 * doubles any embedded double quote.
 *
 * @param {string} value
 * @returns {string}
 */
export function escapeCsvField(value) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format an array of Resend contacts as CSV with a header row.
 *
 * @param {ResendContact[]} contacts
 * @returns {string}
 */
export function formatContactsAsCsv(contacts) {
  const header = 'email,unsubscribed,created_at';
  const rows = contacts.map(
    (c) =>
      `${escapeCsvField(c.email)},${c.unsubscribed ? 'true' : 'false'},${escapeCsvField(c.created_at)}`,
  );
  return [header, ...rows].join('\n');
}

/**
 * Fetch the full contacts list for a Resend audience. Resend's
 * contacts endpoint is unpaginated for typical waitlist sizes; if
 * the audience grows past their auto-cap, pagination would need
 * to be added here.
 *
 * @param {string} audienceId
 * @param {string} apiKey
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<ResendContact[]>}
 */
export async function fetchAllContacts(audienceId, apiKey, fetchImpl = globalThis.fetch) {
  const response = await fetchImpl(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`Resend API error: ${response.status} ${response.statusText}`);
  }
  const body = /** @type {{ data?: ResendContact[] }} */ (await response.json());
  return body.data ?? [];
}

/**
 * Compose the full export: fetch contacts + format as CSV.
 *
 * @param {string} audienceId
 * @param {string} apiKey
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<string>}
 */
export async function exportContactsAsCsv(audienceId, apiKey, fetchImpl = globalThis.fetch) {
  const contacts = await fetchAllContacts(audienceId, apiKey, fetchImpl);
  return formatContactsAsCsv(contacts);
}

// CLI driver — only fires when this file is executed directly,
// NOT when imported by the vitest test file. fileURLToPath
// converts the import.meta.url file:// URL back to a platform-
// native path that matches process.argv[1] on both POSIX and
// Windows. Without fileURLToPath the Windows backslash vs URL
// forward-slash mismatch silently disables the guard.
import { fileURLToPath } from 'node:url';
const isMain =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    process.stderr.write(
      'Missing RESEND_API_KEY or RESEND_AUDIENCE_ID — set both in env before running.\n',
    );
    process.exit(1);
  }
  exportContactsAsCsv(audienceId, apiKey)
    .then((csv) => {
      process.stdout.write(csv + '\n');
    })
    .catch((err) => {
      process.stderr.write(`Export failed: ${err.message}\n`);
      process.exit(1);
    });
}
