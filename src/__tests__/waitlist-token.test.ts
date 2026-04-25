// T095 — token helpers extracted from functions/api/waitlist.ts to
// functions/_lib/waitlist-token.ts so the T094 sign step and the
// T095 confirm-handler verify step share one source of truth. The
// `_lib` prefix excludes the file from Cloudflare Pages auto-routing
// (Pages strips any path segment that starts with `_`), so this code
// ships in the deployed bundle without ever being reachable via URL.
//
// Why constant-time HMAC compare matters: a `===` compare on the
// hex tag short-circuits at the first mismatched character. An
// attacker who can submit thousands of tokens and time the
// /api/waitlist/confirm response can iterate byte-by-byte to forge
// a valid tag without knowing the secret. Web Crypto's
// `crypto.subtle.timingSafeEqual` doesn't exist; we equalise length
// then XOR-fold the bytes ourselves.
//
// verifyEmailToken contract: returns `{ email }` on success or
// `null` on ANY failure (malformed, expired, tampered, wrong
// secret). The caller cannot distinguish failure modes — by design,
// no oracle for the confirmation flow.

import { describe, expect, test } from 'vitest';
import {
  buildUnsubscribeUrl,
  signEmailToken,
  signUnsubscribeToken,
  verifyEmailToken,
  verifyUnsubscribeToken,
} from '../../functions/_lib/waitlist-token';

const SECRET = 'test_waitlist_token_secret_at_least_32_chars';

describe('T095: waitlist-token helpers', () => {
  test('signEmailToken + verifyEmailToken roundtrip returns the email', async () => {
    // The sign step encodes the email + an expiry + an HMAC tag;
    // the verify step must round-trip the original email. Anything
    // weaker (e.g. a bare boolean "valid?") would force the confirm
    // handler to re-trust the URL, defeating the signed-token model.
    const token = await signEmailToken('driver@example.com', SECRET);
    const result = await verifyEmailToken(token, SECRET);
    expect(result).toEqual({ email: 'driver@example.com' });
  });

  test('verifyEmailToken returns null on tampered HMAC', async () => {
    // Swap the last hex character of the tag — the HMAC will not
    // match. This is the primary integrity check: anyone can guess
    // the email + expiry payload (it's URL-readable), but nobody
    // can forge the tag without the secret.
    const token = await signEmailToken('driver@example.com', SECRET);
    const tampered = token.slice(0, -1) + (token.endsWith('0') ? '1' : '0');
    const result = await verifyEmailToken(tampered, SECRET);
    expect(result).toBeNull();
  });

  test('verifyEmailToken returns null on expired token', async () => {
    // signEmailToken accepts an optional ttlSeconds for testing —
    // 0 produces an already-expired token (or near-zero, depending
    // on truncation). Either way, verify must reject anything where
    // expiry <= now.
    const token = await signEmailToken('driver@example.com', SECRET, -1);
    const result = await verifyEmailToken(token, SECRET);
    expect(result).toBeNull();
  });

  test('verifyEmailToken returns null on malformed token (wrong segment count)', async () => {
    // Tokens have exactly 3 dot-separated segments
    // (base64url(email).expiry.hexHmac). Anything else is malformed
    // — fail fast, do not pass an empty/garbage email to the
    // audience-add call downstream.
    const result = await verifyEmailToken('only.two', SECRET);
    expect(result).toBeNull();
  });

  test('verifyEmailToken returns null on wrong secret', async () => {
    // A token signed with secret A must NOT verify against secret
    // B. This is what makes WAITLIST_TOKEN_SECRET rotation
    // invalidate in-flight confirmations — the runbook documents
    // this trade-off, the test locks the behaviour.
    const token = await signEmailToken('driver@example.com', SECRET);
    const result = await verifyEmailToken(token, 'a_different_secret_of_the_same_length');
    expect(result).toBeNull();
  });

  test('verifyEmailToken returns null on non-numeric expiry', async () => {
    // Defensive: if a clever attacker swaps the expiry segment for
    // "Infinity" or "abc", parseInt would NaN/Infinity and the >=
    // check could be bypassed. Lock the type narrowing here.
    const token = await signEmailToken('driver@example.com', SECRET);
    const parts = token.split('.');
    const malformed = `${parts[0]}.notanumber.${parts[2]}`;
    const result = await verifyEmailToken(malformed, SECRET);
    expect(result).toBeNull();
  });
});

