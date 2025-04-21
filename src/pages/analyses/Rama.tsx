import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dna, Download, Info, Loader2, Server } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { toast } from '@/hooks/use-toast';

const BACKEND_URL = 'http://localhost:8000';

const RamaAnalysis = () => {
  // References for download functionality
  const pythonImageRef = useRef<HTMLImageElement>(null);
  
  // State for backend integration
  const [pythonBackendAvailable, setPythonBackendAvailable] = useState(false);
  const [pythonPlotData, setPythonPlotData] = useState<string | null>(null);
  const [isPythonLoading, setIsPythonLoading] = useState(false);
  const [processedFile, setProcessedFile] = useState<string | null>(null);
  
  // State for files
  const [files, setFiles] = useState<File[]>([]);
  
  // State for customization options
  const [customization, setCustomization] = useState({
    colorscale: 'Viridis',
    opacity: 0.75,
    showRegions: true,
    showContours: true,
    pointSize: 6,
    title: 'Ramachandran Plot',
    xAxisTitle: 'Phi (φ)',
    yAxisTitle: 'Psi (ψ)',
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
      setIsPythonLoading(true);
      try {
        const formData = new FormData();
        formData.append('pdb_file', selectedFiles[0]);
        
        const response = await fetch(`${BACKEND_URL}/api/ramachandran`, {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setPythonPlotData(data.plot);
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
  
  // Generate default Python plot
  const generateDefaultPythonPlot = async () => {
    if (!pythonBackendAvailable) return;
    
    setIsPythonLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/ramachandran`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setPythonPlotData(data.plot);
      setProcessedFile(null);
      
      toast({
        title: "Default plot generated",
        description: "Using Python backend",
      });
    } catch (error) {
      toast({
        title: "Error generating plot",
        description: error instanceof Error ? error.message : "Error communicating with Python backend",
        variant: "destructive"
      });
    } finally {
      setIsPythonLoading(false);
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
  
  return (
    <div className="min-h-screen pt-32 pb-20">
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
                  <CardTitle>File Upload</CardTitle>
                  <CardDescription>
                    Upload a PDB file to generate a Ramachandran plot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFilesSelected={handlePythonFilesSelected}
                    acceptedFileTypes=".pdb"
                    maxFiles={1}
                    maxSizeMB={10}
                  />
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Ramachandran Plot (Python)</CardTitle>
                    <CardDescription>
                      {processedFile ? `Data from: ${processedFile}` : 'Default Ramachandran plot'}
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
                        <p className="mb-4 text-muted-foreground">No plot generated yet</p>
                        <Button onClick={generateDefaultPythonPlot}>
                          Generate Default Plot
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                  
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 mt-0.5 text-simana-blue" />
                    <div>
                      <p className="font-medium">Available analyses:</p>
                      <ul className="ml-5 mt-1 list-disc space-y-1">
                        <li>
                          <span className="font-medium">Ramachandran Plots</span>: 
                          Using the RamachanDraw package
                        </li>
                        <li>
                          <span className="font-medium">Lipinski Rule of Five</span>: 
                          Drug-likeness evaluation
                        </li>
                        <li>
                          <span className="font-medium">Tanimoto Similarity</span>: 
                          Chemical structure comparison
                        </li>
                        <li>
                          <span className="font-medium">BOILED-Egg Model</span>: 
                          Permeability and absorption prediction
                        </li>
                      </ul>
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
