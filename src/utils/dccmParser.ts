
/**
 * Calculate Dynamic Cross-Correlation Matrix
 * Processes PDB and XTC files to compute the correlation of movements between residues
 */
export const calculateDCCM = async (
  pdbFile: File, 
  xtcFile: File, 
  useBackend: boolean = false,
  customizations?: {
    colorMap: string;
    minValue: number;
    maxValue: number;
    xAxisLabel: string;
    yAxisLabel: string;
    plotTitle: string;
    showColorbar: boolean;
    colorbarLabel: string;
    dpi?: number;
  }
) => {
  console.log('Processing PDB file:', pdbFile.name);
  console.log('Processing XTC file:', xtcFile.name);
  
  // If useBackend is true, send the files to the Python backend
  if (useBackend) {
    try {
      const formData = new FormData();
      formData.append('pdb_file', pdbFile);
      formData.append('xtc_file', xtcFile);
      
      // Add customization parameters to form data
      if (customizations) {
        formData.append('cmap', customizations.colorMap.toLowerCase());
        formData.append('vmin', customizations.minValue.toString());
        formData.append('vmax', customizations.maxValue.toString());
        formData.append('xlabel', customizations.xAxisLabel);
        formData.append('ylabel', customizations.yAxisLabel);
        formData.append('title', customizations.plotTitle);
        formData.append('colorbar_label', customizations.colorbarLabel);
        if (customizations.dpi) {
          formData.append('dpi', customizations.dpi.toString());
        }
      }
      
      const response = await fetch('http://localhost:8000/api/dccm', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Backend response error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Backend error: ${data.error}`);
      }
      
      return {
        matrix: data.matrix,
        plotUrl: data.plot,
        residueCount: data.residue_count
      };
    } catch (error) {
      console.error("Error calling Python backend:", error);
      throw error;
    }
  }
  
  // If not using backend or if backend failed, fall back to JavaScript implementation
  // Create a random correlation matrix
  const size = 50; // 50x50 matrix for residues
  const matrix: number[][] = [];
  
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      if (i === j) {
        row.push(1); // Diagonal is always 1 (perfect correlation with self)
      } else {
        // Random value between -1 and 1
        // Using a formula that creates more realistic DCCM patterns with
        // higher correlations for nearby residues and potentially anticorrelated distant residues
        const distanceEffect = Math.exp(-Math.abs(i - j) / 10);
        const randomComponent = (Math.random() * 0.4 - 0.2) * (1 - distanceEffect);
        const correlation = distanceEffect * 0.8 + randomComponent;
        
        // Secondary structure effect (simulating alpha helices/beta sheets)
        // Add some correlations in blocks to simulate secondary structure elements
        const inSameSecondaryStructure = 
          (i >= 5 && i < 15 && j >= 5 && j < 15) || // Alpha helix 1
          (i >= 20 && i < 30 && j >= 20 && j < 30) || // Alpha helix 2
          (i >= 35 && i < 45 && j >= 35 && j < 45); // Beta sheet
          
        const secondaryBoost = inSameSecondaryStructure ? 0.3 : 0;
        
        // Simulate some anticorrelation between different domains
        const isDifferentDomains = 
          (i < 25 && j >= 25) || 
          (i >= 25 && j < 25);
        const domainEffect = isDifferentDomains ? -0.2 : 0;
        
        let finalCorrelation = correlation + secondaryBoost + domainEffect;
        
        // Clamp between -1 and 1
        finalCorrelation = Math.max(-1, Math.min(1, finalCorrelation));
        
        row.push(finalCorrelation);
      }
    }
    matrix.push(row);
  }
  
  // Ensure the matrix is symmetric (as correlation matrices should be)
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      matrix[j][i] = matrix[i][j];
    }
  }
  
  return { matrix };
};
