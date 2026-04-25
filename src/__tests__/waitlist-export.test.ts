// T105 — unit tests for the waitlist-export founder utility. The
// CLI is a Node ESM module (.mjs) that lives in scripts/ at the
// repo root; vitest can import it directly because Vite handles
// the .mjs → .ts test interop. The CLI driver inside the .mjs
// runs only when the file is executed directly (process.argv
// guard), so importing the module here doesn't trigger a fetch.
//
// What the tests cover:
//   * Pure CSV formatting (escapeCsvField, formatContactsAsCsv)
//   * Resend HTTP layer (fetchAllContacts) with mocked fetch
//   * The full export composition (exportContactsAsCsv)
// What they don't cover:
//   * The CLI driver (env-reading, stdout-writing) — that is a
//     thin wrapper not worth instrumenting; the founder runs it
//     manually and reads the CSV output directly.

import { describe, expect, test, vi } from 'vitest';
import {
  escapeCsvField,
  exportContactsAsCsv,
  fetchAllContacts,
  formatContactsAsCsv,
} from '../../scripts/export-waitlist.mjs';

describe('T105: escapeCsvField — special-character handling', () => {
  test('plain ASCII passes through unchanged', () => {
    expect(escapeCsvField('driver@example.com')).toBe('driver@example.com');
  });

  test('value containing a comma gets wrapped in double quotes', () => {
    // RFC 4180: any field with a comma must be quoted, otherwise
    // the parser splits on it and the row gets mangled.
    expect(escapeCsvField('Smith, John')).toBe('"Smith, John"');
  });

  test('value containing a double-quote gets quoted + inner quote doubled', () => {
    // RFC 4180: " inside a field becomes "" (doubled).
    expect(escapeCsvField('he said "hi"')).toBe('"he said ""hi"""');
  });

  test('value containing a newline gets quoted', () => {
    // Embedded newlines are valid in CSV but only inside quoted
    // fields. Without quoting, the row would split on the \n.
    expect(escapeCsvField('line one\nline two')).toBe('"line one\nline two"');
  });

  test('empty string returns empty string (no spurious quoting)', () => {
    expect(escapeCsvField('')).toBe('');
  });
});

describe('T105: formatContactsAsCsv — full output shape', () => {
  test('empty contacts list returns just the header row', () => {
    expect(formatContactsAsCsv([])).toBe('email,unsubscribed,created_at');
  });

  test('one contact produces header + one data row', () => {
    const csv = formatContactsAsCsv([
      {
        id: 'c_1',
        email: 'driver@example.com',
        unsubscribed: false,
        created_at: '2026-04-25T10:00:00.000Z',
      },
    ]);
    expect(csv).toBe(
      'email,unsubscribed,created_at\ndriver@example.com,false,2026-04-25T10:00:00.000Z',
    );
  });

  test('multiple contacts produce one row each, in order', () => {
    const csv = formatContactsAsCsv([
      { id: 'c_1', email: 'a@example.com', unsubscribed: false, created_at: '2026-01-01' },
      { id: 'c_2', email: 'b@example.com', unsubscribed: true, created_at: '2026-02-01' },
    ]);
    expect(csv.split('\n')).toEqual([
      'email,unsubscribed,created_at',
      'a@example.com,false,2026-01-01',
      'b@example.com,true,2026-02-01',
    ]);
  });

  test('contact with comma-bearing field gets quoted', () => {
    // Defensive: an email with a comma is RFC-allowed but rare.
    // The escape path must run regardless of whether the field
    // value "looks safe".
    const csv = formatContactsAsCsv([
      {
        id: 'c_1',
        email: '"weird,email"@example.com',
        unsubscribed: false,
        created_at: '2026-04-25',
      },
    ]);
    expect(csv).toContain('"""weird,email""@example.com"');
  });
});

describe('T105: fetchAllContacts — Resend HTTP layer', () => {
  test('calls the audience contacts endpoint with Bearer auth', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    await fetchAllContacts('aud_test', 'rsk_test', fetchSpy);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toBe('https://api.resend.com/audiences/aud_test/contacts');
    const headers = new Headers((init as RequestInit).headers);
    expect(headers.get('Authorization')).toBe('Bearer rsk_test');
  });

  test('returns the parsed data array on success', async () => {
    const contacts = [
      {
        id: 'c_1',
        email: 'driver@example.com',
        unsubscribed: false,
        created_at: '2026-04-25T10:00:00.000Z',
      },
    ];
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ data: contacts }), { status: 200 }));
    const result = await fetchAllContacts('aud_test', 'rsk_test', fetchSpy);
    expect(result).toEqual(contacts);
  });

  test('returns empty array when API responds with no data field', async () => {
    // Defensive: if Resend ever returns an unexpected envelope, do
    // not crash — return an empty list and let the founder notice
    // the empty CSV.
    const fetchSpy = vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
    const result = await fetchAllContacts('aud_test', 'rsk_test', fetchSpy);
    expect(result).toEqual([]);
  });

  test('throws on non-OK response', async () => {
    // Surface the failure loudly so the founder knows the API
    // call did not work — silent empty CSV would be a footgun.
    const fetchSpy = vi.fn().mockResolvedValue(new Response('Forbidden', { status: 403 }));
    await expect(fetchAllContacts('aud_test', 'rsk_test', fetchSpy)).rejects.toThrow(/403/);
  });
});

describe('T105: exportContactsAsCsv — composition', () => {
  test('fetches + formats end-to-end', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: 'c_1',
              email: 'driver@example.com',
              unsubscribed: false,
              created_at: '2026-04-25',
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const csv = await exportContactsAsCsv('aud_test', 'rsk_test', fetchSpy);
    expect(csv).toBe('email,unsubscribed,created_at\ndriver@example.com,false,2026-04-25');
  });
});
