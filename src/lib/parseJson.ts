// Extract and safely parse JSON from AI response that may contain LaTeX backslashes.
//
// The core problem: LaTeX commands (\begin, \frac, \Rightarrow, \Delta...) use a
// single backslash, but in JSON a single backslash MUST start a recognized escape
// sequence. Two of the JSON escapes — \b (backspace) and \f (form-feed) — happen to
// collide with the start of \begin and \frac. If we naively call JSON.parse on text
// where the model wrote a literal single backslash before "begin", JSON.parse will
// NOT throw — it will silently consume "\b" as a backspace control character and
// leave "egin{cases}" behind, corrupting the content without any error to catch.
//
// So we can never trust a "successful" plain JSON.parse on raw model output — we
// must always normalize backslashes first. The normalizer below walks the string
// character by character (not with a regex) so it correctly handles runs of
// backslashes: a genuine escaped backslash (\\) is left untouched, while any lone
// backslash — including \b and \f — is doubled so it survives as a literal
// backslash after parsing.
function normalizeBackslashes(raw: string): string {
  const VALID_SINGLE_ESCAPES = '"\\/nrtu' // note: deliberately excludes b and f
  let out = ''
  let i = 0
  while (i < raw.length) {
    const ch = raw[i]
    if (ch === '\\') {
      const next = raw[i + 1]
      if (next === '\\') {
        // Genuine escaped backslash — keep both characters, consume 2.
        out += '\\\\'
        i += 2
        continue
      }
      if (next !== undefined && VALID_SINGLE_ESCAPES.includes(next)) {
        // A real JSON escape we want to keep (\" \/ \n \r \t \u...).
        out += '\\' + next
        i += 2
        continue
      }
      // Anything else — including \b, \f, or a LaTeX command like \Delta —
      // is not a JSON escape we want to honor. Double it so JSON.parse sees
      // a literal backslash instead of eating the next character.
      out += '\\\\'
      i += 1
      continue
    }
    out += ch
    i += 1
  }
  return out
}

export function parseAIJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON found in response')

  let raw = normalizeBackslashes(match[0])

  try {
    return JSON.parse(raw)
  } catch {
    // Second pass: also escape literal newlines/tabs that may still be unquoted
    raw = raw.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
    return JSON.parse(raw)
  }
}
