const MODEL = 'claude-sonnet-4-6';
const API_URL = 'https://api.anthropic.com/v1/messages';

export async function callClaude(args: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: args.maxTokens ?? 1500,
      // Zero temperature. The same question should give the same answer every
      // time the demo is run, otherwise the Loom is a coin flip.
      temperature: 0,
      system: args.system,
      messages: [{ role: 'user', content: args.user }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Anthropic API ${res.status}: ${detail.slice(0, 400)}`);
  }

  const data = await res.json();
  return (data.content ?? [])
    .filter((block: { type: string }) => block.type === 'text')
    .map((block: { text: string }) => block.text)
    .join('\n')
    .trim();
}

/**
 * Claude will occasionally wrap JSON in triple backticks despite being told not
 * to, or prepend a sentence. Strip both, then parse. Callers handle null rather
 * than letting a parse error take the page down mid-demo.
 */
export function parseJsonLoose<T>(text: string): T | null {
  let cleaned = text.trim();

  // Strip a fenced block, with or without a language tag.
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) cleaned = fence[1].trim();

  // Drop anything before the first brace or bracket and after the last.
  const firstBrace = cleaned.search(/[[{]/);
  if (firstBrace > 0) cleaned = cleaned.slice(firstBrace);
  const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (lastBrace !== -1 && lastBrace < cleaned.length - 1) {
    cleaned = cleaned.slice(0, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
