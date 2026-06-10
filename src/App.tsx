import { useMemo, useState } from "react";
import { tokenize } from "./lib/tokenize";
import { countFrequencies } from "./lib/frequency";
import { buildZipfData } from "./lib/zipf";
import { ZipfChart } from "./components/ZipfChart";
import { calculateZipfStats } from "./lib/zipfStats";
import { StatCard } from "./components/StatCard";
import { countCsvColumnValues, parseCsvFile } from "./lib/csv";
import type { CsvRow } from "./lib/csv";

function App() {
  const [text, setText] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "csv">("text");

  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [csvError, setCsvError] = useState("");

  const words = useMemo(() => {
    return inputMode === "text" ? tokenize(text) : [];
  }, [inputMode, text]);

  const frequencies = useMemo(() => {
    if (inputMode === "text") {
      return countFrequencies(words);
    }

    if (selectedColumn) {
      return countCsvColumnValues(csvRows, selectedColumn);
    }

    return [];
  }, [inputMode, words, csvRows, selectedColumn]);

  const zipfData = useMemo(() => {
    return buildZipfData(frequencies);
  }, [frequencies]);

  const zipfStats = useMemo(() => {
    return calculateZipfStats(frequencies);
  }, [frequencies]);

  const totalItems =
    inputMode === "text"
      ? words.length
      : frequencies.reduce((sum, item) => sum + item.count, 0);

  const uniqueItems = frequencies.length;
  const vocabularyRatio = totalItems > 0 ? uniqueItems / totalItems : 0;
  const mostCommonItem = frequencies[0]?.word ?? "—";

  const itemLabel = inputMode === "text" ? "Words" : "Values";
  const itemLabelSingular = inputMode === "text" ? "Word" : "Value";

  const statCards = [
    {
      label: `Total ${itemLabel}`,
      value: totalItems,
      tooltip:
        inputMode === "text"
          ? "The total number of words found in the text."
          : "The total number of non-empty values found in the selected CSV column.",
    },
    {
      label: `Unique ${itemLabel}`,
      value: uniqueItems,
      tooltip:
        inputMode === "text"
          ? "The number of distinct words in the text."
          : "The number of distinct values in the selected CSV column.",
    },
    {
      label: "Vocabulary Ratio",
      value: `${(vocabularyRatio * 100).toFixed(1)}%`,
      tooltip:
        inputMode === "text"
          ? "Unique words divided by total words. Higher values indicate more varied vocabulary."
          : "Unique values divided by total values. Higher values indicate a more varied dataset column.",
    },
    {
      label: `Most Common ${itemLabelSingular}`,
      value: mostCommonItem,
      tooltip:
        inputMode === "text"
          ? "The single word that appears most frequently in the text."
          : "The single value that appears most frequently in the selected CSV column.",
    },
    {
      label: `Once-Only ${itemLabel}`,
      value: zipfStats.hapaxCount,
      tooltip:
        inputMode === "text"
          ? "Words that appear exactly once. Linguists call these hapax legomena."
          : "Values that appear exactly once in the selected CSV column.",
    },
    {
      label: `Top ${itemLabelSingular} Share`,
      value: `${(zipfStats.topWordShare * 100).toFixed(1)}%`,
      tooltip:
        inputMode === "text"
          ? "The percentage of all words represented by the most common word."
          : "The percentage of all values represented by the most common value.",
    },
    {
      label: "Zipf Slope",
      value:
        zipfStats.zipfSlope === null ? "—" : zipfStats.zipfSlope.toFixed(2),
      tooltip:
        "The slope of the rank-frequency distribution. Natural language and many Zipf-like systems are often near -1.",
    },
    {
      label: "R²",
      value: zipfStats.zipfR2 === null ? "—" : zipfStats.zipfR2.toFixed(3),
      tooltip:
        "Measures how closely the distribution follows a straight line on a log-log plot.",
    },
  ];

  const zipfyVerdict =
    zipfStats.zipfyScore === null
      ? inputMode === "text"
        ? "Paste some text to calculate a score"
        : "Upload a CSV and choose a column to calculate a score"
      : zipfStats.zipfyScore >= 90
        ? "Excellent Zipf fit"
        : zipfStats.zipfyScore >= 75
          ? "Strong Zipf fit"
          : zipfStats.zipfyScore >= 50
            ? "Moderate Zipf fit"
            : "Weak Zipf fit";

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-brand">
          <img src="/zipfy-logo-mark.svg" alt="Zipfy" className="app-logo" />
          <h1>Zipfy</h1>
        </div>

        <p className="hero-description">
          <a
            href="https://en.wikipedia.org/wiki/Zipf%27s_law"
            target="_blank"
            rel="noreferrer"
          >
            Zipf&apos;s law
          </a>{" "}
          describes a surprisingly common pattern found in natural language. In
          English and many other languages, the most common word tends to appear
          about twice as often as the second most common word, three times as
          often as the third, and so on. When word frequencies are ranked and
          plotted, they form a characteristic curve that appears across books,
          articles, speeches, and many other natural and human-created systems.
          <br />
          <br />
          Zipfy is named after{" "}
          <a
            href="https://en.wikipedia.org/wiki/George_Kingsley_Zipf"
            target="_blank"
            rel="noreferrer"
          >
            George Kingsley Zipf
          </a>
          , who popularized this observation. Paste any text or dataset below to
          compare its frequency distribution to an ideal Zipf curve and see how
          &quot;Zipfy&quot; it is.
        </p>
      </header>

      <div className="input-mode-toggle">
        <button
          type="button"
          onClick={() => setInputMode("text")}
          className={inputMode === "text" ? "active" : ""}
        >
          Text Analysis
        </button>

        <button
          type="button"
          onClick={() => setInputMode("csv")}
          className={inputMode === "csv" ? "active" : ""}
        >
          CSV Analysis
        </button>
      </div>

      {inputMode === "text" ? (
        <textarea
          className="text-input"
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text here. Large inputs may take longer to process."
        />
      ) : (
        <section className="csv-input-panel">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              setCsvError("");

              parseCsvFile(
                file,
                (rows, columns) => {
                  setCsvRows(rows);
                  setCsvColumns(columns);
                  setSelectedColumn(columns[0] ?? "");
                },
                setCsvError,
              );
            }}
          />

          {csvRows.length > 0 && (
            <div className="csv-summary">
              <span>📄 {csvRows.length.toLocaleString()} rows</span>
              <span>🧱 {csvColumns.length} columns</span>
              <span>🔍 {selectedColumn}</span>
            </div>
          )}

          {csvColumns.length > 0 && (
            <label>
              Analyze column
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                {csvColumns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </label>
          )}

          {csvError && <p className="error-text">{csvError}</p>}
        </section>
      )}

      <section className="score-card">
        <div className="score-summary">
          <h2>
            Zipfy Score
            <span className="stat-tooltip">
              ?
              <span className="stat-tooltip-content">
                The Zipfy Score measures how closely this frequency distribution
                matches an ideal Zipf-like pattern.
                <br />
                <br />
                • Curve Fit: How closely the observed distribution follows a
                straight line on a log-log plot.
                <br />
                • Slope Match: Whether the distribution falls off at roughly the
                expected Zipf rate, where the slope is near -1.
                <br />
                <br />
                Scores near 100 indicate a strong Zipf-like distribution, while
                lower scores suggest unusually repetitive data, highly uniform
                data, random sequences, or other patterns that differ from
                classic Zipf behavior.
                <br />
                <br />
                The score is a heuristic designed for comparison and exploration
                rather than a formal linguistic measurement.
              </span>
            </span>
          </h2>
        </div>

        <strong className="score-value">
          {zipfStats.zipfyScore === null ? "—" : zipfStats.zipfyScore}
          {zipfStats.zipfyScore !== null && <span>/100</span>}
        </strong>

        <p>{zipfyVerdict}</p>

        {zipfStats.scoreBreakdown && (
          <div className="score-breakdown">
            <div>
              <span>Curve Fit</span>
              <strong>{zipfStats.scoreBreakdown.curveFit}/70</strong>
            </div>

            <div>
              <span>Slope Match</span>
              <strong>{zipfStats.scoreBreakdown.slopeMatch}/30</strong>
            </div>
          </div>
        )}
      </section>

      <section className="chart-section">
        <p className="chart-note"></p>
        <ZipfChart data={zipfData} />
      </section>

      <div className="results-grid">
        <section className="stats-section">
          <h2>Frequency Statistics</h2>

          <div className="stats-grid">
            {statCards.map((stat) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                tooltip={stat.tooltip}
              />
            ))}
          </div>
        </section>

        <section className="top-words-section">
          <h2>{inputMode === "text" ? "Top 10 Words" : "Top 10 Values"}</h2>

          <table className="top-words-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>{inputMode === "text" ? "Word" : "Value"}</th>
                <th>Count</th>
              </tr>
            </thead>

            <tbody>
              {frequencies.slice(0, 10).map((item, index) => (
                <tr key={item.word}>
                  <td>{index + 1}</td>
                  <td>{item.word}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

export default App;