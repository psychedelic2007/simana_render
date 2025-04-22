import axios from 'axios';

interface DCCMPlotCustomizations {
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

interface DCCMResult {
  matrix: number[][];
  plot: string;
  residue_count: number;
  error?: string;
}

// Environment-based API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const calculateDCCM = async (
  pdbFile: File, 
  xtcFile: File, 
  useBackend: boolean = false,
  customizations: DCCMPlotCustomizations = {
    colorMap: 'coolwarm',
    minValue: -1,
    maxValue: 1,
    xAxisLabel: 'Residue Index',
    yAxisLabel: 'Residue Index',
    plotTitle: 'Dynamic Cross-Correlation Matrix',
    showColorbar: true,
    colorbarLabel: 'Correlation'
  },
  dpi: number = 300
): Promise<DCCMResult> => {
  console.log('Processing PDB file:', pdbFile.name);
  console.log('Processing XTC file:', xtcFile.name);
  
  if (useBackend) {
    const formData = new FormData();
    formData.append('pdb_file', pdbFile);
    formData.append('xtc_file', xtcFile);
    
    // Add customization parameters to form data
    formData.append('cmap', customizations.colorMap.toLowerCase());
    formData.append('vmin', customizations.minValue.toString());
    formData.append('vmax', customizations.maxValue.toString());
    formData.append('xlabel', customizations.xAxisLabel);
    formData.append('ylabel', customizations.yAxisLabel);
    formData.append('title', customizations.plotTitle);
    formData.append('colorbar_label', customizations.colorbarLabel);
    formData.append('show_colorbar', customizations.showColorbar ? '1' : '0');
    formData.append('dpi', (customizations.dpi || dpi).toString());
    
    try {
      const response = await axios.post<DCCMResult>(
        `${API_BASE_URL}/dccm`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('API Error:', error.response.data);
        return {
          matrix: [],
          plot: '',
          residue_count: 0,
          error: error.response.data.detail || 'An error occurred while processing the request',
        };
      }
      console.error('Request Error:', error);
      return {
        matrix: [],
        plot: '',
        residue_count: 0,
        error: 'An error occurred while connecting to the server',
      };
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
  
  // Return mock data structure that matches API response
  return { 
    matrix: matrix,
    plot: '',
    residue_count: size
  };
};

export const downloadCSV = (matrix: number[][]) => {
  if (!matrix || matrix.length === 0) {
    console.error('No matrix data to download');
    return;
  }
  
  // Create header row with residue numbers
  const headers = ['Residue', ...Array.from({ length: matrix.length }, (_, i) => (i + 1).toString())];
  
  // Create CSV rows
  const csvRows = [];
  csvRows.push(headers.join(','));
  
  for (let i = 0; i < matrix.length; i++) {
    const rowData = [i + 1, ...matrix[i]];
    csvRows.push(rowData.join(','));
  }
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'dccm_analysis.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
