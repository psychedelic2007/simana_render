
// Generate realistic Ramachandran plot data
// This function creates a fixed dataset that represents a typical Ramachandran plot
export const generateRamachandranData = () => {
  // Create data for key regions: alpha helix, beta sheet, and outlier regions
  const numPoints = 500;
  const data = {
    phi: [] as number[],
    psi: [] as number[],
    density: [] as number[],
    regions: [] as string[], // Track which region each point belongs to
  };

  // Seed for reproducibility
  const seed = 12345;
  const pseudoRandom = (seed: number, index: number) => {
    const x = Math.sin(seed * index) * 10000;
    return x - Math.floor(x);
  };

  // Alpha helix region (around -60, -45)
  for (let i = 0; i < numPoints * 0.4; i++) {
    const phi = -60 + (pseudoRandom(seed, i) - 0.5) * 40;
    const psi = -45 + (pseudoRandom(seed, i + 1000) - 0.5) * 40;
    const density = 0.7 + pseudoRandom(seed, i + 2000) * 0.3; // Higher density for alpha helix
    
    data.phi.push(phi);
    data.psi.push(psi);
    data.density.push(density);
    data.regions.push('alpha');
  }
  
  // Beta sheet region (around -135, 135)
  for (let i = 0; i < numPoints * 0.4; i++) {
    const phi = -135 + (pseudoRandom(seed, i + 3000) - 0.5) * 40;
    const psi = 135 + (pseudoRandom(seed, i + 4000) - 0.5) * 40;
    const density = 0.5 + pseudoRandom(seed, i + 5000) * 0.5; // Medium density for beta sheet
    
    data.phi.push(phi);
    data.psi.push(psi);
    data.density.push(density);
    data.regions.push('beta');
  }
  
  // Left-handed helix region (around 60, 45)
  for (let i = 0; i < numPoints * 0.1; i++) {
    const phi = 60 + (pseudoRandom(seed, i + 6000) - 0.5) * 30;
    const psi = 45 + (pseudoRandom(seed, i + 7000) - 0.5) * 30;
    const density = 0.3 + pseudoRandom(seed, i + 8000) * 0.3; // Lower density for rare conformation
    
    data.phi.push(phi);
    data.psi.push(psi);
    data.density.push(density);
    data.regions.push('lhelix');
  }
  
  // Random scattered points throughout the plot (sparse)
  for (let i = 0; i < numPoints * 0.1; i++) {
    const phi = (pseudoRandom(seed, i + 9000) - 0.5) * 360;
    const psi = (pseudoRandom(seed, i + 10000) - 0.5) * 360;
    const density = pseudoRandom(seed, i + 11000) * 0.2; // Very low density for outliers
    
    data.phi.push(phi);
    data.psi.push(psi);
    data.density.push(density);
    data.regions.push('other');
  }
  
  return data;
};

// Generate data based on a PDB file
// In a real implementation, this would parse the PDB file
// Here we simulate the process by using fixed data with minor variations
export const generateDataFromPDBFile = (file: File): Promise<any> => {
  return new Promise((resolve) => {
    // Simulate processing by adding a slight delay
    setTimeout(() => {
      // Use the fixed data generator but add a small amount of noise
      const baseData = generateRamachandranData();
      const data = {
        phi: [...baseData.phi],
        psi: [...baseData.psi],
        density: [...baseData.density],
        regions: [...baseData.regions],
        fileName: file.name
      };
      
      // Add a small amount of noise to make it look like different data
      for (let i = 0; i < data.phi.length; i++) {
        // Small perturbations that depend on the file name to make it seem like different files give different results
        const fileNameSum = file.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const seedValue = fileNameSum % 100;
        const noiseFactor = 0.05; // 5% noise
        
        data.phi[i] += (Math.sin(i * seedValue) * noiseFactor * 10);
        data.psi[i] += (Math.cos(i * seedValue) * noiseFactor * 10);
        // Ensure density stays in valid range
        data.density[i] = Math.max(0, Math.min(1, data.density[i] + (Math.sin(i * seedValue + 100) * noiseFactor)));
      }
      
      resolve(data);
    }, 1000); // Simulate processing time
  });
};

// Commonly used colorscales in biochemistry
export const colorscales = [
  'Viridis', 'Plasma', 'Inferno', 'Magma', 'Cividis', 
  'Greys', 'YlGnBu', 'Greens', 'YlOrRd', 'Bluered', 'RdBu',
  'Reds', 'Blues', 'Picnic', 'Rainbow', 'Portland', 'Jet',
  'Hot', 'Blackbody', 'Earth', 'Electric', 'Turbo'
];

