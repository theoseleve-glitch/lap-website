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
import { signEmailToken, verifyEmailToken } from '../../functions/_lib/waitlist-token';

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
