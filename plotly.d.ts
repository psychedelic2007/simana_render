declare module 'plotly.js-dist' {
  export * from 'plotly.js';
  export { default } from 'plotly.js';
}

declare module 'react-plotly.js' {
  import * as React from 'react';
  
  export interface PlotParams {
    data: any[];
    layout?: any;
    config?: any;
    style?: React.CSSProperties;
    className?: string;
    id?: string;
    [key: string]: any;
  }
  
  const Plot: React.ComponentType<PlotParams>;
  export default Plot;
}
