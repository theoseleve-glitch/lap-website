// T096 — Cloudflare Pages scheduled handler that wires the pure
// drip-cycle logic in functions/_lib/waitlist-drip/handler.ts to
// real Resend API calls. The cron schedule lives in wrangler.toml
// (`crons = ["0 14 * * *"]` — daily at 14:00 UTC). T104 already
// shipped the per-contact decision primitive `decideDripStage`;
// T097-T099 already shipped the email subject + bodies modules;
// THIS file is the deployment glue that fires the loop daily and
// commits results back to the Resend audience.
//
// DEPLOY DEPENDENCIES (T008 BLOCKED at the time of this writing):
//   1. Cloudflare Pages project bound to this repo (T008)
//   2. wrangler.toml [[triggers]] cron must be propagated by Pages
//      to the deployed Worker — Pages projects pick up cron triggers
//      via Advanced Mode + the wrangler.toml at the repo root
//   3. RESEND_API_KEY, RESEND_AUDIENCE_ID, WAITLIST_TOKEN_SECRET
//      already required by T091-T103; PUBLIC_SITE_URL is the only
//      new env this handler needs (the canonical origin for the
//      unsubscribe URL fed into each email)
//   4. The lap-coach.racing domain must remain verified in Resend
//      so the "from" address can send (already required by T094)
//
// Drip-stage state carrier: Resend's standard contacts API does
// NOT support arbitrary key-value custom fields per contact, so
// the per-contact drip_stage counter is encoded into the
// `first_name` field as `"drip:N"` (N in 0..3). It is the most
// portable carrier across the contacts API surface today; if/when
// Resend ships first-class custom-field support, swap the encoder/
// decoder + PATCH payload here without touching the pure handler.

import {
  runDripCycle,
  type ContactState,
} from '../_lib/waitlist-drip/handler';
import { buildUnsubscribeUrl } from '../_lib/waitlist-token';

interface DripEnv {
  RESEND_API_KEY: string;
  RESEND_AUDIENCE_ID: string;
  WAITLIST_TOKEN_SECRET: string;
  PUBLIC_SITE_URL: string;
}

interface ScheduledEvent {
  scheduledTime: number;
  cron: string;
}

interface ResendContact {
  id: string;
  email: string;
  created_at: string;
  unsubscribed: boolean;
  first_name: string | null;
}

interface ResendContactsResponse {
  data: ResendContact[];
}

const DRIP_STAGE_PREFIX = 'drip:';
const FROM_ADDRESS = 'LAP <noreply@lap-coach.racing>';

function parseDripStage(firstName: string | null | undefined): number {
  if (!firstName || !firstName.startsWith(DRIP_STAGE_PREFIX)) return 0;
  const n = Number.parseInt(firstName.slice(DRIP_STAGE_PREFIX.length), 10);
  return Number.isFinite(n) && n >= 0 && n <= 3 ? n : 0;
}

function encodeDripStage(stage: number): string {
  return `${DRIP_STAGE_PREFIX}${stage}`;
}

async function fetchAllContacts(env: DripEnv): Promise<ResendContact[]> {
  const url = `https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`Resend audience GET failed: ${response.status}`);
  }
  const data = (await response.json()) as ResendContactsResponse;
  return data.data;
}

export default {
  async scheduled(event: ScheduledEvent, env: DripEnv): Promise<void> {
    if (
      !env.RESEND_API_KEY ||
      !env.RESEND_AUDIENCE_ID ||
      !env.WAITLIST_TOKEN_SECRET ||
      !env.PUBLIC_SITE_URL
    ) {
      console.error('Drip cron skipped: missing required env vars');
      return;
    }

    const resendContacts = await fetchAllContacts(env);
    const contacts: ContactState[] = resendContacts.map((c) => ({
      email: c.email,
      confirmedAt: new Date(c.created_at),
      dripStage: parseDripStage(c.first_name),
      unsubscribed: c.unsubscribed,
    }));

    const summary = await runDripCycle({
      contacts,
      now: new Date(event.scheduledTime),
      sendEmail: async ({ to, subject, html, text }) => {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html, text }),
        });
        if (!r.ok) throw new Error(`Resend send failed: ${r.status}`);
      },
      updateContactStage: async ({ email, newStage }) => {
        const r = await fetch(
          `https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts/${encodeURIComponent(email)}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ first_name: encodeDripStage(newStage) }),
          },
        );
        if (!r.ok) throw new Error(`Resend audience PATCH failed: ${r.status}`);
      },
      getUnsubUrl: (email) =>
        buildUnsubscribeUrl(
          email,
          env.WAITLIST_TOKEN_SECRET,
          env.PUBLIC_SITE_URL,
        ),
    });

    console.log(
      `Drip cron summary: examined=${summary.examined} sent=${summary.sent} errors=${summary.errors.length}`,
    );
    for (const err of summary.errors) {
      console.error(`Drip error for ${err.email}: ${err.reason}`);
    }
  },
};

// Test-only exports — not consumed by the runtime; surfaced so the
// stage encoder/decoder round-trip stays under the unit-test gate.
export const __test = { parseDripStage, encodeDripStage };
