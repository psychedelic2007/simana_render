
/**
 * Parse XVG file content and extract x and y values
 */
export const parseXVGContent = (content: string) => {
  const lines = content.split('\n');
  const x: number[] = [];
  const y: number[] = [];
  
  for (const line of lines) {
    if (line.startsWith('@') || line.startsWith('#') || line.trim() === '') continue;
    const values = line.trim().split(/\s+/).map(Number);
    if (values.length >= 2 && !isNaN(values[0]) && !isNaN(values[1])) {
      x.push(values[0]);
      y.push(values[1]);
    }
  }
  
  return { x, y };
};

/**
 * Calculate a distribution (histogram) from a set of values
 */
export const calculateDistribution = (values: number[]) => {
  if (values.length === 0) {
    return { x: [], y: [] };
  }
  
  // Find min and max values
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  // Use a reasonable bin count based on data size
  const binCount = Math.min(20, Math.ceil(Math.sqrt(values.length)));
  // Ensure we don't divide by zero
  const binSize = range > 0 ? range / binCount : 1;
  const bins = Array(binCount).fill(0);
  const binCenters = Array(binCount).fill(0).map((_, i) => min + (i + 0.5) * binSize);
  
  // Fill bins
  values.forEach(value => {
    // Handle the case where all values are the same
    if (range === 0) {
      bins[0]++;
      return;
    }
    
    const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
    if (binIndex >= 0) {
      bins[binIndex]++;
    }
  });
  
  return {
    x: binCenters,
    y: bins
  };
};

/**
 * Convert hex color to rgba string with opacity
 */
export const hexToRgba = (hex: string, alpha: number = 1) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Return rgba string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Convert alpha value to hex opacity suffix
 * For Plotly fill colors, we need to convert alpha (0-1) to hex (00-FF)
 */
export const alphaToHex = (alpha: number) => {
  // Ensure alpha is between 0 and 1
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  // Convert to hex value between 00 and FF
  return Math.round(clampedAlpha * 255).toString(16).padStart(2, '0');
};
