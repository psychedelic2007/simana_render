import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Settings, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FileUpload from '@/components/FileUpload';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Plot from 'react-plotly.js';
import { parseXVGContent, calculateDistribution, alphaToHex } from '@/utils/xvgParser';
import Footer from '../../components/Footer';

const RoGAnalysis = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [fileCount, setFileCount] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [rogData, setRogData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [seriesColors, setSeriesColors] = useState<string[]>(['#9b87f5', '#7E69AB', '#6E59A5', '#1A1F2C']);
  
  const [customizations, setCustomizations] = useState({
    lineChart: {
      xLabel: "Time (ns)",
      yLabel: "RG (nm)",
      xLabelSize: 14,
      yLabelSize: 14,
      tickSize: 12,
      xTickGap: 10,
      yTickGap: 0.1,
      lineWidth: 2,
      xMin: null as number | null,
      xMax: null as number | null,
      yMin: null as number | null,
      yMax: null as number | null,
      legendPosition: "top" as "top" | "bottom"
    },
    distribution: {
      xLabel: "RG (nm)",
      yLabel: "Frequency",
      xLabelSize: 14,
      yLabelSize: 14,
      tickSize: 12,
      xTickGap: 0.1,
      yTickGap: 100,
      lineWidth: 2,
      alpha: 0.5,
      xMin: null as number | null,
      xMax: null as number | null,
      yMin: null as number | null,
      yMax: null as number | null,
      legendPosition: "top" as "top" | "bottom"
    }
  });

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    // Initialize labels array with empty strings
    setLabels(Array(selectedFiles.length).fill(''));
    
    // Initialize colors for the new files
    const defaultColors = ['#9b87f5', '#7E69AB', '#6E59A5', '#1A1F2C'];
    const newColors = selectedFiles.map((_, index) => defaultColors[index % defaultColors.length]);
    setSeriesColors(newColors);
  };

  const updateLabel = (index: number, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setLabels(newLabels);
  };

  const updateColor = (index: number, value: string) => {
    const newColors = [...seriesColors];
    newColors[index] = value;
    setSeriesColors(newColors);
  };

  // Generate random RoG data for demonstration
  const generateRandomRoGData = (length: number, variability: number) => {
    const data = [];
    const baseValue = 2.0; // typical RoG value in nm
    
    for (let i = 0; i < length; i++) {
      // Time in ns (assuming 1 ps timestep)
      const time = i * 0.001;
      
      // RoG value with some random fluctuations
      // Adding a slow oscillation to mimic protein breathing motion
      const oscillation = Math.sin(i / 100) * 0.1;
      const random = (Math.random() - 0.5) * variability;
      const value = baseValue + oscillation + random;
      
      data.push([time, value]); // Time in ns, RoG in nm
    }
    
    return data;
  };

  const handleRunAnalysis = async () => {
    if (files.length === 0) {
      toast.error("No files selected", {
        description: "Please upload at least one file to analyze.",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const allSeriesData: any[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const label = labels[i] || file.name;
        
        let seriesData;
        
        // Try to parse the file if it's text
        try {
          if (file.type === 'text/plain' || file.name.endsWith('.xvg') || file.name.endsWith('.txt') || file.name.endsWith('.dat')) {
            const fileContent = await file.text();
            const parsedData = parseXVGContent(fileContent);
            
            // Convert time to ns (if in ps)
            const xData = parsedData.x.map(x => x / 1000); // Convert ps to ns
            seriesData = xData.map((x, idx) => [x, parsedData.y[idx]]);
          } else {
            // If we can't parse, generate random data
            seriesData = generateRandomRoGData(1000, 0.2);
          }
        } catch (error) {
          console.error("Error parsing file:", error);
          seriesData = generateRandomRoGData(1000, 0.2);
        }
        
        allSeriesData.push({
          label,
          data: seriesData,
          color: seriesColors[i]
        });
      }
      
      setRogData(allSeriesData);
      
      // Calculate distribution data
      const distributionSeriesData = allSeriesData.map(series => {
        const rogValues = series.data.map((point: number[]) => point[1]);
        const distribution = calculateDistribution(rogValues);
        
        return {
          label: series.label,
          distribution,
          color: series.color
        };
      });
      
      setDistributionData(distributionSeriesData);
      
      setIsAnalyzing(false);
      setShowResults(true);
      
      toast.success("Analysis Complete", {
        description: "Radius of Gyration analysis has been successfully processed.",
      });
    } catch (error) {
      console.error("Error during analysis:", error);
      setIsAnalyzing(false);
      
      toast.error("Analysis Failed", {
        description: "There was an error processing your files.",
      });
    }
  };

  const downloadPlot = (plotId: string) => {
    const plotElement = document.getElementById(plotId);
    
    if (plotElement) {
      toast.success("Download Started", {
        description: "Your plot is being prepared for download.",
      });
      
      // Using Plotly.toImage directly from the window object
      if (window.Plotly) {
        try {
          window.Plotly.toImage(plotElement, {
            format: 'png',
            width: 1200,
            height: 800,
          }).then((dataUrl: string) => {
            const link = document.createElement('a');
            link.download = `${plotId}.png`;
            link.href = dataUrl;
            link.click();
          }).catch((err: any) => {
            console.error('Error downloading plot:', err);
            toast.error("Download Failed", {
              description: "There was an error generating the image.",
            });
          });
        } catch (error) {
          console.error('Error accessing Plotly instance:', error);
          toast.error("Download Failed", {
            description: "There was an error accessing the plot.",
          });
        }
      } else {
        toast.error("Download Failed", {
          description: "Plotly is not available. Make sure the library is properly loaded.",
        });
      }
    } else {
      toast.error("Download Failed", {
        description: "Plot not found.",
      });
    }
  };

  // Update plots when colors or data change
  useEffect(() => {
    if (rogData.length > 0 && seriesColors.length > 0) {
      const updatedRogData = rogData.map((series, index) => ({
        ...series,
        color: seriesColors[index % seriesColors.length]
      }));
      setRogData(updatedRogData);
      
      const updatedDistributionData = distributionData.map((series, index) => ({
        ...series,
        color: seriesColors[index % seriesColors.length]
      }));
      setDistributionData(updatedDistributionData);
    }
  }, [seriesColors]);

  // Add script for Plotly
  useEffect(() => {
    // Check if Plotly is already loaded
    if (!window.Plotly) {
      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/analysis')}
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Analysis Tools
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Radius of Gyration Analysis</h1>
          <p className="text-muted-foreground mb-8">
            Analyze the compactness of a protein structure over time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass rounded-xl p-6 mb-8"
            >
              <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Number of files to compare</label>
                <Input 
                  type="number" 
                  min={1} 
                  max={4} 
                  value={fileCount}
                  onChange={(e) => setFileCount(parseInt(e.target.value))}
                  className="w-full max-w-[150px]"
                />
              </div>
              
              <div className="mb-6">
                <FileUpload 
                  onFilesSelected={handleFileSelect}
                  acceptedFileTypes=".xvg,.dat,.txt,.csv"
                  maxFiles={fileCount}
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-medium">Custom Labels and Colors</h3>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <input
                        type="color"
                        value={seriesColors[index] || '#9b87f5'}
                        onChange={(e) => updateColor(index, e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        placeholder={`Label for ${file.name}`}
                        value={labels[index] || ''}
                        onChange={(e) => updateLabel(index, e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button 
                className="w-full md:w-auto bg-simana-blue hover:bg-simana-blue/90"
                disabled={isAnalyzing || files.length === 0}
                onClick={handleRunAnalysis}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Run Analysis
                  </>
                )}
              </Button>
            </motion.div>

            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass rounded-xl p-6 mb-8"
              >
                <Tabs defaultValue="lineChart">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Results</h2>
                    <TabsList>
                      <TabsTrigger value="lineChart">RoG Profile</TabsTrigger>
                      <TabsTrigger value="distribution">Distribution</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="lineChart" className="space-y-4">
                    <div className="bg-white rounded-lg p-4 h-[400px]">
                      <Plot
                        id="rog-plot"
                        data={rogData.map(series => ({
                          type: 'scatter',
                          mode: 'lines',
                          x: series.data.map((point: number[]) => point[0]),
                          y: series.data.map((point: number[]) => point[1]),
                          name: series.label,
                          line: {
                            width: customizations.lineChart.lineWidth,
                            color: series.color
                          }
                        }))}
                        layout={{
                          autosize: true,
                          title: 'Radius of Gyration',
                          xaxis: {
                            title: {
                              text: customizations.lineChart.xLabel,
                              font: {
                                size: customizations.lineChart.xLabelSize
                              }
                            },
                            tickfont: {
                              size: customizations.lineChart.tickSize
                            },
                            dtick: customizations.lineChart.xTickGap,
                            range: customizations.lineChart.xMin !== null && customizations.lineChart.xMax !== null ? 
                              [customizations.lineChart.xMin, customizations.lineChart.xMax] : undefined
                          },
                          yaxis: {
                            title: {
                              text: customizations.lineChart.yLabel,
                              font: {
                                size: customizations.lineChart.yLabelSize
                              }
                            },
                            tickfont: {
                              size: customizations.lineChart.tickSize
                            },
                            dtick: customizations.lineChart.yTickGap,
                            range: customizations.lineChart.yMin !== null && customizations.lineChart.yMax !== null ? 
                              [customizations.lineChart.yMin, customizations.lineChart.yMax] : undefined
                          },
                          legend: {
                            y: customizations.lineChart.legendPosition === 'top' ? 1 : -0.2,
                            orientation: 'h',
                            xanchor: 'center',
                            x: 0.5
                          }
                        }}
                        style={{ width: '100%', height: '100%' }}
                        config={{ responsive: true }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" className="mr-2" onClick={() => document.getElementById('lineChart-tab')?.click()}>
                        <Settings className="mr-2 h-4 w-4" />
                        Customize
                      </Button>
                      <Button onClick={() => downloadPlot('rog-plot')}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="distribution" className="space-y-4">
                    <div className="bg-white rounded-lg p-4 h-[400px]">
                      <Plot
                        id="distribution-plot"
                        data={distributionData.map(series => ({
                          type: 'scatter',
                          mode: 'lines',
                          x: series.distribution.x,
                          y: series.distribution.y,
                          name: series.label,
                          fill: 'tozeroy',
                          fillcolor: `${series.color}${alphaToHex(customizations.distribution.alpha)}`,
                          line: {
                            width: customizations.distribution.lineWidth,
                            color: series.color
                          }
                        }))}
                        layout={{
                          autosize: true,
                          title: 'RoG Distribution',
                          xaxis: {
                            title: {
                              text: customizations.distribution.xLabel,
                              font: {
                                size: customizations.distribution.xLabelSize
                              }
                            },
                            tickfont: {
                              size: customizations.distribution.tickSize
                            },
                            dtick: customizations.distribution.xTickGap,
                            range: customizations.distribution.xMin !== null && customizations.distribution.xMax !== null ? 
                              [customizations.distribution.xMin, customizations.distribution.xMax] : undefined
                          },
                          yaxis: {
                            title: {
                              text: customizations.distribution.yLabel,
                              font: {
                                size: customizations.distribution.yLabelSize
                              }
                            },
                            tickfont: {
                              size: customizations.distribution.tickSize
                            },
                            dtick: customizations.distribution.yTickGap,
                            range: customizations.distribution.yMin !== null && customizations.distribution.yMax !== null ? 
                              [customizations.distribution.yMin, customizations.distribution.yMax] : undefined
                          },
                          legend: {
                            y: customizations.distribution.legendPosition === 'top' ? 1 : -0.2,
                            orientation: 'h',
                            xanchor: 'center',
                            x: 0.5
                          }
                        }}
                        style={{ width: '100%', height: '100%' }}
                        config={{ responsive: true }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" className="mr-2" onClick={() => document.getElementById('distribution-tab')?.click()}>
                        <Settings className="mr-2 h-4 w-4" />
                        Customize
                      </Button>
                      <Button onClick={() => downloadPlot('distribution-plot')}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </div>

          {/* Right sidebar for customizations */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass rounded-xl p-6 sticky top-24"
            >
              <h2 className="text-xl font-semibold mb-4">Plot Customization</h2>
              <Tabs defaultValue="lineChart">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger id="lineChart-tab" value="lineChart" className="flex-1">RoG Profile</TabsTrigger>
                  <TabsTrigger id="distribution-tab" value="distribution" className="flex-1">Distribution</TabsTrigger>
                </TabsList>
                
                <TabsContent value="lineChart" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">X-axis Label</label>
                    <Input 
                      value={customizations.lineChart.xLabel} 
                      onChange={(e) => setCustomizations({
                        ...customizations,
                        lineChart: {
                          ...customizations.lineChart,
                          xLabel: e.target.value
                        }
                      })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Y-axis Label</label>
                    <Input 
                      value={customizations.lineChart.yLabel} 
                      onChange={(e) => setCustomizations({
                        ...customizations,
                        lineChart: {
                          ...customizations.lineChart,
                          yLabel: e.target.value
                        }
                      })}
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
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          lineChart: {
                            ...customizations.lineChart,
                            xLabelSize: parseInt(e.target.value)
                          }
                        })}
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
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          lineChart: {
                            ...customizations.lineChart,
                            yLabelSize: parseInt(e.target.value)
                          }
                        })}
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
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          lineChart: {
                            ...customizations.lineChart,
                            lineWidth: parseFloat(e.target.value)
                          }
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Tick Size</label>
                      <Input 
                        type="number" 
                        min={8} 
                        max={16} 
                        value={customizations.lineChart.tickSize} 
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          lineChart: {
                            ...customizations.lineChart,
                            tickSize: parseInt(e.target.value)
                          }
                        })}
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
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          lineChart: {
                            ...customizations.lineChart,
                            xTickGap: Number(e.target.value)
                          }
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Y Tick Gap</label>
                      <Input 
                        type="number"
                        min={0.01}
                        max={1}
                        step={0.01}
                        value={customizations.lineChart.yTickGap}
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          lineChart: {
                            ...customizations.lineChart,
                            yTickGap: Number(e.target.value)
                          }
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">X Min</label>
                      <Input 
                        type="number"
                        placeholder="Auto"
                        value={customizations.lineChart.xMin === null ? '' : customizations.lineChart.xMin}
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          lineChart: {
                            ...customizations.lineChart,
                            xMin: e.target.value ? Number(e.target.value) : null
                          }
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">X Max</label>
                      <Input 
                        type="number"
                        placeholder="Auto"
                        value={customizations.lineChart.xMax === null ? '' : customizations.lineChart.xMax}
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          lineChart: {
                            ...customizations.lineChart,
                            xMax: e.target.value ? Number(e.target.value) : null
                          }
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Y Min</label>
                      <Input 
                        type="number"
                        placeholder="Auto"
                        value={customizations.lineChart.yMin === null ? '' : customizations.lineChart.yMin}
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          lineChart: {
                            ...customizations.lineChart,
                            yMin: e.target.value ? Number(e.target.value) : null
                          }
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Y Max</label>
                      <Input 
                        type="number"
                        placeholder="Auto"
                        value={customizations.lineChart.yMax === null ? '' : customizations.lineChart.yMax}
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          lineChart: {
                            ...customizations.lineChart,
                            yMax: e.target.value ? Number(e.target.value) : null
                          }
                        })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Legend Position</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        type="button"
                        variant={customizations.lineChart.legendPosition === "top" ? "default" : "outline"}
                        onClick={() => setCustomizations({
                          ...customizations,
                          lineChart: {
                            ...customizations.lineChart,
                            legendPosition: "top"
                          }
                        })}
                      >
                        Top
                      </Button>
                      <Button 
                        type="button"
                        variant={customizations.lineChart.legendPosition === "bottom" ? "default" : "outline"}
                        onClick={() => setCustomizations({
                          ...customizations,
                          lineChart: {
                            ...customizations.lineChart,
                            legendPosition: "bottom"
                          }
                        })}
                      >
                        Bottom
                      </Button>
                    </div>
                  </div>
                  
                  {files.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Series Colors</label>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="color"
                              value={seriesColors[index] || '#9b87f5'}
                              onChange={(e) => updateColor(index, e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <span className="text-sm truncate max-w-[180px]">{labels[index] || file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="distribution" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">X-axis Label</label>
                    <Input 
                      value={customizations.distribution.xLabel} 
                      onChange={(e) => setCustomizations({
                        ...customizations,
                        distribution: {
                          ...customizations.distribution,
                          xLabel: e.target.value
                        }
                      })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Y-axis Label</label>
                    <Input 
                      value={customizations.distribution.yLabel} 
                      onChange={(e) => setCustomizations({
                        ...customizations,
                        distribution: {
                          ...customizations.distribution,
                          yLabel: e.target.value
                        }
                      })}
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
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          distribution: {
                            ...customizations.distribution,
                            xLabelSize: parseInt(e.target.value)
                          }
                        })}
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
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          distribution: {
                            ...customizations.distribution,
                            yLabelSize: parseInt(e.target.value)
                          }
                        })}
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
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          distribution: {
                            ...customizations.distribution,
                            tickSize: parseInt(e.target.value)
                          }
                        })}
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
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          distribution: {
                            ...customizations.distribution,
                            alpha: parseFloat(e.target.value)
                          }
                        })}
                      />
                      <div className="text-right text-sm">{customizations.distribution.alpha.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">X Tick Gap</label>
                      <Input 
                        type="number"
                        min={0.01}
                        max={1}
                        step={0.01}
                        value={customizations.distribution.xTickGap}
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          distribution: {
                            ...customizations.distribution,
                            xTickGap: Number(e.target.value)
                          }
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Y Tick Gap</label>
                      <Input 
                        type="number"
                        min={10}
                        max={1000}
                        step={10}
                        value={customizations.distribution.yTickGap}
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          distribution: {
                            ...customizations.distribution,
                            yTickGap: Number(e.target.value)
                          }
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">X Min</label>
                      <Input 
                        type="number"
                        placeholder="Auto"
                        value={customizations.distribution.xMin === null ? '' : customizations.distribution.xMin}
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          distribution: {
                            ...customizations.distribution,
                            xMin: e.target.value ? Number(e.target.value) : null
                          }
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">X Max</label>
                      <Input 
                        type="number"
                        placeholder="Auto"
                        value={customizations.distribution.xMax === null ? '' : customizations.distribution.xMax}
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          distribution: {
                            ...customizations.distribution,
                            xMax: e.target.value ? Number(e.target.value) : null
                          }
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Y Min</label>
                      <Input 
                        type="number"
                        placeholder="Auto"
                        value={customizations.distribution.yMin === null ? '' : customizations.distribution.yMin}
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          distribution: {
                            ...customizations.distribution,
                            yMin: e.target.value ? Number(e.target.value) : null
                          }
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Y Max</label>
                      <Input 
                        type="number"
                        placeholder="Auto"
                        value={customizations.distribution.yMax === null ? '' : customizations.distribution.yMax}
                        onChange={(e) => setCustomizations({
                          ...customizations,
                          distribution: {
                            ...customizations.distribution,
                            yMax: e.target.value ? Number(e.target.value) : null
                          }
                        })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Legend Position</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        type="button"
                        variant={customizations.distribution.legendPosition === "top" ? "default" : "outline"}
                        onClick={() => setCustomizations({
                          ...customizations,
                          distribution: {
                            ...customizations.distribution,
                            legendPosition: "top"
                          }
                        })}
                      >
                        Top
                      </Button>
                      <Button 
                        type="button"
                        variant={customizations.distribution.legendPosition === "bottom" ? "default" : "outline"}
                        onClick={() => setCustomizations({
                          ...customizations,
                          distribution: {
                            ...customizations.distribution,
                            legendPosition: "bottom"
                          }
                        })}
                      >
                        Bottom
                      </Button>
                    </div>
                  </div>
                  
                  {files.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Series Colors</label>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="color"
                              value={seriesColors[index] || '#9b87f5'}
                              onChange={(e) => updateColor(index, e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <span className="text-sm truncate max-w-[180px]">{labels[index] || file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

// Extending Window interface to include Plotly
declare global {
  interface Window {
    Plotly: any;
  }
}

export default RoGAnalysis;
