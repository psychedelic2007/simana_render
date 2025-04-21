
/**
 * Contact Map Utility Functions
 * Calculates contact between residues in a protein structure
 */

export const calculateContactMap = async (
  pdbFile: File,
  cutoff: number = 8.0,
  customizations?: {
    colorMap: string;
    minValue: number;
    maxValue: number;
    xAxisLabel: string;
    yAxisLabel: string;
    xTicksGap: number;
    yTicksGap: number;
    xlimMin: number | null;
    xlimMax: number | null;
    ylimMin: number | null;
    ylimMax: number | null;
    labelFontSize: number;
    tickLabelSize: number;
    dpi?: number;
  }
) => {
  console.log('Processing PDB file for contact map:', pdbFile.name);
  console.log('Using cutoff distance:', cutoff);
  
  try {
    const formData = new FormData();
    formData.append('pdb_file', pdbFile);
    formData.append('cutoff', cutoff.toString());
    
    // Add customization parameters to form data
    if (customizations) {
      formData.append('cmap', customizations.colorMap.toLowerCase());
      formData.append('vmin', customizations.minValue.toString());
      formData.append('vmax', customizations.maxValue.toString());
      formData.append('xlabel', customizations.xAxisLabel);
      formData.append('ylabel', customizations.yAxisLabel);
      formData.append('xticks_gap', customizations.xTicksGap.toString());
      formData.append('yticks_gap', customizations.yTicksGap.toString());
      
      if (customizations.xlimMin !== null) {
        formData.append('xlim_min', customizations.xlimMin.toString());
      }
      
      if (customizations.xlimMax !== null) {
        formData.append('xlim_max', customizations.xlimMax.toString());
      }
      
      if (customizations.ylimMin !== null) {
        formData.append('ylim_min', customizations.ylimMin.toString());
      }
      
      if (customizations.ylimMax !== null) {
        formData.append('ylim_max', customizations.ylimMax.toString());
      }
      
      formData.append('label_fontsize', customizations.labelFontSize.toString());
      formData.append('tick_labelsize', customizations.tickLabelSize.toString());
      
      if (customizations.dpi) {
        formData.append('dpi', customizations.dpi.toString());
      }
    }
    
    const response = await fetch('http://localhost:8000/api/contact_map', {
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
};
