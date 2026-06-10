export interface WordFrequency {
  word: string;
  count: number;
}

export function countFrequencies(words: string[]): WordFrequency[] {
  const counts = new Map<string, number>();

  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([word, count]) => ({
      word,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
