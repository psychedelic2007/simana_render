export const generateRamachandranData = async (
  pdbFile: File,
  customizations?: {
    title?: string;
    xLabel?: string;
    yLabel?: string;
    fontSize?: number;
    dpi?: number;
    cmap?: string;
    alpha?: number;
  }
) => {
  try {

    const formData = new FormData();
    
    // Always append the required pdb_file
    formData.append('pdb_file', pdbFile);
    
    // Add customizations with proper parameter names matching FastAPI endpoint
    if (customizations) {
      if (customizations.title) formData.append('title', customizations.title);
      if (customizations.xLabel) formData.append('xlabel', customizations.xLabel);
      if (customizations.yLabel) formData.append('ylabel', customizations.yLabel);
      if (customizations.fontSize) formData.append('fontsize', customizations.fontSize.toString());
      if (customizations.dpi) formData.append('dpi', customizations.dpi.toString());
      if (customizations.cmap) formData.append('cmap', customizations.cmap);
      if (customizations.alpha) formData.append('alpha', customizations.alpha.toString());
    }
    
    console.log('Sending FormData with entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    const response = await fetch('http://localhost:8000/api/ramachandran/', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      // Get more detailed error information
      let errorMessage = `Backend response error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // FastAPI validation errors are often arrays
            const validationErrors = errorData.detail.map((err: any) => 
              `${err.loc?.join('.')}: ${err.msg}`
            ).join(', ');
            errorMessage += ` - Validation errors: ${validationErrors}`;
          } else {
            errorMessage += ` - ${errorData.detail}`;
          }
        }
      } catch (jsonError) {
        // If we can't parse the error response, just use the status
        const textError = await response.text();
        errorMessage += ` - ${textError}`;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Backend error: ${data.error}`);
    }
    
    return {
      plotUrl: data.plot,
      residueData: data.residue_data || [],
      statistics: data.statistics || {}
    };
  } catch (error) {
    console.error("Error calling Python backend:", error);
    throw error;
  }
};

// Define colorscales for UI consistency
export const colorscales = [
  'viridis',
  'plasma',
  'inferno',
  'magma',
  'cividis',
  'turbo',
  'Blues',
  'Greens',
  'Reds',
  'Purples',
  'YlOrRd',
  'YlOrBr',
  'YlGnBu',
  'PuRd',
  'RdPu'
];

// This function is no longer needed but added as a placeholder to fix imports
export const generateDataFromPDBFile = async (file: File) => {
  // Since we're using the Python backend, this is just a wrapper
  return generateRamachandranData(file);
};

// Define regions for Ramachandran plot visualization
export const generateRegionShapes = () => {
  return [
    // Alpha helix region (approximate)
    {
      type: 'rect',
      xref: 'x',
      yref: 'y',
      x0: -100,
      y0: -70,
      x1: -30,
      y1: 0,
      line: {
        width: 1,
        color: 'rgba(234, 56, 76, 0.3)'
      },
      fillcolor: 'rgba(234, 56, 76, 0.1)'
    },
    // Beta sheet region (approximate)
    {
      type: 'rect',
      xref: 'x',
      yref: 'y',
      x0: -170,
      y0: 100,
      x1: -100,
      y1: 170,
      line: {
        width: 1,
        color: 'rgba(14, 165, 233, 0.3)'
      },
      fillcolor: 'rgba(14, 165, 233, 0.1)'
    }
  ];
};

// This function is a placeholder to fix imports
export const generateContourData = () => {
  return {
    x: [],
    y: [],
    z: [[]]
  };
};