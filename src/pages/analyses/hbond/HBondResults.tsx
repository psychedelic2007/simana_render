import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Plot from "react-plotly.js";
import { Download, Settings } from "lucide-react";

const HBondResults = ({
  showResults,
  hbondData,
  distributionData,
  plotKey,
  customizations,
  downloadPlot,
  files,
  seriesColors,
  labels,
  updateColor,
}: any) =>
  showResults ? (
    <div className="glass rounded-xl p-6 mb-8">
      <Tabs defaultValue="lineChart">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Results</h2>
          <TabsList>
            <TabsTrigger value="lineChart">Time Course</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="lineChart" className="space-y-4">
          <div className="bg-white rounded-lg p-4 h-[400px]">
            <Plot
              key={`line-plot-${plotKey}`}
              id="hbond-plot"
              data={hbondData.map((series: any) => ({
                type: "scatter",
                mode: "lines",
                x: series.data.map((p: number[]) => p[0]),
                y: series.data.map((p: number[]) => p[1]),
                name: series.label,
                line: {
                  width: customizations.lineChart.lineWidth,
                  color: series.color,
                },
              }))}
              layout={{
                autosize: true,
                title: "Hydrogen Bonds Over Time",
                xaxis: {
                  title: {
                    text: customizations.lineChart.xLabel,
                    font: { size: customizations.lineChart.xLabelSize },
                  },
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
                  title: {
                    text: customizations.lineChart.yLabel,
                    font: { size: customizations.lineChart.yLabelSize },
                  },
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
                uirevision: 'true',
              }}
              style={{ width: "100%", height: "100%" }}
              config={{ responsive: true }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="mr-2"
              onClick={() =>
                document.getElementById("lineChart-tab")?.click()
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              Customize
            </Button>
            <Button onClick={() => downloadPlot("hbond-plot")}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="distribution" className="space-y-4">
          <div className="bg-white rounded-lg p-4 h-[400px]">
            <Plot
              key={`dist-plot-${plotKey}`}
              id="distribution-plot"
              data={distributionData.map((series: any) => ({
                type: "scatter",
                mode: "lines",
                x: series.distribution.x,
                y: series.distribution.y,
                name: series.label,
                fill: "tozeroy",
                fillcolor:
                  series.color +
                  Math.round(
                    customizations.distribution.alpha * 255
                  )
                    .toString(16)
                    .padStart(2, "0"),
                line: {
                  width: customizations.distribution.lineWidth,
                  color: series.color,
                },
              }))}
              layout={{
                autosize: true,
                title: "Hydrogen Bond Distribution",
                xaxis: {
                  title: {
                    text: customizations.distribution.xLabel,
                    font: {
                      size: customizations.distribution.xLabelSize,
                    },
                  },
                  tickfont: {
                    size: customizations.distribution.tickSize,
                  },
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
                  title: {
                    text: customizations.distribution.yLabel,
                    font: {
                      size: customizations.distribution.yLabelSize,
                    },
                  },
                  tickfont: {
                    size: customizations.distribution.tickSize,
                  },
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
                uirevision: 'true',
              }}
              style={{ width: "100%", height: "100%" }}
              config={{ responsive: true }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="mr-2"
              onClick={() =>
                document.getElementById("distribution-tab")?.click()
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              Customize
            </Button>
            <Button onClick={() => downloadPlot("distribution-plot")}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ) : null;

export default HBondResults;