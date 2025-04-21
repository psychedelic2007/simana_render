import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SeriesCustomLabelColor from "@/pages/analyses/hbond/SeriesCustomLabelColor";

const HBondSidebar = ({
  customizations,
  setCustomizations,
  files,
  seriesColors,
  labels,
  updateColor,
}: any) => (
  <div className="glass rounded-xl p-6 sticky top-24">
    <h2 className="text-xl font-semibold mb-4">Plot Customization</h2>
    <Tabs defaultValue="lineChart">
      <TabsList className="mb-4 w-full">
        <TabsTrigger id="lineChart-tab" value="lineChart" className="flex-1">
          Time Course
        </TabsTrigger>
        <TabsTrigger id="distribution-tab" value="distribution" className="flex-1">
          Distribution
        </TabsTrigger>
      </TabsList>

      {/* Time Course Customization */}
      <TabsContent value="lineChart" className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">X-axis Label</label>
          <Input
            value={customizations.lineChart.xLabel}
            onChange={(e) =>
              setCustomizations((curr: any) => ({
                ...curr,
                lineChart: { ...curr.lineChart, xLabel: e.target.value },
              }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Y-axis Label</label>
          <Input
            value={customizations.lineChart.yLabel}
            onChange={(e) =>
              setCustomizations((curr: any) => ({
                ...curr,
                lineChart: { ...curr.lineChart, yLabel: e.target.value },
              }))
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">X Label Size</label>
            <Input
              type="number"
              min={8}
              max={24}
              step={1}
              value={customizations.lineChart.xLabelSize}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  lineChart: {
                    ...curr.lineChart,
                    xLabelSize: parseInt(e.target.value) || 14,
                  }
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Y Label Size</label>
            <Input
              type="number"
              min={8}
              max={24}
              step={1}
              value={customizations.lineChart.yLabelSize}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  lineChart: {
                    ...curr.lineChart,
                    yLabelSize: parseInt(e.target.value) || 14,
                  }
                }))
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Line Width</label>
            <Input
              type="number"
              min={0.5}
              max={5}
              step={0.1}
              value={customizations.lineChart.lineWidth}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  lineChart: {
                    ...curr.lineChart,
                    lineWidth: parseFloat(e.target.value) || 2,
                  }
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tick Size</label>
            <Input
              type="number"
              min={8}
              max={16}
              value={customizations.lineChart.tickSize}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  lineChart: {
                    ...curr.lineChart,
                    tickSize: parseInt(e.target.value) || 12,
                  }
                }))
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">X Tick Gap</label>
            <Input
              type="number"
              min={1}
              max={50}
              value={customizations.lineChart.xTickGap}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  lineChart: {
                    ...curr.lineChart,
                    xTickGap: Number(e.target.value) || 10,
                  }
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Y Tick Gap</label>
            <Input
              type="number"
              min={0.01}
              max={5}
              step={0.01}
              value={customizations.lineChart.yTickGap}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  lineChart: {
                    ...curr.lineChart,
                    yTickGap: Number(e.target.value) || 1,
                  }
                }))
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">X Min</label>
            <Input
              type="number"
              placeholder="Auto"
              value={customizations.lineChart.xMin === null ? "" : customizations.lineChart.xMin}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  lineChart: {
                    ...curr.lineChart,
                    xMin: e.target.value ? Number(e.target.value) : null,
                  }
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">X Max</label>
            <Input
              type="number"
              placeholder="Auto"
              value={customizations.lineChart.xMax === null ? "" : customizations.lineChart.xMax}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  lineChart: {
                    ...curr.lineChart,
                    xMax: e.target.value ? Number(e.target.value) : null,
                  }
                }))
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Y Min</label>
            <Input
              type="number"
              placeholder="Auto"
              value={customizations.lineChart.yMin === null ? "" : customizations.lineChart.yMin}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  lineChart: {
                    ...curr.lineChart,
                    yMin: e.target.value ? Number(e.target.value) : null,
                  }
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Y Max</label>
            <Input
              type="number"
              placeholder="Auto"
              value={customizations.lineChart.yMax === null ? "" : customizations.lineChart.yMax}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  lineChart: {
                    ...curr.lineChart,
                    yMax: e.target.value ? Number(e.target.value) : null,
                  }
                }))
              }
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Legend Position</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={
                customizations.lineChart.legendPosition === "top"
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  lineChart: { ...curr.lineChart, legendPosition: "top" },
                }))
              }
            >
              Top
            </Button>
            <Button
              type="button"
              variant={
                customizations.lineChart.legendPosition === "bottom"
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  lineChart: { ...curr.lineChart, legendPosition: "bottom" },
                }))
              }
            >
              Bottom
            </Button>
          </div>
        </div>
        <SeriesCustomLabelColor
          files={files}
          seriesColors={seriesColors}
          labels={labels}
          updateColor={updateColor}
        />
      </TabsContent>
      {/* Distribution Customization */}
      <TabsContent value="distribution" className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">X-axis Label</label>
          <Input
            value={customizations.distribution.xLabel}
            onChange={(e) =>
              setCustomizations((curr: any) => ({
                ...curr,
                distribution: { ...curr.distribution, xLabel: e.target.value },
              }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Y-axis Label</label>
          <Input
            value={customizations.distribution.yLabel}
            onChange={(e) =>
              setCustomizations((curr: any) => ({
                ...curr,
                distribution: { ...curr.distribution, yLabel: e.target.value },
              }))
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">X Label Size</label>
            <Input
              type="number"
              min={8}
              max={24}
              step={1}
              value={customizations.distribution.xLabelSize}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  distribution: { ...curr.distribution, xLabelSize: parseInt(e.target.value) || 14 }
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Y Label Size</label>
            <Input
              type="number"
              min={8}
              max={24}
              step={1}
              value={customizations.distribution.yLabelSize}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  distribution: { ...curr.distribution, yLabelSize: parseInt(e.target.value) || 14 }
                }))
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tick Size</label>
            <Input
              type="number"
              min={8}
              max={16}
              value={customizations.distribution.tickSize}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  distribution: { ...curr.distribution, tickSize: parseInt(e.target.value) || 12 }
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fill Opacity</label>
            <Input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={customizations.distribution.alpha}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  distribution: { ...curr.distribution, alpha: parseFloat(e.target.value) }
                }))
              }
            />
            <div className="text-right text-sm">
              {customizations.distribution.alpha.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">X Tick Gap</label>
            <Input
              type="number"
              min={0.01}
              max={5}
              step={0.01}
              value={customizations.distribution.xTickGap}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  distribution: { ...curr.distribution, xTickGap: Number(e.target.value) || 1 }
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Y Tick Gap</label>
            <Input
              type="number"
              min={1}
              max={100}
              step={1}
              value={customizations.distribution.yTickGap}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  distribution: { ...curr.distribution, yTickGap: Number(e.target.value) || 1 }
                }))
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">X Min</label>
            <Input
              type="number"
              placeholder="Auto"
              value={customizations.distribution.xMin === null ? "" : customizations.distribution.xMin}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  distribution: { ...curr.distribution, xMin: e.target.value ? Number(e.target.value) : null }
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">X Max</label>
            <Input
              type="number"
              placeholder="Auto"
              value={customizations.distribution.xMax === null ? "" : customizations.distribution.xMax}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  distribution: { ...curr.distribution, xMax: e.target.value ? Number(e.target.value) : null }
                }))
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Y Min</label>
            <Input
              type="number"
              placeholder="Auto"
              value={customizations.distribution.yMin === null ? "" : customizations.distribution.yMin}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  distribution: { ...curr.distribution, yMin: e.target.value ? Number(e.target.value) : null }
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Y Max</label>
            <Input
              type="number"
              placeholder="Auto"
              value={customizations.distribution.yMax === null ? "" : customizations.distribution.yMax}
              onChange={(e) =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  distribution: { ...curr.distribution, yMax: e.target.value ? Number(e.target.value) : null }
                }))
              }
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Legend Position</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={
                customizations.distribution.legendPosition === "top"
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  distribution: { ...curr.distribution, legendPosition: "top" },
                }))
              }
            >
              Top
            </Button>
            <Button
              type="button"
              variant={
                customizations.distribution.legendPosition === "bottom"
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                setCustomizations((curr: any) => ({
                  ...curr,
                  distribution: { ...curr.distribution, legendPosition: "bottom" },
                }))
              }
            >
              Bottom
            </Button>
          </div>
        </div>
        <SeriesCustomLabelColor
          files={files}
          seriesColors={seriesColors}
          labels={labels}
          updateColor={updateColor}
        />
      </TabsContent>
    </Tabs>
  </div>
);

export default HBondSidebar;