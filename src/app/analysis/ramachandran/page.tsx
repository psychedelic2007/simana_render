"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dna, Download, Info, Loader2, Server } from 'lucide-react';
import { 
  generateRamachandranData, 
  colorscales
} from '@/utils/ramaPlotUtils';
import FileUpload from '@/components/FileUpload';
import { toast } from '@/hooks/use-toast';

const BACKEND_URL = 'https://simana.onrender.com';

const RamaAnalysis = () => {
  // References for download functionality
  const pythonImageRef = useRef<HTMLImageElement>(null);
  
  // State for backend integration
  const [pythonBackendAvailable, setPythonBackendAvailable] = useState(false);
  const [pythonPlotData, setPythonPlotData] = useState<string | null>(null);
  const [isPythonLoading, setIsPythonLoading] = useState(false);
  const [processedFile, setProcessedFile] = useState<string | null>(null);
  const [residueData, setResidueData] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  
  // State for files
  const [files, setFiles] = useState<File[]>([]);
  
  // State for customization options
  const [customization, setCustomization] = useState({
    colorscale: 'viridis',
    title: 'Ramachandran Plot',
    xAxisTitle: 'Phi (φ)',
    yAxisTitle: 'Psi (ψ)',
    fontSize: 12,
    dpi: 300
  });

  // Check if the Python backend is available
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/`);
        const data = await response.json();
        setPythonBackendAvailable(true);
        console.log("Python backend is available:", data);
      } catch (error) {
        console.log("Python backend is not available:", error);
        setPythonBackendAvailable(false);
      }
    };
    
    checkBackend();
  }, []);

  // Handle file upload for Python backend
  const handlePythonFilesSelected = async (selectedFiles: File[]) => {
    if (selectedFiles.length > 0 && pythonBackendAvailable) {
      setFiles(selectedFiles); // Store the files for later use
      setIsPythonLoading(true);
      try {
        const result = await generateRamachandranData(selectedFiles[0], {
          title: customization.title,
          xLabel: customization.xAxisTitle,
          yLabel: customization.yAxisTitle,
          fontSize: customization.fontSize,
          dpi: customization.dpi,
          cmap: customization.colorscale,
          alpha: 0.75
        });
        
        setPythonPlotData(result.plotUrl);
        setResidueData(result.residueData);
        setStatistics(result.statistics);
        setProcessedFile(selectedFiles[0].name);
        
        toast({
          title: "File processed successfully",
          description: `Analyzed ${selectedFiles[0].name} using Python backend`,
        });
      } catch (error) {
        toast({
          title: "Error processing file",
          description: error instanceof Error ? error.message : "Error communicating with Python backend",
          variant: "destructive"
        });
      } finally {
        setIsPythonLoading(false);
      }
    }
  };
  
  // Download Python plot
  const handlePythonDownload = () => {
    if (!pythonPlotData || !pythonImageRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'ramachandran_plot_python.png';
    link.href = pythonPlotData;
    link.click();
  };
  
  // Update customization settings
  const handleCustomizationChange = (key: string, value: any) => {
    setCustomization(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Apply customization changes
  const applyCustomizations = async () => {
    if (files.length > 0) {
      // Use the uploaded file with new customizations
      handlePythonFilesSelected(files);
    } else {
      toast({
        title: "No file uploaded",
        description: "Please upload a PDB file first before applying customizations",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0A0F17] text-white pt-24">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="mb-4 flex items-center justify-center gap-2">
            <Dna className="h-10 w-10 text-simana-blue" />
            Ramachandran Plot Analysis
          </h1>
          <p className="text-lg text-muted-foreground">
            Analyze protein backbone dihedral angles (φ, ψ) to understand secondary structure preferences
          </p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upload PDB File</CardTitle>
                  <CardDescription>
                    Upload a PDB file to generate the Ramachandran plot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pythonBackendAvailable ? (
                    <FileUpload
                      onFilesSelected={handlePythonFilesSelected}
                      acceptedFileTypes=".pdb"
                      maxFiles={1}
                      maxSizeMB={10}
                      buttonText="Upload PDB File"
                      disabled={isPythonLoading}
                    />
                  ) : (
                    <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                      <h3 className="text-amber-800 font-medium mb-2">Backend Not Connected</h3>
                      <p className="text-amber-700 text-sm mb-4">
                        To use the Python backend functionality, please start the backend server first.
                      </p>
                      <ol className="list-decimal pl-5 text-sm text-amber-700 space-y-2">
                        <li>Navigate to the backend directory</li>
                        <li>Install the required dependencies: <code className="bg-amber-100 px-1 rounded">pip install -r requirements.txt</code></li>
                        <li>Start the backend server: <code className="bg-amber-100 px-1 rounded">uvicorn main:app --reload</code></li>
                        <li>The server should start at {BACKEND_URL}</li>
                        <li>Refresh this page</li>
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {pythonBackendAvailable && (
                <Card className="mt-6">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>Ramachandran Plot</CardTitle>
                      <CardDescription>
                        {processedFile ? `Data from: ${processedFile}` : 'Upload a PDB file to generate plot'}
                      </CardDescription>
                    </div>
                    {pythonPlotData && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1" 
                        onClick={handlePythonDownload}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isPythonLoading ? (
                      <div className="flex items-center justify-center h-[600px]">
                        <div className="text-center">
                          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-simana-blue" />
                          <p>Generating plot from Python backend...</p>
                        </div>
                      </div>
                    ) : pythonPlotData ? (
                      <div className="flex justify-center">
                        <img 
                          src={pythonPlotData} 
                          alt="Ramachandran Plot" 
                          className="max-w-full h-auto border border-gray-200 rounded-md"
                          ref={pythonImageRef}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[400px] text-center">
                        <div>
                          <p className="mb-4 text-muted-foreground">No PDB file uploaded yet</p>
                          <p className="text-sm text-muted-foreground">Upload a PDB file to generate the Ramachandran plot</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="xl:col-span-1">
              <Card className="sticky top-32">
                <CardHeader>
                  <CardTitle>About Ramachandran Analysis</CardTitle>
                  <CardDescription>
                    Understanding protein structure through dihedral angles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    The Ramachandran plot shows the distribution of backbone dihedral 
                    angles phi (φ) and psi (ψ) in protein structures. Different regions 
                    of the plot correspond to different secondary structure elements.
                  </p>
                  
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 mt-0.5 text-simana-blue" />
                      <div>
                        <p className="font-medium">Key regions:</p>
                        <ul className="ml-5 mt-1 list-disc space-y-1">
                          <li>
                            <span className="text-rose-500 font-medium">Favored regions</span>: 
                            Most energetically favorable conformations
                          </li>
                          <li>
                            <span className="text-blue-500 font-medium">Allowed regions</span>: 
                            Energetically allowed but less common
                          </li>
                          <li>
                            <span className="text-black font-medium">Outlier regions</span>: 
                            Rare or strained conformations
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Customization Options</h3>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Color Scheme</label>
                        <Select 
                          value={customization.colorscale}
                          onValueChange={(value) => handleCustomizationChange('colorscale', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a colorscale" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorscales.map((scale) => (
                              <SelectItem key={scale} value={scale}>
                                {scale}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Plot Title</label>
                        <input
                          type="text"
                          className="w-full rounded-md border border-input px-3 py-2 text-sm"
                          value={customization.title}
                          onChange={(e) => handleCustomizationChange('title', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">X-Axis Label</label>
                        <input
                          type="text"
                          className="w-full rounded-md border border-input px-3 py-2 text-sm"
                          value={customization.xAxisTitle}
                          onChange={(e) => handleCustomizationChange('xAxisTitle', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Y-Axis Label</label>
                        <input
                          type="text"
                          className="w-full rounded-md border border-input px-3 py-2 text-sm"
                          value={customization.yAxisTitle}
                          onChange={(e) => handleCustomizationChange('yAxisTitle', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Font Size</label>
                        <input
                          type="range"
                          min="8"
                          max="16"
                          step="1"
                          value={customization.fontSize}
                          onChange={(e) => handleCustomizationChange('fontSize', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>8</span>
                          <span>{customization.fontSize}</span>
                          <span>16</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">DPI (Image Quality)</label>
                        <input
                          type="range"
                          min="100"
                          max="600"
                          step="50"
                          value={customization.dpi}
                          onChange={(e) => handleCustomizationChange('dpi', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>100</span>
                          <span>{customization.dpi}</span>
                          <span>600</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={applyCustomizations}
                        disabled={isPythonLoading || files.length === 0}
                        className="w-full"
                      >
                        {files.length === 0 ? 'Upload PDB File First' : 'Apply Customizations'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RamaAnalysis;
