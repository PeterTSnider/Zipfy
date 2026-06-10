import type { WordFrequency } from "./frequency";

export type ZipfyScoreBreakdown = {
  curveFit: number;
  slopeMatch: number;
};

export type ZipfStats = {
  hapaxCount: number;
  hapaxRatio: number;
  topWordShare: number;
  zipfSlope: number | null;
  zipfR2: number | null;
  zipfyScore: number | null;
  scoreBreakdown: ZipfyScoreBreakdown | null;
};

export function calculateZipfStats(frequencies: WordFrequency[]): ZipfStats {
  const totalWords = frequencies.reduce((sum, item) => sum + item.count, 0);
  const uniqueWords = frequencies.length;

  const hapaxCount = frequencies.filter((item) => item.count === 1).length;
  const hapaxRatio = uniqueWords > 0 ? hapaxCount / uniqueWords : 0;

  const topWordShare =
    totalWords > 0 && frequencies.length > 0
      ? frequencies[0].count / totalWords
      : 0;

  const regression = calculateLogLogRegression(
    frequencies.filter((item) => item.count > 1).slice(0, 50),
  );

  const scoreResult = regression
    ? calculateZipfyScore(regression.slope, regression.r2)
    : null;

  return {
    hapaxCount,
    hapaxRatio,
    topWordShare,
    zipfSlope: regression?.slope ?? null,
    zipfR2: regression?.r2 ?? null,
    zipfyScore: scoreResult?.score ?? null,
    scoreBreakdown: scoreResult?.breakdown ?? null,
  };
}

function calculateLogLogRegression(frequencies: WordFrequency[]) {
  if (frequencies.length < 2) return null;

  const points = frequencies.map((item, index) => ({
    x: Math.log10(index + 1),
    y: Math.log10(item.count),
  }));

  const n = points.length;

  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;

  const ssTotal = points.reduce((sum, p) => {
    return sum + Math.pow(p.y - meanY, 2);
  }, 0);

  const ssResidual = points.reduce((sum, p) => {
    const predictedY = slope * p.x + intercept;
    return sum + Math.pow(p.y - predictedY, 2);
  }, 0);

  const r2 = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

  return { slope, intercept, r2 };
}

function calculateZipfyScore(
  slope: number,
  r2: number,
): {
  score: number;
  breakdown: ZipfyScoreBreakdown;
} {
  const curveFit = Math.round(Math.max(0, Math.min(1, r2)) * 70);

  const slopeDistance = Math.abs(slope + 1);
  const slopeMatch = Math.round(Math.max(0, 1 - slopeDistance / 1) * 30);

  const score = curveFit + slopeMatch;

  return {
    score: Math.max(0, Math.min(100, score)),
    breakdown: {
      curveFit,
      slopeMatch,
    },
  };
}