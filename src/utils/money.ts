/** Parse whole-rupee NPR amounts from user input (no decimals). */
export function parseNprAmount(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return parsed;
}
