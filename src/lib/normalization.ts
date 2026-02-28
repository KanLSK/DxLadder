export function normalizeGuess(guess: string): string {
  if (!guess) return '';
  return guess
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
    .replace(/\s{2,}/g, ' '); // Replace multiple spaces with a single space
}

export function checkAlternativeSpellings(normalizedGuess: string, expectedNormalized: string, aliases: string[]): boolean {
  if (normalizedGuess === expectedNormalized) return true;
  
  const normalizedAliases = aliases.map(normalizeGuess);
  return normalizedAliases.includes(normalizedGuess);
}
