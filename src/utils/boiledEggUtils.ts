// API functions for BOILED-Egg analysis

const API_URL = import.meta.env.VITE_API_URL;

export const analyzeSmiles = async (
  smiles: string,
  customizations: {
    title: string;
    xLabel: string;
    yLabel: string;
    pointSize: number;
    showThresholds: boolean;
    wlogpMin: number;
    wlogpMax: number;
    wlogpThreshold: number;
    tpsaMin: number;
    tpsaMax: number;
    tpsaThreshold: number;
    labelFontSize: number;
    axisFontSize: number;
    titleFontSize: number;
    dpi: number;
  }
) => {
  try {
    const formData = new FormData();
    formData.append('smiles', smiles);

    // Add customization parameters to form data
    formData.append('title', customizations.title);
    formData.append('x_label', customizations.xLabel);
    formData.append('y_label', customizations.yLabel);
    formData.append('point_size', customizations.pointSize.toString());
    formData.append('show_thresholds', customizations.showThresholds.toString());
    formData.append('wlogp_min', customizations.wlogpMin.toString());
    formData.append('wlogp_max', customizations.wlogpMax.toString());
    formData.append('wlogp_threshold', customizations.wlogpThreshold.toString());
    formData.append('tpsa_min', customizations.tpsaMin.toString());
    formData.append('tpsa_max', customizations.tpsaMax.toString());
    formData.append('tpsa_threshold', customizations.tpsaThreshold.toString());
    formData.append('label_fontsize', customizations.labelFontSize.toString());
    formData.append('axis_fontsize', customizations.axisFontSize.toString());
    formData.append('title_fontsize', customizations.titleFontSize.toString());
    formData.append('dpi', customizations.dpi.toString());

    const response = await fetch(`${API_URL}/boiled`, {
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
      plot: data.plot,
      molecules: data.molecules || [],
      invalidSmiles: data.invalid_smiles || [],
      validCount: data.valid_count || 0,
      invalidCount: data.invalid_count || 0,
    };
  } catch (error) {
    console.error("Error calling Python backend:", error);
    throw error;
  }
};

// Function to download analysis results as CSV
export const downloadCsv = (molecules: any[]) => {
  const headers = ['ID', 'SMILES', 'TPSA', 'WLogP', 'Region', 'Absorption'];

  const rows = molecules.map((mol) => [
    mol.id,
    `"${mol.smiles}"`,
    mol.tpsa,
    mol.wlogp,
    mol.region,
    `"${mol.absorption}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'boiled_egg_results.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
