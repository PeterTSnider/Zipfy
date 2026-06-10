import type { WordFrequency } from "./frequency";

export interface ZipfPoint {
  rank: number;
  actual: number;
  expected: number;
}

export function buildZipfData(frequencies: WordFrequency[]): ZipfPoint[] {
  if (frequencies.length === 0) {
    return [];
  }

  const highestFrequency = frequencies[0].count;

  return frequencies.map((item, index) => ({
    rank: index + 1,
    actual: item.count,
    expected: highestFrequency / (index + 1),
  }));
}
