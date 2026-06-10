import Papa from "papaparse";

export type CsvRow = Record<string, string>;

export function parseCsvFile(
  file: File,
  onComplete: (rows: CsvRow[], columns: string[]) => void,
  onError?: (message: string) => void,
) {
  Papa.parse<CsvRow>(file, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      const rows = result.data;
      const columns = result.meta.fields ?? [];

      if (columns.length === 0) {
        onError?.("No columns found in this CSV.");
        return;
      }

      onComplete(rows, columns);
    },
    error: (error) => {
      onError?.(error.message);
    },
  });
}

export function countCsvColumnValues(rows: CsvRow[], column: string) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const rawValue = row[column];

    if (!rawValue) continue;

    const value = rawValue.trim().toLowerCase();

    if (!value) continue;

    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
}
