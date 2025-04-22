const API_URL = import.meta.env.VITE_API_URL;

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
        formData.append('show_colorbar', customizations.showColorbar ? '1' : '0');
        
        if (customizations.dpi) {
          formData.append('dpi', customizations.dpi.toString());
        }
      }
      
      const response = await fetch(`${API_URL}/dccm`, {
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

  // Fallback mock DCCM (local simulation)
  const size = 50;
  const matrix: number[][] = [];

  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      if (i === j) {
        row.push(1);
      } else {
        const distanceEffect = Math.exp(-Math.abs(i - j) / 10);
        const randomComponent = (Math.random() * 0.4 - 0.2) * (1 - distanceEffect);
        const correlation = distanceEffect * 0.8 + randomComponent;

        const inSameSecondaryStructure =
          (i >= 5 && i < 15 && j >= 5 && j < 15) ||
          (i >= 20 && i < 30 && j >= 20 && j < 30) ||
          (i >= 35 && i < 45 && j >= 35 && j < 45);

        const secondaryBoost = inSameSecondaryStructure ? 0.3 : 0;

        const isDifferentDomains = 
          (i < 25 && j >= 25) || 
          (i >= 25 && j < 25);
        const domainEffect = isDifferentDomains ? -0.2 : 0;

        let finalCorrelation = correlation + secondaryBoost + domainEffect;
        finalCorrelation = Math.max(-1, Math.min(1, finalCorrelation));

        row.push(finalCorrelation);
      }
    }
    matrix.push(row);
  }

  // Make symmetric
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      matrix[j][i] = matrix[i][j];
    }
  }

  return { matrix };
};
