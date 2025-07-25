export const calculateDCCM = async (
  pdbFile: File,
  xtcFile: File,
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
  try {
    const formData = new FormData();
    formData.append('pdb_file', pdbFile);
    formData.append('xtc_file', xtcFile);
    
    // Add customization parameters to form data
    if (customizations) {
      formData.append('colorMap', customizations.colorMap.toLowerCase());
      formData.append('minValue', customizations.minValue.toString());
      formData.append('maxValue', customizations.maxValue.toString());
      formData.append('xAxisLabel', customizations.xAxisLabel);
      formData.append('yAxisLabel', customizations.yAxisLabel);
      formData.append('plotTitle', customizations.plotTitle);
      formData.append('showColorbar', customizations.showColorbar.toString());
      formData.append('colorbarLabel', customizations.colorbarLabel);
      
      if (customizations.dpi) {
        formData.append('dpi', customizations.dpi.toString());
      }
    }
    
    const response = await fetch('https://simana.onrender.com/api/dccm/', {
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
    
    if (!data.success) {
      throw new Error(`DCCM calculation failed: ${data.message || 'Unknown error'}`);
    }
    
    return {
      plotUrl: data.plotUrl,
      dccmShape: data.dccm_shape,
      message: data.message
    };
  } catch (error) {
    console.error("Error calling Python backend:", error);
    throw error;
  }
};
