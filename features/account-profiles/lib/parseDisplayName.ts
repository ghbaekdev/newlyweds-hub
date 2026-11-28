const displayNameLimit = 40;
const controlCharacter = /\p{Cc}/u;

type DisplayNameResult = { ok: true; value: string | null } | { ok: false };

export function parseDisplayName(input: unknown): DisplayNameResult {
  if (typeof input !== 'string' || controlCharacter.test(input)) return { ok: false };

  const value = input.trim();
  if (Array.from(value).length > displayNameLimit) return { ok: false };

  return { ok: true, value: value || null };
}
