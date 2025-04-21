// Refactored Hydrogen Bond Analysis Page with modular components and hooks

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import HBondUpload from "@/pages/analyses/hbond/HBondUpload";
import HBondResults from "@/pages/analyses/hbond/HBondResults";
import HBondSidebar from "@/pages/analyses/hbond/HBondSidebar";
import { useHBondConfig } from "@/pages/analyses/hbond/useHBondConfig";
import Footer from "../../components/Footer";

const HBondAnalysis = () => {
  const navigate = useNavigate();
  const {
    files,
    setFiles,
    isAnalyzing,
    showResults,
    hbondData,
    distributionData,
    seriesColors,
    labels,
    handleFileSelect,
    updateLabel,
    updateColor,
    handleRunAnalysis,
    plotKey,
    customizations,
    setCustomizations,
  } = useHBondConfig();

  // Download plot logic, same as before, but now as local function
  const downloadPlot = (plotId: string) => {
    toast({
      title: "Download Started",
      description: `Your plot is being prepared for download.`,
    });

    const plotElement = document.getElementById(plotId);
    if (plotElement) {
      import("plotly.js-dist").then((Plotly) => {
        const chartData =
          plotId === "hbond-plot"
            ? {
                data: hbondData.map((series) => ({
                  type: "scatter",
                  mode: "lines",
                  x: series.data.map((p: number[]) => p[0]),
                  y: series.data.map((p: number[]) => p[1]),
                  name: series.label,
                  line: {
                    width: customizations.lineChart.lineWidth,
                    color: series.color,
                  },
                })),
                layout: {
                  title: "Hydrogen Bonds Over Time",
                  xaxis: {
                    title: customizations.lineChart.xLabel,
                    titlefont: { size: customizations.lineChart.xLabelSize },
                    tickfont: { size: customizations.lineChart.tickSize },
                    dtick: customizations.lineChart.xTickGap,
                    range:
                      customizations.lineChart.xMin !== null &&
                      customizations.lineChart.xMax !== null
                        ? [
                            customizations.lineChart.xMin,
                            customizations.lineChart.xMax,
                          ]
                        : undefined,
                  },
                  yaxis: {
                    title: customizations.lineChart.yLabel,
                    titlefont: { size: customizations.lineChart.yLabelSize },
                    tickfont: { size: customizations.lineChart.tickSize },
                    dtick: customizations.lineChart.yTickGap,
                    range:
                      customizations.lineChart.yMin !== null &&
                      customizations.lineChart.yMax !== null
                        ? [
                            customizations.lineChart.yMin,
                            customizations.lineChart.yMax,
                          ]
                        : undefined,
                  },
                  legend: {
                    y: customizations.lineChart.legendPosition === "top" ? 1 : -0.2,
                    orientation: "h",
                    xanchor: "center",
                    x: 0.5,
                  },
                  width: 1200,
                  height: 800,
                },
              }
            : {
                data: distributionData.map((series) => ({
                  type: "scatter",
                  mode: "lines",
                  x: series.distribution.x,
                  y: series.distribution.y,
                  name: series.label,
                  fill: "tozeroy",
                  line: {
                    width: customizations.distribution.lineWidth,
                    color: series.color,
                  },
                  fillcolor:
                    series.color +
                    Math.round(customizations.distribution.alpha * 255)
                      .toString(16)
                      .padStart(2, "0"),
                })),
                layout: {
                  title: "Hydrogen Bond Distribution",
                  xaxis: {
                    title: customizations.distribution.xLabel,
                    titlefont: {
                      size: customizations.distribution.xLabelSize,
                    },
                    tickfont: { size: customizations.distribution.tickSize },
                    dtick: customizations.distribution.xTickGap,
                    range:
                      customizations.distribution.xMin !== null &&
                      customizations.distribution.xMax !== null
                        ? [
                            customizations.distribution.xMin,
                            customizations.distribution.xMax,
                          ]
                        : undefined,
                  },
                  yaxis: {
                    title: customizations.distribution.yLabel,
                    titlefont: {
                      size: customizations.distribution.yLabelSize,
                    },
                    tickfont: { size: customizations.distribution.tickSize },
                    dtick: customizations.distribution.yTickGap,
                    range:
                      customizations.distribution.yMin !== null &&
                      customizations.distribution.yMax !== null
                        ? [
                            customizations.distribution.yMin,
                            customizations.distribution.yMax,
                          ]
                        : undefined,
                  },
                  legend: {
                    y: customizations.distribution.legendPosition === "top" ? 1 : -0.2,
                    orientation: "h",
                    xanchor: "center",
                    x: 0.5,
                  },
                  width: 1200,
                  height: 800,
                },
              };

        Plotly.toImage(chartData, { format: "png", width: 1200, height: 800 })
          .then((dataUrl) => {
            const downloadLink = document.createElement("a");
            downloadLink.href = dataUrl;
            downloadLink.download = `${plotId}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            toast({
              title: "Download Complete",
              description: `Your plot has been downloaded.`,
            });
          })
          .catch((err) => {
            toast({
              title: "Download Failed",
              description: "There was an error downloading your plot.",
              variant: "destructive",
            });
          });
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <button type="button" className="mb-4" onClick={() => navigate("/analysis")}>
            <ArrowLeft className="mr-2" size={16} />
            Back to Analysis Tools
          </button>
          <h1 className="text-3xl font-bold mb-2">Hydrogen Bond Analysis</h1>
          <p className="text-muted-foreground mb-8">
            Analyze hydrogen bond formation and patterns over time in your trajectory.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <HBondUpload
              files={files}
              onFilesSelected={handleFileSelect}
              labels={labels}
              colors={seriesColors}
              onLabelChange={updateLabel}
              onColorChange={updateColor}
              isAnalyzing={isAnalyzing}
              onRunAnalysis={() => handleRunAnalysis(toast)}
            />
            <HBondResults
              showResults={showResults}
              hbondData={hbondData}
              distributionData={distributionData}
              plotKey={plotKey}
              customizations={customizations}
              files={files}
              seriesColors={seriesColors}
              labels={labels}
              updateColor={updateColor}
              downloadPlot={downloadPlot}
            />
          </div>
          <div className="lg:col-span-1">
            <HBondSidebar
              customizations={customizations}
              setCustomizations={setCustomizations}
              files={files}
              seriesColors={seriesColors}
              labels={labels}
              updateColor={updateColor}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HBondAnalysis;