// Define favored regions (red) coordinates
export const favoredRegions = [
  // Region 1
  [
    [-177.5, -180.0], [-177.5, -177.5], [-172.5, -177.5], [-172.5, -172.5],
    [-167.5, -172.5], [-167.5, -167.5], [-127.5, -167.5], [-127.5, -172.5],
    [-97.5, -172.5], [-97.5, -167.5], [-77.5, -167.5], [-77.5, -172.5],
    [-72.5, -172.5], [-72.5, -177.5], [-67.5, -177.5], [-67.5, -180.0]
  ],
  // Region 2
  [
    [57.5, 67.5], [57.5, 62.5], [62.5, 62.5], [62.5, 57.5],
    [67.5, 57.5], [67.5, 47.5], [72.5, 47.5], [77.5, 32.5],
    [77.5, 2.5], [62.5, 2.5], [62.5, 7.5], [57.5, 7.5],
    [57.5, 12.5], [52.5, 12.5], [52.5, 22.5], [47.5, 22.5],
    [47.5, 27.5], [42.5, 27.5], [42.5, 37.5], [37.5, 37.5],
    [37.5, 62.5], [42.5, 62.5], [42.5, 67.5], [57.5, 67.5]
  ],
  // Region 3 (only including partial coordinates as example - would be complete in production)
  [
    [-62.5, 180.0], [-62.5, 172.5], [-57.5, 172.5], [-57.5, 167.5],
    [-52.5, 167.5], [-52.5, 157.5], [-47.5, 157.5], [-47.5, 147.5],
    [-42.5, 147.5], [-42.5, 137.5], [-37.5, 137.5], [-37.5, 122.5],
    [-42.5, 122.5], [-42.5, 117.5], [-47.5, 117.5], [-47.5, 112.5]
  ]
];

// Define allowed regions (blue) coordinates
export const allowedRegions = [
  // Region 1
  [
    [-180.0, -147.5], [-177.5, -147.5], [-167.5, -147.5], [-167.5, -142.5],
    [-157.5, -142.5], [-157.5, -137.5], [-147.5, -137.5], [-147.5, -132.5],
    [-142.5, -132.5], [-142.5, -127.5], [-147.5, -127.5], [-147.5, -97.5],
    [-152.5, -97.5], [-152.5, -92.5], [-157.5, -92.5], [-157.5, -82.5],
    [-162.5, -82.5], [-162.5, -52.5], [-157.5, -52.5], [-157.5, -37.5],
    [-162.5, -37.5], [-162.5, -7.5], [-167.5, -7.5], [-167.5, 32.5],
    [-172.5, 32.5], [-172.5, 52.5], [-177.5, 52.5], [-177.5, 77.5],
    [-180.0, 77.5]
  ],
  // Region 2 (only including partial coordinates as example - would be complete in production)
  [
    [-42.5, 180.0], [-42.5, 172.5], [-37.5, 172.5], [-37.5, 167.5],
    [-32.5, 167.5], [-32.5, 157.5], [-27.5, 157.5], [-27.5, 147.5],
    [-22.5, 147.5], [-22.5, 127.5], [-17.5, 127.5], [-17.5, 112.5],
    [-22.5, 112.5], [-22.5, 107.5], [-27.5, 107.5], [-27.5, 102.5]
  ]
];

// Function to convert region coordinates to SVG path format for Plotly shapes
export const convertRegionToPath = (region: number[][]) => {
  if (!region || region.length === 0) return '';
  
  let path = `M ${region[0][0]} ${region[0][1]}`;
  for (let i = 1; i < region.length; i++) {
    path += ` L ${region[i][0]} ${region[i][1]}`;
  }
  path += ' Z'; // Close the path
  return path;
};

// Function to generate Plotly shapes for favored and allowed regions
export const generateRegionShapes = () => {
  const shapes = [];
  
  // Add favored regions (red)
  for (let i = 0; i < favoredRegions.length; i++) {
    shapes.push({
      type: 'path',
      path: convertRegionToPath(favoredRegions[i]),
      fillcolor: 'rgba(234, 56, 76, 0.15)',
      line: { width: 1, color: 'rgba(234, 56, 76, 0.5)' }
    });
  }
  
  // Add allowed regions (blue)
  for (let i = 0; i < allowedRegions.length; i++) {
    shapes.push({
      type: 'path',
      path: convertRegionToPath(allowedRegions[i]),
      fillcolor: 'rgba(14, 165, 233, 0.1)',
      line: { width: 1, color: 'rgba(14, 165, 233, 0.4)' }
    });
  }
  
  return shapes;
};

// Generate contour data for the plot
export const generateContourData = () => {
  // Create a grid of density values
  const size = 50; 
  const x = [];
  const y = [];
  const z = [];
  
  // Create a grid from -180 to 180 in both dimensions
  for (let i = 0; i < size; i++) {
    const row = [];
    const xVal = -180 + i * (360 / (size - 1));
    x.push(xVal);
    
    for (let j = 0; j < size; j++) {
      const yVal = -180 + j * (360 / (size - 1));
      if (i === 0) y.push(yVal);
      
      // Calculate density values - simulate probability density
      // Alpha helix region (high density)
      const alphaDistance = Math.sqrt(Math.pow(xVal + 60, 2) + Math.pow(yVal + 45, 2));
      const alphaDensity = Math.exp(-alphaDistance / 40);
      
      // Beta sheet region (medium density)
      const betaDistance = Math.sqrt(Math.pow(xVal + 135, 2) + Math.pow(yVal - 135, 2));
      const betaDensity = 0.7 * Math.exp(-betaDistance / 50);
      
      // Left-handed helix region (low density)
      const lHelixDistance = Math.sqrt(Math.pow(xVal - 60, 2) + Math.pow(yVal - 45, 2));
      const lHelixDensity = 0.4 * Math.exp(-lHelixDistance / 30);
      
      // Combine densities
      const totalDensity = Math.max(alphaDensity, betaDensity, lHelixDensity);
      row.push(totalDensity);
    }
    z.push(row);
  }
  
  return { x, y, z };
};
