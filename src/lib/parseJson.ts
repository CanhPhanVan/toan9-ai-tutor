// Extract and safely parse JSON from AI response that may contain LaTeX backslashes.
// Critically: \f and \b are valid JSON escapes (form-feed, backspace) but they're
// also the start of LaTeX commands \frac \forall \begin. In math content the JSON
// meaning is never intended, so we do NOT exclude them — we double their backslash.
// Only keep \\ \" \/ \n \r \t \uXXXX as valid JSON escapes.
export function parseAIJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON found in response')

  const original = match[0]

  // Try parsing as-is first — when the model is in strict JSON mode it already
  // escapes backslashes correctly, and re-escaping here would corrupt them.
  try {
    return JSON.parse(original)
  } catch {
    // Fall through to the backslash-fixing heuristic below for models that
    // emit raw LaTeX backslashes without proper JSON escaping.
  }

  let raw = original
  // Double any backslash NOT followed by a true JSON escape sequence character.
  // Excludes: \" \\ \/ \n \r \t \uXXXX — includes everything else (e.g. \f \b \s \D)
  raw = raw.replace(/\\(?!["\\/nrtu])/g, '\\\\')

  try {
    return JSON.parse(raw)
  } catch {
    // Second pass: also escape literal newlines/tabs that may still be unquoted
    raw = raw.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
    return JSON.parse(raw)
  }
}
