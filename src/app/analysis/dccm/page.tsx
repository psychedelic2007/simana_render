"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Network, Download, Loader2, Settings, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import { colorscales } from '@/utils/pcaUtils';

import { calculateDCCM } from '@/utils/dccmParser';

const DCCMAnalysis: React.FC = () => {
  // State for file uploads
  const [pdbFiles, setPdbFiles] = useState<File[]>([]);
  const [xtcFiles, setXtcFiles] = useState<File[]>([]);
  
  // State for plotting options
  const [colormap, setColormap] = useState<string>('viridis');
  const [vmin, setVmin] = useState<number>(-1);
  const [vmax, setVmax] = useState<number>(1);
  const [xlabel, setXlabel] = useState<string>('Residue index');
  const [ylabel, setYlabel] = useState<string>('Residue index');
  const [title, setTitle] = useState<string>('Dynamic Cross-Correlation Matrix');
  const [colorbarLabel, setColorbarLabel] = useState<string>('Correlation Coefficient');
  const [dpi, setDpi] = useState<number>(300);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  
  // State for results
  const [plotUrl, setPlotUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Refs
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Handle file selection
  const handlePdbFilesSelected = (files: File[]) => {
    setPdbFiles(files);
    setIsAnalyzed(false);
    setPlotUrl(null);
  };
  
  const handleXtcFilesSelected = (files: File[]) => {
    setXtcFiles(files);
    setIsAnalyzed(false);
    setPlotUrl(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDebugInfo('');
    
    if (pdbFiles.length === 0 || xtcFiles.length === 0) {
      toast({
        title: "Missing files",
        description: "Please upload both PDB and XTC files",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      setDebugInfo('Starting DCCM calculation...');
      
      const result = await calculateDCCM(
        pdbFiles[0],
        xtcFiles[0],
        {
          colorMap: colormap,
          minValue: vmin,
          maxValue: vmax,
          xAxisLabel: xlabel,
          yAxisLabel: ylabel,
          plotTitle: title,
          showColorbar: true,
          colorbarLabel: colorbarLabel,
          dpi: dpi
        }
      );
      
      setDebugInfo(prev => `${prev}\nData received from backend`);
      
      if (result.plotUrl) {
        setDebugInfo(prev => `${prev}\nPlot URL received: ${result.plotUrl.substring(0, 50)}...`);
        setPlotUrl(result.plotUrl);
        
        // Force image reload if needed
        if (imgRef.current) {
          imgRef.current.src = result.plotUrl + '?t=' + new Date().getTime();
        }
      } else {
        throw new Error('No plot URL received from backend');
      }
      
      setIsAnalyzed(true);
      
      toast({
        title: "Analysis Complete",
        description: "DCCM has been successfully generated"
      });
      
    } catch (error) {
      console.error("DCCM calculation error:", error);
      setDebugInfo(prev => `${prev}\nError: ${error instanceof Error ? error.message : String(error)}`);
      
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Download plot as image
  const handleDownload = () => {
    if (!plotUrl) return;
    
    const link = document.createElement('a');
    link.href = plotUrl;
    link.download = 'dccm_plot.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check image loading status
  const handleImageLoad = () => {
    setDebugInfo(prev => `${prev}\nImage loaded successfully`);
  };
  
  // Handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Error loading image:", e);
    setDebugInfo(prev => `${prev}\nImage failed to load`);
    
    toast({
      title: "Error displaying plot",
      description: "There was an error displaying the DCCM plot. Please try again.",
      variant: "destructive"
    });
  };
  
  return (
    <div className="min-h-screen bg-[#0A0F17] text-white pt-24">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="mb-4 flex items-center justify-center gap-2">
            <Network className="h-10 w-10 text-simana-blue" />
            Dynamic Cross-Correlation Matrix
          </h1>
          <p className="text-lg text-muted-foreground">
            Analyze correlated motions between residues in your protein from MD simulations
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="upload">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="upload">Upload & Settings</TabsTrigger>
              <TabsTrigger value="results" disabled={!isAnalyzed}>Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-8 py-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">PDB File</h2>
                    <FileUpload
                      onFilesSelected={handlePdbFilesSelected}
                      acceptedFileTypes=".pdb"
                      maxFiles={1}
                      maxSizeMB={10}
                      buttonText="Upload PDB file"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">XTC File</h2>
                    <FileUpload
                      onFilesSelected={handleXtcFilesSelected}
                      acceptedFileTypes=".xtc"
                      maxFiles={1}
                      maxSizeMB={100}
                      buttonText="Upload XTC file"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Plot Settings</h2>
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="advanced-settings"
                        checked={showAdvanced}
                        onCheckedChange={setShowAdvanced}
                      />
                      <Label htmlFor="advanced-settings">Advanced</Label>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="colormap">Colormap</Label>
                      <Select
                        value={colormap}
                        onValueChange={setColormap}
                      >
                        <SelectTrigger id="colormap">
                          <SelectValue placeholder="Select colormap" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorscales.map((cs) => (
                            <SelectItem key={cs} value={cs.toLowerCase()}>
                              {cs}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vmin">Min Value</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            id="vmin"
                            min={-1}
                            max={0}
                            step={0.1}
                            value={[vmin]}
                            onValueChange={(val) => setVmin(val[0])}
                          />
                          <span className="text-sm tabular-nums text-muted-foreground min-w-[40px] text-right">
                            {vmin.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vmax">Max Value</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            id="vmax"
                            min={0}
                            max={1}
                            step={0.1}
                            value={[vmax]}
                            onValueChange={(val) => setVmax(val[0])}
                          />
                          <span className="text-sm tabular-nums text-muted-foreground min-w-[40px] text-right">
                            {vmax.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {showAdvanced && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Plot Title</Label>
                            <Input
                              id="title"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="Plot title"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="xlabel">X-axis Label</Label>
                              <Input
                                id="xlabel"
                                value={xlabel}
                                onChange={(e) => setXlabel(e.target.value)}
                                placeholder="X-axis label"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="ylabel">Y-axis Label</Label>
                              <Input
                                id="ylabel"
                                value={ylabel}
                                onChange={(e) => setYlabel(e.target.value)}
                                placeholder="Y-axis label"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="colorbarLabel">Colorbar Label</Label>
                            <Input
                              id="colorbarLabel"
                              value={colorbarLabel}
                              onChange={(e) => setColorbarLabel(e.target.value)}
                              placeholder="Colorbar label"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="dpi">Plot Resolution (DPI)</Label>
                            <div className="flex items-center gap-2">
                              <Slider
                                id="dpi"
                                min={72}
                                max={600}
                                step={1}
                                value={[dpi]}
                                onValueChange={(val) => setDpi(val[0])}
                              />
                              <span className="text-sm tabular-nums text-muted-foreground min-w-[40px] text-right">
                                {dpi}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading || pdbFiles.length === 0 || xtcFiles.length === 0}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Network className="mr-2 h-4 w-4" />
                      Generate DCCM
                    </>
                  )}
                </Button>
              </div>
              
              {debugInfo && (
                <div className="mt-4 p-4 border border-dashed rounded-md bg-muted">
                  <h3 className="text-sm font-medium mb-2">Debug Information:</h3>
                  <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40">
                    {debugInfo}
                  </pre>
                </div>
              )}
            </TabsContent>

            <TabsContent value="results" className="py-6">
              {isAnalyzed && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">DCCM Plot</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleDownload} disabled={!plotUrl}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleSubmit}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden bg-card">
                    <div className="flex justify-center p-4">
                      {plotUrl ? (
                        <img 
                          ref={imgRef}
                          src={plotUrl}
                          alt="Dynamic Cross-Correlation Matrix" 
                          className="max-w-full h-auto"
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          <Network className="mx-auto h-12 w-12 opacity-20 mb-2" />
                          <p>Plot not available</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Understanding DCCM</h3>
                    <p className="text-sm text-muted-foreground">
                      The Dynamic Cross-Correlation Matrix (DCCM) shows correlations between motions of residues in your protein.
                      Positive values (red) indicate residues moving in the same direction, while negative values (blue) show residues
                      moving in opposite directions. Values near zero (white) indicate uncorrelated motions.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DCCMAnalysis;