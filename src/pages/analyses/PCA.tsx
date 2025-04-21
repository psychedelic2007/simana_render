import React, { useState, useEffect, useRef } from 'react';
import { GitCompare, FileUp, Terminal, Settings, ExternalLink, Info, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import { Slider } from '@/components/ui/slider';
import { performDimensionalityReduction, PCAnalysisOptions, defaultPCAOptions, ComponentOption } from '@/utils/pcaUtils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PCAAnalysis: React.FC = () => {
  // File state
  const [xtcFiles, setXtcFiles] = useState<File[]>([]);
  const [pdbFiles, setPdbFiles] = useState<File[]>([]);
  
  // Analysis state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasResults, setHasResults] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showInfoDialog, setShowInfoDialog] = useState<boolean>(false);
  
  // PCA options
  const [options, setOptions] = useState<PCAnalysisOptions>(defaultPCAOptions);
  
  // Results
  const [variancePlot, setVariancePlot] = useState<string>("");
  const [projectionPlot, setProjectionPlot] = useState<string>("");
  const [nFrames, setNFrames] = useState<number>(0);
  const [nAtoms, setNAtoms] = useState<number>(0);
  const [nComponents70, setNComponents70] = useState<number>(0);
  const [componentOptions, setComponentOptions] = useState<ComponentOption[]>([]);
  
  // Handle file uploads
  const handleXtcFilesSelected = (files: File[]) => {
    setXtcFiles(files);
    // Reset results when files change
    setHasResults(false);
  };
  
  const handlePdbFilesSelected = (files: File[]) => {
    setPdbFiles(files);
    // Reset results when files change
    setHasResults(false);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (xtcFiles.length === 0) {
      toast({
        title: "Missing trajectory file",
        description: "Please upload an XTC trajectory file",
        variant: "destructive"
      });
      return;
    }
    
    if (pdbFiles.length === 0) {
      toast({
        title: "Missing topology file",
        description: "Please upload a PDB topology file",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const results = await performDimensionalityReduction(
        xtcFiles[0],
        pdbFiles[0],
        options
      );
      
      // Update state with results
      setVariancePlot(results.variancePlot);
      setProjectionPlot(results.projectionPlot);
      setNFrames(results.nFrames);
      setNAtoms(results.nAtoms);
      setNComponents70(results.nComponents70);
      setComponentOptions(results.componentOptions);
      setHasResults(true);
      
      toast({
        title: "Analysis Complete",
        description: `Processed ${results.nFrames} frames with ${results.nAtoms} atoms.`,
      });
      
    } catch (error) {
      console.error("Error performing analysis:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle option changes
  const handleMethodChange = (value: string) => {
    setOptions({
      ...options,
      method: value as 'pca' | 'tsne' | 'umap',
      // Reset components when method changes
      comp1: 0,
      comp2: 1
    });
    
    if (hasResults) {
      // Re-run analysis when method changes
      handleUpdateProjection(value as 'pca' | 'tsne' | 'umap', 0, 1);
    }
  };
  
  const handleComp1Change = (value: string) => {
    const comp1 = parseInt(value);
    let comp2 = options.comp2;
    
    // Don't allow same component for both axes
    if (comp1 === comp2) {
      comp2 = (comp2 + 1) % componentOptions.length;
    }
    
    setOptions({
      ...options,
      comp1,
      comp2
    });
    
    if (hasResults) {
      handleUpdateProjection(options.method, comp1, comp2);
    }
  };
  
  const handleComp2Change = (value: string) => {
    const comp2 = parseInt(value);
    let comp1 = options.comp1;
    
    // Don't allow same component for both axes
    if (comp1 === comp2) {
      comp1 = (comp1 + 1) % componentOptions.length;
    }
    
    setOptions({
      ...options,
      comp1,
      comp2
    });
    
    if (hasResults) {
      handleUpdateProjection(options.method, comp1, comp2);
    }
  };
  
  // Handle projection update
  const handleUpdateProjection = async (method: 'pca' | 'tsne' | 'umap', comp1: number, comp2: number) => {
    if (xtcFiles.length === 0 || pdbFiles.length === 0) return;
    
    setIsLoading(true);
    
    try {
      const results = await performDimensionalityReduction(
        xtcFiles[0],
        pdbFiles[0],
        {
          ...options,
          method,
          comp1,
          comp2
        }
      );
      
      // Update state with results
      setProjectionPlot(results.projectionPlot);
      setComponentOptions(results.componentOptions);
      
    } catch (error) {
      console.error("Error updating projection:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save plots as images
  const handleDownloadPlot = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="mb-4 flex items-center justify-center gap-2">
            <GitCompare className="h-10 w-10 text-simana-blue" />
            Dimensionality Reduction
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore your molecular dynamics trajectory using PCA, t-SNE and UMAP
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="upload">Upload & Configure</TabsTrigger>
              <TabsTrigger value="results" disabled={!hasResults}>Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-8 py-4">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Trajectory File (XTC)</h2>
                  <FileUpload
                    onFilesSelected={handleXtcFilesSelected}
                    acceptedFileTypes=".xtc"
                    maxFiles={1}
                    maxSizeMB={100}
                    buttonText="Select XTC file"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Topology File (PDB)</h2>
                  <FileUpload
                    onFilesSelected={handlePdbFilesSelected}
                    acceptedFileTypes=".pdb"
                    maxFiles={1}
                    maxSizeMB={10}
                    buttonText="Select PDB file"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Analysis Options</h2>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show-advanced"
                      checked={showAdvanced}
                      onCheckedChange={setShowAdvanced}
                    />
                    <Label htmlFor="show-advanced">Show Advanced Options</Label>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pca-method">Method</Label>
                      <Select
                        value={options.method}
                        onValueChange={handleMethodChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="pca-method">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pca">PCA (Principal Component Analysis)</SelectItem>
                          <SelectItem value="tsne">t-SNE (t-Distributed Stochastic Neighbor Embedding)</SelectItem>
                          <SelectItem value="umap">UMAP (Uniform Manifold Approximation and Projection)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pca-selection">Atom Selection</Label>
                      <Select
                        value={options.selection}
                        onValueChange={(v) => setOptions({...options, selection: v})}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="pca-selection">
                          <SelectValue placeholder="Select atoms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="backbone">Backbone</SelectItem>
                          <SelectItem value="protein">All Protein</SelectItem>
                          <SelectItem value="name CA">Alpha Carbons</SelectItem>
                          <SelectItem value="protein and not name H*">Heavy Atoms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {showAdvanced && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="pca-stride">Stride (read every nth frame)</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            id="pca-stride"
                            min={1}
                            max={10}
                            step={1}
                            value={[options.stride]}
                            onValueChange={([v]) => setOptions({...options, stride: v})}
                            disabled={isLoading}
                          />
                          <span className="w-8 text-center">{options.stride}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pca-components">Number of Components</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            id="pca-components"
                            min={2}
                            max={20}
                            step={1}
                            value={[options.nComponents]}
                            onValueChange={([v]) => setOptions({...options, nComponents: v})}
                            disabled={isLoading}
                          />
                          <span className="w-8 text-center">{options.nComponents}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pca-dpi">Plot Resolution (DPI)</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            id="pca-dpi"
                            min={72}
                            max={600}
                            step={1}
                            value={[options.dpi]}
                            onValueChange={([v]) => setOptions({...options, dpi: v})}
                            disabled={isLoading}
                          />
                          <span className="w-12 text-center">{options.dpi}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || xtcFiles.length === 0 || pdbFiles.length === 0}
                  className="w-full md:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Terminal className="mr-2 h-4 w-4 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Terminal className="mr-2 h-4 w-4" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </div>
              
              <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Info className="mr-2 h-4 w-4" />
                    About Dimensionality Reduction
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>About Dimensionality Reduction Methods</DialogTitle>
                    <DialogDescription>
                      Understanding PCA, t-SNE, and UMAP for molecular dynamics analysis
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <h3 className="font-semibold">Principal Component Analysis (PCA)</h3>
                    <p>
                      PCA is a linear dimensionality reduction technique that projects high-dimensional 
                      data onto a lower-dimensional space while preserving as much variance as possible. 
                      It finds orthogonal directions (principal components) along which the data varies the most.
                    </p>
                    <p>
                      In molecular dynamics, PCA helps identify the most important motions in a protein 
                      trajectory by finding collective motions that contribute most to overall dynamics.
                    </p>
                    
                    <h3 className="font-semibold">t-SNE (t-Distributed Stochastic Neighbor Embedding)</h3>
                    <p>
                      t-SNE is a non-linear dimensionality reduction technique that works by preserving 
                      pairwise similarities between data points. It&apos;s especially good at visualizing clusters 
                      and preserving local structures in data.
                    </p>
                    <p>
                      For MD trajectories, t-SNE can help identify different conformational states 
                      that may not be apparent with linear methods like PCA.
                    </p>
                    
                    <h3 className="font-semibold">UMAP (Uniform Manifold Approximation and Projection)</h3>
                    <p>
                      UMAP is another non-linear dimensionality reduction technique that often provides better 
                      global structure preservation than t-SNE while maintaining computational efficiency.
                    </p>
                    <p>
                      For MD trajectories, UMAP can be particularly useful for visualizing the overall 
                      conformational landscape and transitions between states.
                    </p>
                    
                    <div className="p-4 border rounded bg-yellow-50 flex gap-2">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Note: Both t-SNE and UMAP are primarily visualization techniques and should not be used 
                        for quantitative analysis of distances between points. PCA components, on the other hand, 
                        have physical meaning as they correspond to collective motions.
                      </p>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button onClick={() => setShowInfoDialog(false)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
            
            <TabsContent value="results" className="space-y-8 py-4">
              {hasResults && (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">PCA Variance Analysis</h2>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Options
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Plot Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDownloadPlot(variancePlot, 'pca_variance.png')}>
                            <Download className="h-4 w-4 mr-2" />
                            Download as PNG
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="border p-1 rounded-lg overflow-hidden">
                      <div className="flex justify-center">
                        <img 
                          src={variancePlot} 
                          alt="PCA Variance Plot" 
                          className="max-w-full h-auto min-h-[300px] w-[800px]"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-md">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="font-semibold">Frames analyzed:</span> {nFrames}
                        </div>
                        <div>
                          <span className="font-semibold">Atoms selected:</span> {nAtoms}
                        </div>
                        <div>
                          <span className="font-semibold">70% variance at:</span> {nComponents70} component(s)
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-8 border-t">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Projection Visualization</h2>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Options
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Plot Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDownloadPlot(projectionPlot, `${options.method}_projection.png`)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download as PNG
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="vis-method">Visualization Method</Label>
                          <Select
                            value={options.method}
                            onValueChange={handleMethodChange}
                            disabled={isLoading}
                          >
                            <SelectTrigger id="vis-method">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pca">PCA</SelectItem>
                              <SelectItem value="tsne">t-SNE</SelectItem>
                              <SelectItem value="umap">UMAP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="comp1-select">X-axis Component</Label>
                          <Select
                            value={options.comp1.toString()}
                            onValueChange={handleComp1Change}
                            disabled={isLoading || componentOptions.length === 0}
                          >
                            <SelectTrigger id="comp1-select">
                              <SelectValue placeholder="Select component" />
                            </SelectTrigger>
                            <SelectContent>
                              {componentOptions.map((comp) => (
                                <SelectItem key={`x-${comp.value}`} value={comp.value.toString()}>
                                  {comp.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="comp2-select">Y-axis Component</Label>
                          <Select
                            value={options.comp2.toString()}
                            onValueChange={handleComp2Change}
                            disabled={isLoading || componentOptions.length === 0}
                          >
                            <SelectTrigger id="comp2-select">
                              <SelectValue placeholder="Select component" />
                            </SelectTrigger>
                            <SelectContent>
                              {componentOptions.map((comp) => (
                                <SelectItem key={`y-${comp.value}`} value={comp.value.toString()}>
                                  {comp.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {isLoading && (
                          <div className="flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="md:col-span-2 border p-1 rounded-lg overflow-hidden">
                        <div className="flex justify-center">
                          <img 
                            src={projectionPlot} 
                            alt={`${options.method.toUpperCase()} Projection Plot`} 
                            className="max-w-full h-auto min-h-[300px] w-[800px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PCAAnalysis;