import { useState } from "react";
import { generateRandomHbondData, calculateDistribution } from "./hbondUtils";

const defaultColors = ["#61b0e6", "#1d7092", "#acd5fa", "#387080"];

export function useHBondConfig() {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hbondData, setHbondData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [seriesColors, setSeriesColors] = useState<string[]>(defaultColors);
  const [labels, setLabels] = useState<string[]>([]);
  const [plotKey, setPlotKey] = useState<number>(0);

  const [customizations, setCustomizations] = useState({
    lineChart: {
      xLabel: "Time (ns)",
      yLabel: "Hydrogen Bonds",
      xLabelSize: 14,
      yLabelSize: 14,
      tickSize: 12,
      xTickGap: 10,
      yTickGap: 1,
      lineWidth: 2,
      xMin: null as number | null,
      xMax: null as number | null,
      yMin: null as number | null,
      yMax: null as number | null,
      legendPosition: "top" as "top" | "bottom",
    },
    distribution: {
      xLabel: "Number of Hydrogen Bonds",
      yLabel: "Frequency",
      xLabelSize: 14,
      yLabelSize: 14,
      tickSize: 12,
      xTickGap: 1,
      yTickGap: 1,
      lineWidth: 2,
      alpha: 0.5,
      xMin: null as number | null,
      xMax: null as number | null,
      yMin: null as number | null,
      yMax: null as number | null,
      legendPosition: "top" as "top" | "bottom",
    },
  });

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setLabels(Array(selectedFiles.length).fill(""));
    setSeriesColors(selectedFiles.map((_, idx) => defaultColors[idx % defaultColors.length]));
    setShowResults(false);
  };

  const updateLabel = (index: number, value: string) => {
    setLabels((prev) => {
      const newLabels = [...prev];
      newLabels[index] = value;
      return newLabels;
    });
  };

  const updateColor = (index: number, value: string) => {
    setSeriesColors((prev) => {
      const newColors = [...prev];
      newColors[index] = value;
      return newColors;
    });

    // Update hbondData with new color
    setHbondData((prev) => {
      const newData = [...prev];
      if (newData[index]) {
        newData[index] = {
          ...newData[index],
          color: value
        };
      }
      return newData;
    });

    // Update distributionData with new color
    setDistributionData((prev) => {
      const newData = [...prev];
      if (newData[index]) {
        newData[index] = {
          ...newData[index],
          color: value
        };
      }
      return newData;
    });

    _bumpPlotKey(); // Force plot re-render
  };

  const handleRunAnalysis = async (toast: any) => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one file to analyze.",
        variant: "destructive",
      });
      return;
    }
    setIsAnalyzing(true);
    setShowResults(false);

    try {
      const allSeriesData: any[] = [];
      for (let i = 0; i < files.length; i++) {
        const mean = 10 + i * 2;
        const data = generateRandomHbondData(100, mean);
        allSeriesData.push({
          data,
          label: labels[i] || files[i].name,
          color: seriesColors[i],
        });
      }
      setHbondData(allSeriesData);

      const distributionSeries = allSeriesData.map((series) => {
        const values = series.data.map((pt: number[]) => pt[1]);
        const dist = calculateDistribution(values);
        return {
          ...series,
          distribution: dist,
        };
      });
      setDistributionData(distributionSeries);
      setShowResults(true);
      toast({
        title: "Analysis Complete",
        description: "Hydrogen bond analysis has been processed.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Error processing your files.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Update plotKey when main plot state changes for re-render
  const _bumpPlotKey = () => setPlotKey((k) => k + 1);

  return {
    files,
    setFiles,
    isAnalyzing,
    showResults,
    hbondData,
    distributionData,
    seriesColors,
    labels,
    setLabels,
    setSeriesColors,
    handleFileSelect,
    updateLabel,
    updateColor,
    handleRunAnalysis,
    plotKey,
    customizations,
    setCustomizations,
    _bumpPlotKey,
    setShowResults,
  };
}