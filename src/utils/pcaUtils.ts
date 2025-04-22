const API_URL = import.meta.env.VITE_API_URL;

export interface PCAnalysisOptions {
  method: 'pca' | 'tsne' | 'umap';
  selection: string;
  stride: number;
  nComponents: number;
  comp1: number;
  comp2: number;
  dpi: number;
}

export interface ComponentOption {
  value: number;
  label: string;
}

export interface PCAnalysisResult {
  variancePlot: string;
  projectionPlot: string;
  method: string;
  nFrames: number;
  nAtoms: number;
  comp1: number;
  comp2: number;
  nComponents70: number;
  componentOptions: ComponentOption[];
  explainedVariance: number[] | null;
  cumulativeVariance: number[] | null;
}

export const performDimensionalityReduction = async (
  xtcFile: File,
  pdbFile: File,
  options: PCAnalysisOptions
): Promise<PCAnalysisResult> => {
  try {
    const formData = new FormData();

    // Add files
    formData.append('xtc_file', xtcFile);
    formData.append('pdb_file', pdbFile);

    // Add options
    formData.append('method', options.method);
    formData.append('selection', options.selection);
    formData.append('stride', options.stride.toString());
    formData.append('n_components', options.nComponents.toString());
    formData.append('comp1', options.comp1.toString());
    formData.append('comp2', options.comp2.toString());
    formData.append('dpi', options.dpi.toString());

    const response = await fetch(`${API_URL}/pca`, {
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
      variancePlot: data.variance_plot,
      projectionPlot: data.projection_plot,
      method: data.method,
      nFrames: data.n_frames,
      nAtoms: data.n_atoms,
      comp1: data.comp1,
      comp2: data.comp2,
      nComponents70: data.n_components_70,
      componentOptions: data.component_options,
      explainedVariance: data.explained_variance,
      cumulativeVariance: data.cumulative_variance,
    };
  } catch (error) {
    console.error('Error calling Python backend:', error);
    throw error;
  }
};

// Default configurations for different types of analyses
export const defaultPCAOptions: PCAnalysisOptions = {
  method: 'pca',
  selection: 'backbone',
  stride: 1,
  nComponents: 10,
  comp1: 0,
  comp2: 1,
  dpi: 300,
};

// List of available color scales for visualizations
export const colorscales = [
  'Viridis',
  'Plasma',
  'Inferno',
  'Magma',
  'Cividis',
  'Turbo',
  'Blues',
  'Greens',
  'Reds',
  'Purples',
  'YlOrRd',
  'YlOrBr',
  'YlGnBu',
  'PuRd',
  'RdPu',
];
