// Extract and safely parse JSON from AI response that may contain LaTeX backslashes
export function parseAIJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON found in response')

  let raw = match[0]

  // Fix lone backslashes in LaTeX (e.g. \sqrt \frac \Delta) that break JSON
  // Replace \ not followed by valid JSON escape chars with \\
  raw = raw.replace(/\\(?!["\\/bfnrtu])/g, '\\\\')

  return JSON.parse(raw)
}
