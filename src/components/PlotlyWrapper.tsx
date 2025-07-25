// components/PlotlyWrapper.tsx
'use client';
import React, { useEffect, useRef } from 'react';

interface PlotProps {
  id?: string;
  data: any[];
  layout?: any;
  style?: React.CSSProperties;
  config?: any;
}

const PlotlyWrapper: React.FC<PlotProps> = ({ 
  id = 'plot', 
  data, 
  layout = {}, 
  style = { width: '100%', height: '100%' }, 
  config = { responsive: true }
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const plotInitialized = useRef(false);

  useEffect(() => {
    // Load Plotly dynamically
    const loadPlotly = async () => {
      if (typeof window !== 'undefined' && plotRef.current) {
        // Check if Plotly is already available globally
        if (window.Plotly) {
          if (!plotInitialized.current) {
            await window.Plotly.newPlot(plotRef.current, data, layout, config);
            plotInitialized.current = true;
          } else {
            await window.Plotly.react(plotRef.current, data, layout, config);
          }
        } else {
          // Load Plotly from CDN if not available
          const script = document.createElement('script');
          script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
          script.onload = async () => {
            if (window.Plotly && plotRef.current) {
              await window.Plotly.newPlot(plotRef.current, data, layout, config);
              plotInitialized.current = true;
            }
          };
          document.head.appendChild(script);
        }
      }
    };

    loadPlotly();

    // Cleanup function
    return () => {
      if (plotRef.current && plotInitialized.current && window.Plotly) {
        window.Plotly.purge(plotRef.current);
        plotInitialized.current = false;
      }
    };
  }, [data, layout, config]);

  return <div id={id} ref={plotRef} style={style} />;
};

// Extend Window interface to include Plotly
declare global {
  interface Window {
    Plotly: any;
  }
}

export default PlotlyWrapper;