describe('T100: unsubscribe-token helpers', () => {
  test('signUnsubscribeToken + verifyUnsubscribeToken roundtrip returns the email', async () => {
    // The unsubscribe flow MUST work indefinitely (GDPR Article 7:
    // withdrawing consent is as easy as giving it). The token has
    // no expiry segment, so a recipient who clicks an old email
    // 18 months in still gets a working unsubscribe link.
    const token = await signUnsubscribeToken('driver@example.com', SECRET);
    const result = await verifyUnsubscribeToken(token, SECRET);
    expect(result).toEqual({ email: 'driver@example.com' });
  });

  test('verifyUnsubscribeToken returns null on tampered HMAC', async () => {
    const token = await signUnsubscribeToken('driver@example.com', SECRET);
    const tampered = token.slice(0, -1) + (token.endsWith('0') ? '1' : '0');
    const result = await verifyUnsubscribeToken(tampered, SECRET);
    expect(result).toBeNull();
  });

  test('verifyUnsubscribeToken returns null on malformed token', async () => {
    // Unsubscribe tokens are 2-segment (base64url(email).hexHmac).
    // 3 or 1 or anything else means malformed.
    const result = await verifyUnsubscribeToken('one', SECRET);
    expect(result).toBeNull();
    const result2 = await verifyUnsubscribeToken('one.two.three', SECRET);
    expect(result2).toBeNull();
  });

  test('verifyUnsubscribeToken returns null on wrong secret', async () => {
    const token = await signUnsubscribeToken('driver@example.com', SECRET);
    const result = await verifyUnsubscribeToken(token, 'a_completely_different_value_here');
    expect(result).toBeNull();
  });

  test('confirmation token (3-segment) does not verify as unsubscribe token', async () => {
    // CRITICAL cross-domain isolation. A confirm token signed with
    // the SAME secret must not pass unsubscribe verification —
    // otherwise the same secret could be used to forge cross-flow
    // tokens. Different segment shape + different HMAC payload
    // (purpose-tagged) make these two domains cryptographically
    // separate.
    const confirmToken = await signEmailToken('driver@example.com', SECRET);
    const result = await verifyUnsubscribeToken(confirmToken, SECRET);
    expect(result).toBeNull();
  });

  test('unsubscribe token (2-segment) does not verify as confirmation token', async () => {
    // The reverse direction — unsubscribe tokens must not pass
    // confirm verification.
    const unsubToken = await signUnsubscribeToken('driver@example.com', SECRET);
    const result = await verifyEmailToken(unsubToken, SECRET);
    expect(result).toBeNull();
  });

  test('buildUnsubscribeUrl produces a /api/waitlist/unsubscribe URL with the signed token', async () => {
    // The drip handler (T096 when unblocked) calls this helper
    // per-recipient to mint the URL passed into bodies(). Locking
    // the path here means a future change to the unsubscribe
    // endpoint route fails the test before the URL goes live.
    const baseUrl = 'https://lap-coach.racing/anything';
    const url = await buildUnsubscribeUrl('driver@example.com', SECRET, baseUrl);
    expect(url).toMatch(/^https:\/\/lap-coach\.racing\/api\/waitlist\/unsubscribe\?token=/);
    const token = new URL(url).searchParams.get('token');
    expect(token).toBeTruthy();
    const verified = await verifyUnsubscribeToken(token!, SECRET);
    expect(verified).toEqual({ email: 'driver@example.com' });
  });
});
