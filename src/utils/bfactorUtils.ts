
import axios from 'axios';

interface CurvePlotCustomizations {
  xLabel: string;
  yLabel: string;
  xLabelSize: number;
  yLabelSize: number;
  tickSize: number;
  xTickGap: number;
  yTickGap: number;
  lineWidth: number;
  xTickRotation: number;
  xMin: number | null;
  xMax: number | null;
  yMin: number | null;
  yMax: number | null;
}

interface DistPlotCustomizations {
  xLabel: string;
  yLabel: string;
  xLabelSize: number;
  yLabelSize: number;
  tickSize: number;
  xTickGap: number;
  yTickGap: number;
  xTickRotation: number;
  alpha: number;
  xMin: number | null;
  xMax: number | null;
  yMin: number | null;
  yMax: number | null;
}

interface BFactorResult {
  curve_plot: string;
  dist_plot: string;
  residue_data: Array<{
    residue: number;
    mean_bfactor: number;
    std_bfactor: number;
  }>;
  residue_count: number;
  error?: string;
}

export const analyzeBFactor = async (
  pdbFile: File, 
  showStdDev: boolean,
  curvePlotCustomizations: CurvePlotCustomizations,
  distPlotCustomizations: DistPlotCustomizations,
  dpi: number = 300
): Promise<BFactorResult> => {
  const formData = new FormData();
  formData.append('pdb_file', pdbFile);
  formData.append('show_std_dev', showStdDev.toString());
  
  // Add curve plot customizations
  formData.append('curve_x_label', curvePlotCustomizations.xLabel);
  formData.append('curve_y_label', curvePlotCustomizations.yLabel);
  formData.append('curve_x_label_size', curvePlotCustomizations.xLabelSize.toString());
  formData.append('curve_y_label_size', curvePlotCustomizations.yLabelSize.toString());
  formData.append('curve_tick_size', curvePlotCustomizations.tickSize.toString());
  formData.append('curve_x_tick_gap', curvePlotCustomizations.xTickGap.toString());
  formData.append('curve_y_tick_gap', curvePlotCustomizations.yTickGap.toString());
  formData.append('curve_linewidth', curvePlotCustomizations.lineWidth.toString());
  formData.append('curve_x_tick_rotation', curvePlotCustomizations.xTickRotation.toString());
  
  if (curvePlotCustomizations.xMin !== null) {
    formData.append('curve_x_min', curvePlotCustomizations.xMin.toString());
  }
  if (curvePlotCustomizations.xMax !== null) {
    formData.append('curve_x_max', curvePlotCustomizations.xMax.toString());
  }
  if (curvePlotCustomizations.yMin !== null) {
    formData.append('curve_y_min', curvePlotCustomizations.yMin.toString());
  }
  if (curvePlotCustomizations.yMax !== null) {
    formData.append('curve_y_max', curvePlotCustomizations.yMax.toString());
  }
  
  // Add distribution plot customizations
  formData.append('dist_x_label', distPlotCustomizations.xLabel);
  formData.append('dist_y_label', distPlotCustomizations.yLabel);
  formData.append('dist_x_label_size', distPlotCustomizations.xLabelSize.toString());
  formData.append('dist_y_label_size', distPlotCustomizations.yLabelSize.toString());
  formData.append('dist_tick_size', distPlotCustomizations.tickSize.toString());
  formData.append('dist_x_tick_gap', distPlotCustomizations.xTickGap.toString());
  formData.append('dist_y_tick_gap', distPlotCustomizations.yTickGap.toString());
  formData.append('dist_x_tick_rotation', distPlotCustomizations.xTickRotation.toString());
  formData.append('dist_alpha', distPlotCustomizations.alpha.toString());
  
  if (distPlotCustomizations.xMin !== null) {
    formData.append('dist_x_min', distPlotCustomizations.xMin.toString());
  }
  if (distPlotCustomizations.xMax !== null) {
    formData.append('dist_x_max', distPlotCustomizations.xMax.toString());
  }
  if (distPlotCustomizations.yMin !== null) {
    formData.append('dist_y_min', distPlotCustomizations.yMin.toString());
  }
  if (distPlotCustomizations.yMax !== null) {
    formData.append('dist_y_max', distPlotCustomizations.yMax.toString());
  }
  
  formData.append('dpi', dpi.toString());
  
  try {
    const response = await axios.post<BFactorResult>(
      'http://localhost:8000/api/bfactor',
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
        curve_plot: '', 
        dist_plot: '', 
        residue_data: [], 
        residue_count: 0,
        error: error.response.data.detail || 'An error occurred while processing the request' 
      };
    }
    console.error('Request Error:', error);
    return { 
      curve_plot: '', 
      dist_plot: '', 
      residue_data: [], 
      residue_count: 0,
      error: 'An error occurred while connecting to the server' 
    };
  }
};

export const downloadCSV = (data: Array<{residue: number; mean_bfactor: number; std_bfactor: number}>) => {
  // Create CSV content
  const headers = ['Residue', 'Mean B-factor', 'Std B-factor'];
  const csvContent = [
    headers.join(','),
    ...data.map(row => `${row.residue},${row.mean_bfactor},${row.std_bfactor}`)
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'bfactor_analysis.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
