# Zipfy

<p align="center">
  <img src="assets/zipfy-homepage.png" width="800" alt="Zipfy Screenshot">
</p>

Zipfy is a simple web app that explores one of the most surprising patterns in language and data: **Zipf's Law**.

Paste text or upload a CSV file, and Zipfy will analyze how closely the frequency distribution follows an ideal Zipf curve. It then generates a **Zipfy Score**, summary statistics, and interactive visualizations to help you understand the structure of your data.

## What is Zipf's Law?

Zipf's Law describes a pattern commonly found in natural language, where the most frequent word appears roughly twice as often as the second most frequent word, three times as often as the third most frequent word, and so on.

This pattern appears not only in books and articles, but also in many real-world datasets such as:

* Product sales
* Website traffic
* City populations
* Search terms
* Social media activity

## Features

### Text Analysis

Paste any text and instantly see:

* Total and unique word counts
* Vocabulary statistics
* Most common words
* Zipf slope and R² measurements
* Zipfy Score

### CSV Analysis

Upload a CSV file and select a column to analyze.

Examples:

* Product categories
* Error codes
* Customer regions
* Sales representatives
* Any repeated categorical data

### Interactive Visualizations

* Standard frequency-rank plot
* Log-log Zipf plot
* Actual vs expected Zipf distributions
* Hover tooltips and frequency inspection

## Zipfy Score

The Zipfy Score is a heuristic score from 0–100 that estimates how closely a distribution matches an ideal Zipf pattern.

The score is based on:

* Curve fit (R²)
* Similarity to the expected Zipf slope

Higher scores indicate a stronger Zipf-like distribution.

## Running Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Built With

* React
* TypeScript
* Vite
* Recharts
* PapaParse

## Why?

Zipfy started as a weekend project to explore whether text and datasets could be compared using the same underlying statistical patterns.

It turns out many systems are more "Zipfy" than you might expect.
