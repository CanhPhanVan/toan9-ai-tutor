// Lightweight duplicate detection for AI-generated math content.
// No external deps: normalize text, strip LaTeX math (numbers vary but the
// problem template repeats), then compare via Sorensen-Dice bigram overlap.

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip Vietnamese diacritics
    .replace(/\$[^$]*\$/g, ' ') // strip inline LaTeX — keep prose template, drop specific numbers
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function bigrams(s: string): Set<string> {
  const set = new Set<string>()
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2))
  return set
}

/** Sorensen-Dice coefficient over character bigrams. 0 = unrelated, 1 = identical. */
export function diceSimilarity(a: string, b: string): number {
  const na = normalizeText(a)
  const nb = normalizeText(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  const ba = bigrams(na)
  const bb = bigrams(nb)
  if (ba.size === 0 || bb.size === 0) return 0
  let overlap = 0
  for (const g of ba) if (bb.has(g)) overlap++
  return (2 * overlap) / (ba.size + bb.size)
}

export const DEFAULT_DUPLICATE_THRESHOLD = 0.62

/** Returns the index of the first entry in `pool` that's a near-duplicate of `text`, or -1. */
export function findDuplicateIndex(text: string, pool: string[], threshold = DEFAULT_DUPLICATE_THRESHOLD): number {
  for (let i = 0; i < pool.length; i++) {
    if (diceSimilarity(text, pool[i]) >= threshold) return i
  }
  return -1
}
