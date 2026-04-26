// T193 — authors registry. Single source for author
// metadata used by AuthorCard.astro and any future
// author-attributed surface (RSS author tag at T196,
// per-author page at a hypothetical future task).
//
// Default authorship for the cluster is the Organization
// "LAP" — matches the schema.org Article JSON-LD already
// emitted on every publish page (T179/T189). Person-typed
// entries are supported in the schema for future
// individual-author attribution if the editorial pattern
// changes.

export type AuthorType = 'Organization' | 'Person';

export interface Author {
  /** Stable id; lookup key in the registry. */
  readonly id: string;
  /** schema.org @type. */
  readonly type: AuthorType;
  /** Display name. */
  readonly name: string;
  /** One-line tagline / role. */
  readonly role: string;
  /** Bio paragraph (≥40 chars; rendered in the card). */
  readonly bio: string;
  /** Canonical URL for the author entity. */
  readonly url?: string;
}

const lap: Author = {
  id: 'lap',
  type: 'Organization',
  name: 'LAP',
  role: 'Driver-facing coaching surface for sim and real-world racing',
  bio: 'LAP is a cross-platform Driver OS for the driver alone with the data between sessions. Every coaching prescription traces to a hand-curated rule library written by human authors. The same prescription anatomy runs across sim and real-world surfaces.',
  url: 'https://lap-coach.racing/',
};

export const AUTHORS: Readonly<Record<string, Author>> = {
  lap,
};

/**
 * Look up an author by id. Throws if the id is unknown so
 * a typo at the call site fails loudly rather than silently
 * rendering a missing card.
 */
export const getAuthor = (id: string): Author => {
  const author = AUTHORS[id];
  if (!author) {
    throw new Error(
      `Unknown author id "${id}". Add the author to src/data/authors.ts before referencing it.`,
    );
  }
  return author;
};
