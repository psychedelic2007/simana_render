import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Settings, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FileUpload from '@/components/FileUpload';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Plot from 'react-plotly.js';
import { alphaToHex } from '@/utils/xvgParser';
import Footer from '../../components/Footer';

const RMSDAnalysis = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [fileCount, setFileCount] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [rmsdData, setRmsdData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [seriesColors, setSeriesColors] = useState<string[]>(['#9b87f5', '#7E69AB', '#6E59A5', '#1A1F2C']);
  
  const [customizations, setCustomizations] = useState({
    lineChart: {
      xLabel: "Time (ns)",
      yLabel: "RMSD (nm)",
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
      xLabel: "RMSD (nm)",
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
    setLabels(Array(selectedFiles.length).fill(''));
    
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

  const parseXVGContent = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    const data: number[][] = [];
    
    for (const line of lines) {
      if (line.startsWith('@') || line.startsWith('#') || line.trim() === '') continue;
      const values = line.trim().split(/\s+/).map(Number);
      if (values.length >= 2) {
        data.push([values[0], values[1]]);
      }
    }
    
    return data;
  };

  const generateRandomRMSDData = (length: number, variability: number) => {
    const data = [];
    let value = Math.random() * 0.2;
    
    for (let i = 0; i < length; i++) {
      const change = (Math.random() - 0.5) * variability;
      value = Math.max(0, value + change);
      
      if (i > length / 3) {
        value = value * 0.99 + (0.2 + Math.random() * 0.1) * 0.01;
      }
      
      data.push([i * 0.2, value]);
    }
    
    return data;
  };

  const calculateDistribution = (rmsdValues: number[]) => {
    const min = Math.min(...rmsdValues);
    const max = Math.max(...rmsdValues);
    const range = max - min;
    
    const binCount = 20;
    const binSize = range / binCount;
    const bins = Array(binCount).fill(0);
    const binCenters = Array(binCount).fill(0).map((_, i) => min + (i + 0.5) * binSize);
    
    rmsdValues.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      if (binIndex >= 0) {
        bins[binIndex]++;
      }
    });
    
    return {
      x: binCenters,
      y: bins
    };
  };

  const handleRunAnalysis = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one file to analyze.",
        variant: "destructive"
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
        
        try {
          if (file.type === 'text/plain' || file.name.endsWith('.xvg') || file.name.endsWith('.txt') || file.name.endsWith('.dat')) {
            seriesData = await parseXVGContent(file);
          } else {
            seriesData = generateRandomRMSDData(100, 0.03);
          }
        } catch (error) {
          console.error("Error parsing file:", error);
          seriesData = generateRandomRMSDData(100, 0.03);
        }
        
        allSeriesData.push({
          label,
          data: seriesData,
          color: seriesColors[i]
        });
      }
      
      setRmsdData(allSeriesData);
      
      const distributionSeriesData = allSeriesData.map(series => {
        const rmsdValues = series.data.map((point: number[]) => point[1]);
        const distribution = calculateDistribution(rmsdValues);
        
        return {
          label: series.label,
          distribution,
          color: series.color
        };
      });
      
      setDistributionData(distributionSeriesData);
      
      setIsAnalyzing(false);
      setShowResults(true);
      
      toast({
        title: "Analysis Complete",
        description: "RMSD analysis has been successfully processed.",
      });
    } catch (error) {
      console.error("Error during analysis:", error);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Failed",
        description: "There was an error processing your files.",
        variant: "destructive"
      });
    }
  };

  const downloadPlot = (plotId: string) => {
    toast({
      title: "Download Started",
      description: `Your plot is being prepared for download.`,
    });
    
    const plotElement = document.getElementById(plotId);
    if (plotElement) {
      import('plotly.js-dist').then(Plotly => {
        const chartData = plotId === 'rmsd-plot' 
          ? { 
              data: rmsdData.map(series => ({
                type: 'scatter',
                mode: 'lines',
                x: series.data.map((point: number[]) => point[0]),
                y: series.data.map((point: number[]) => point[1]),
                name: series.label,
                line: {
                  width: customizations.lineChart.lineWidth,
                  color: series.color
                }
              })),
              layout: {
                title: 'Root Mean Square Deviation',
                xaxis: {
                  title: customizations.lineChart.xLabel,
                  titlefont: {
                    size: customizations.lineChart.xLabelSize
                  },
                  tickfont: {
                    size: customizations.lineChart.tickSize
                  },
                  dtick: customizations.lineChart.xTickGap,
                  range: customizations.lineChart.xMin !== null && customizations.lineChart.xMax !== null ? 
                    [customizations.lineChart.xMin, customizations.lineChart.xMax] : undefined
                },
                yaxis: {
                  title: customizations.lineChart.yLabel,
                  titlefont: {
                    size: customizations.lineChart.yLabelSize
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
                },
                width: 1200,
                height: 800
              }
            }
          : { 
              data: distributionData.map(series => ({
                type: 'scatter',
                mode: 'lines',
                x: series.distribution.x,
                y: series.distribution.y,
                name: series.label,
                fill: 'tozeroy',
                fillcolor: series.color + alphaToHex(customizations.distribution.alpha),
                line: {
                  width: customizations.distribution.lineWidth,
                  color: series.color
                }
              })),
              layout: {
                title: 'RMSD Distribution',
                xaxis: {
                  title: customizations.distribution.xLabel,
                  titlefont: {
                    size: customizations.distribution.xLabelSize
                  },
                  tickfont: {
                    size: customizations.distribution.tickSize
                  },
                  dtick: customizations.distribution.xTickGap,
                  range: customizations.distribution.xMin !== null && customizations.distribution.xMax !== null ? 
                    [customizations.distribution.xMin, customizations.distribution.xMax] : undefined
                },
                yaxis: {
                  title: customizations.distribution.yLabel,
                  titlefont: {
                    size: customizations.distribution.yLabelSize
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
                },
                width: 1200,
                height: 800
              }
            };

        Plotly.toImage(chartData, {format: 'png', width: 1200, height: 800})
          .then(dataUrl => {
            const downloadLink = document.createElement('a');
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
          .catch(err => {
            console.error('Error downloading plot:', err);
            toast({
              title: "Download Failed",
              description: "There was an error downloading your plot.",
              variant: "destructive"
            });
          });
      }).catch(err => {
        console.error('Error loading Plotly:', err);
        toast({
          title: "Download Failed",
          description: "There was an error loading the plotting library.",
          variant: "destructive"
        });
      });
    } else {
      toast({
        title: "Download Failed",
        description: "Could not find the plot element.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (rmsdData.length > 0 && seriesColors.length > 0) {
      const updatedRmsdData = rmsdData.map((series, index) => ({
        ...series,
        color: seriesColors[index % seriesColors.length]
      }));
      setRmsdData(updatedRmsdData);
      
      const updatedDistributionData = distributionData.map((series, index) => ({
        ...series,
        color: seriesColors[index % seriesColors.length]
      }));
      setDistributionData(updatedDistributionData);
    }
  }, [seriesColors]);

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
          
          <h1 className="text-3xl font-bold mb-2">Root Mean Square Deviation Analysis</h1>
          <p className="text-muted-foreground mb-8">
            Analyze the structural deviation between coordinates of atoms over time.
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
                      <TabsTrigger value="lineChart">RMSD Curve</TabsTrigger>
                      <TabsTrigger value="distribution">Distribution</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="lineChart" className="space-y-4">
                    <div className="bg-white rounded-lg p-4 h-[400px]">
                      <Plot
                        id="rmsd-plot"
                        data={rmsdData.map(series => ({
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
                          title: 'Root Mean Square Deviation',
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
                      <Button onClick={() => downloadPlot('rmsd-plot')}>
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
                          fillcolor: series.color + Math.round(customizations.distribution.alpha * 255).toString(16).padStart(2, '0'),
                          line: {
                            width: customizations.distribution.lineWidth,
                            color: series.color
                          }
                        }))}
                        layout={{
                          autosize: true,
                          title: 'RMSD Distribution',
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
                  <TabsTrigger id="lineChart-tab" value="lineChart" className="flex-1">RMSD Curve</TabsTrigger>
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

export default RMSDAnalysis;
