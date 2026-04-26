// T203 — contract tests for the ForSchoolsForm component.
// Mirrors the WaitlistForm tests: surface-level invariants on
// the rendered <form> HTML so the form's mechanism is locked
// (5 fields, required, GDPR consent, Turnstile widget, POST
// to /api/for-schools) before T204 wires the Resend send.

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import ForSchoolsForm from '../components/ForSchoolsForm.astro';

const render = () =>
  AstroContainer.create().then((c) => c.renderToString(ForSchoolsForm));

describe('T203: form mechanism', () => {
  test('renders a <form> posting to /api/for-schools', async () => {
    const html = await render();
    expect(html).toMatch(
      /<form[^>]+action="\/api\/for-schools"[^>]+method="post"|<form[^>]+method="post"[^>]+action="\/api\/for-schools"/,
    );
  });

  test('form has aria-labelledby pointing at its <h2 id="...">', async () => {
    const html = await render();
    const formMatch = html.match(/<form[^>]+aria-labelledby="([^"]+)"/);
    expect(formMatch, 'form must carry aria-labelledby').not.toBeNull();
    const labelId = formMatch![1];
    expect(html).toMatch(new RegExp(`<h2[^>]+id="${labelId}"`));
  });
});

describe('T203: 5 required fields with correct types', () => {
  test('name input: required, name="name"', async () => {
    const html = await render();
    expect(html).toMatch(
      /<input[^>]+name="name"[^>]*required|<input[^>]+required[^>]*name="name"/,
    );
  });

  test('school input: required, name="school"', async () => {
    const html = await render();
    expect(html).toMatch(
      /<input[^>]+name="school"[^>]*required|<input[^>]+required[^>]*name="school"/,
    );
  });

  test('students-count input: required, type="number", min="1"', async () => {
    const html = await render();
    expect(html).toMatch(
      /<input[^>]+name="students-count"[^>]*type="number"|<input[^>]+type="number"[^>]*name="students-count"/,
    );
    expect(html).toMatch(/<input[^>]+name="students-count"[^>]*min="1"|<input[^>]+min="1"[^>]*name="students-count"/);
    expect(html).toMatch(
      /<input[^>]+name="students-count"[^>]*required|<input[^>]+required[^>]*name="students-count"/,
    );
  });

  test('email input: required, type="email"', async () => {
    const html = await render();
    expect(html).toMatch(
      /<input[^>]+name="email"[^>]*type="email"|<input[^>]+type="email"[^>]*name="email"/,
    );
    expect(html).toMatch(
      /<input[^>]+name="email"[^>]*required|<input[^>]+required[^>]*name="email"/,
    );
  });

  test('message field: <textarea> name="message" required', async () => {
    const html = await render();
    expect(html).toMatch(
      /<textarea[^>]+name="message"[^>]*required|<textarea[^>]+required[^>]*name="message"/,
    );
  });
});

describe('T203: every field has a paired <label for="..."> (a11y)', () => {
  test('every named input/textarea has a corresponding <label for="...">', async () => {
    const html = await render();
    const inputIds = [
      ...html.matchAll(/<(?:input|textarea)[^>]+id="([^"]+)"[^>]*name="(?:name|school|students-count|email|message)"/g),
      ...html.matchAll(/<(?:input|textarea)[^>]+name="(?:name|school|students-count|email|message)"[^>]*id="([^"]+)"/g),
    ].map((m) => m[1]);
    expect(inputIds.length, 'all 5 fields must have ids').toBeGreaterThanOrEqual(5);
    for (const id of inputIds) {
      expect(html, `<label for="${id}"> must exist`).toMatch(
        new RegExp(`<label[^>]+for="${id}"`),
      );
    }
  });
});

describe('T203: GDPR consent (Article 7)', () => {
  test('consent checkbox is required', async () => {
    const html = await render();
    expect(html).toMatch(
      /<input[^>]+type="checkbox"[^>]*name="consent"[^>]*required|<input[^>]+name="consent"[^>]*type="checkbox"[^>]*required/,
    );
  });

  test('form links to /privacy (informed-consent prong)', async () => {
    const html = await render();
    expect(html).toMatch(/href="\/privacy"/);
  });
});

describe('T203: spam protection', () => {
  test('Cloudflare Turnstile widget is mounted', async () => {
    const html = await render();
    expect(html).toMatch(/class="cf-turnstile"/);
    expect(html).toMatch(/data-sitekey/);
  });
});

describe('T203: submit button + doctrine-aligned copy', () => {
  test('submit button has visible text content', async () => {
    const html = await render();
    const buttonMatch = html.match(/<button[^>]+type="submit"[^>]*>([\s\S]*?)<\/button>/);
    expect(buttonMatch, 'submit button must exist').not.toBeNull();
    const buttonText = buttonMatch![1].replace(/<[^>]+>/g, '').trim();
    expect(buttonText.length, 'submit button must have visible label').toBeGreaterThan(0);
  });

  test('no AI-coach / LLM / generative / neural / realistic vocab', async () => {
    const html = await render();
    const lower = html.toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });
});
