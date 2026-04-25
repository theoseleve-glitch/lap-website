// T103 — unit tests for the PostHog waitlist event captures.
// Two events: `waitlist_submitted` (fired when /waitlist renders
// with ?status=submitted, i.e. just after the form POST 303s
// back) and `waitlist_confirmed` (fired when /waitlist/welcome
// renders, i.e. just after the visitor clicks the confirm link).
//
// The capture logic is extracted into a small script module so
// it can be unit-tested without an Astro container — Astro
// bundles <script> blocks into external module refs, hiding the
// content from container output. Pages import this module in a
// <script> block and the side-effect/named-export pattern auto-
// fires the right event for the right page.

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const captureMock = vi.fn();
vi.mock('posthog-js', () => ({
  default: {
    capture: captureMock,
  },
}));

beforeEach(() => {
  captureMock.mockReset();
});

afterEach(() => {
  vi.resetModules();
});

describe('T103: captureWaitlistSubmittedFromUrl — fires only on ?status=submitted', () => {
  test('?status=submitted fires waitlist_submitted', async () => {
    const { captureWaitlistSubmittedFromUrl } = await import('../scripts/waitlist-events');
    const fired = captureWaitlistSubmittedFromUrl('?status=submitted');
    expect(fired).toBe(true);
    expect(captureMock).toHaveBeenCalledTimes(1);
    expect(captureMock).toHaveBeenCalledWith('waitlist_submitted');
  });

  test('empty search string does not fire', async () => {
    // The form's first GET arrives without query params. We must
    // NOT fire on every /waitlist visit — that would make the
    // event meaningless as a conversion signal.
    const { captureWaitlistSubmittedFromUrl } = await import('../scripts/waitlist-events');
    const fired = captureWaitlistSubmittedFromUrl('');
    expect(fired).toBe(false);
    expect(captureMock).not.toHaveBeenCalled();
  });

  test('?status=invalid (token failure) does not fire', async () => {
    // The confirm handler 303s to /waitlist?status=invalid for
    // bad tokens. That should NOT count as a submission — it's
    // a confirmation failure, not a form post. Locking this
    // prevents a future event-rename from accidentally folding
    // both states into the same metric.
    const { captureWaitlistSubmittedFromUrl } = await import('../scripts/waitlist-events');
    const fired = captureWaitlistSubmittedFromUrl('?status=invalid');
    expect(fired).toBe(false);
    expect(captureMock).not.toHaveBeenCalled();
  });

  test('?status=submitted&utm_source=foo still fires (extra params allowed)', async () => {
    // UTM params are appended by ad networks and email clicks.
    // They must not interfere with the status check.
    const { captureWaitlistSubmittedFromUrl } = await import('../scripts/waitlist-events');
    const fired = captureWaitlistSubmittedFromUrl('?status=submitted&utm_source=email');
    expect(fired).toBe(true);
    expect(captureMock).toHaveBeenCalledWith('waitlist_submitted');
  });
});

describe('T103: captureWaitlistConfirmed — always fires', () => {
  test('captureWaitlistConfirmed fires waitlist_confirmed', async () => {
    // Welcome page is the destination of a successful confirm —
    // visitors only land here via the confirm 303, so every load
    // is a conversion event. No conditional needed.
    const { captureWaitlistConfirmed } = await import('../scripts/waitlist-events');
    captureWaitlistConfirmed();
    expect(captureMock).toHaveBeenCalledTimes(1);
    expect(captureMock).toHaveBeenCalledWith('waitlist_confirmed');
  });
});
