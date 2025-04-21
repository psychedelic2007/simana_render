import React from 'react';
import Plot from 'react-plotly.js';

interface PlotlyChartProps {
  data: any[];
  layout: any;
  config?: any;
}

export const PlotlyChart: React.FC<PlotlyChartProps> = ({ data, layout, config = {} }) => {
  return (
    <Plot
      data={data}
      layout={{
        ...layout,
        font: {
          family: 'Inter, sans-serif',
          size: 12,
          color: '#374151'
        },
        modebar: {
          bgcolor: 'transparent',
          color: '#6B7280',
          activecolor: '#0070F3'
        }
      }}
      config={{
        displayModeBar: true,
        displaylogo: false,
        responsive: true,
        ...config
      }}
      style={{ width: '100%', height: '100%' }}
    />
  );
}; 