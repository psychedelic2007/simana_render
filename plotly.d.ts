declare module 'plotly.js-dist' {
  export function newPlot(
    gd: any,
    data: any[],
    layout?: any,
    config?: any
  ): Promise<any>;
  
  export function toImage(
    gd: any,
    options?: {
      format?: 'png' | 'jpeg' | 'webp' | 'svg';
      width?: number;
      height?: number;
      scale?: number;
    }
  ): Promise<string>;
  
  export function react(
    gd: any,
    data: any[],
    layout?: any,
    config?: any
  ): Promise<any>;
  
  export function purge(gd: any): void;
  
  // Re-export everything else from plotly.js
  export * from 'plotly.js';
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
