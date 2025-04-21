// Utility logic separated from the main page

export function generateRandomHbondData(length: number, mean: number) {
    const data = [];
    for (let i = 0; i < length; i++) {
      const val =
        mean +
        Math.round(Math.random() * 4) -
        2 +
        Math.round(Math.sin(i / 15) * 2);
      data.push([i * 0.2, Math.max(0, val)]);
    }
    return data;
  }
  
  export function calculateDistribution(values: number[]) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(20, max - min + 1 || 10);
    const bins = Array(binCount).fill(0);
    const binEdges = Array(binCount)
      .fill(0)
      .map((_, i) => Math.floor(min + i));
    values.forEach((value) => {
      const idx = Math.min(Math.floor(value - min), binCount - 1);
      bins[idx]++;
    });
    return { x: binEdges, y: bins };
  }