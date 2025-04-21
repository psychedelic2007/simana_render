
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { analyzeBFactor, downloadCSV } from '@/utils/bfactorUtils';
import { Loader2, Download } from 'lucide-react';

interface CurvePlotCustomizations {
  xLabel: string;
  yLabel: string;
  xLabelSize: number;
  yLabelSize: number;
  tickSize: number;
  xTickGap: number;
  yTickGap: number;
  lineWidth: number;
  xTickRotation: number;
  xMin: number | null;
  xMax: number | null;
  yMin: number | null;
  yMax: number | null;
}

interface DistPlotCustomizations {
  xLabel: string;
  yLabel: string;
  xLabelSize: number;
  yLabelSize: number;
  tickSize: number;
  xTickGap: number;
  yTickGap: number;
  xTickRotation: number;
  alpha: number;
  xMin: number | null;
  xMax: number | null;
  yMin: number | null;
  yMax: number | null;
}

const BFactorAnalysis: React.FC = () => {
  const [pdbFile, setPdbFile] = useState<File | null>(null);
  const [showStdDev, setShowStdDev] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [curvePlotImage, setCurvePlotImage] = useState<string>('');
  const [distPlotImage, setDistPlotImage] = useState<string>('');
  const [residueData, setResidueData] = useState<Array<{residue: number; mean_bfactor: number; std_bfactor: number}>>([]);
  
  const [curvePlotCustomizations, setCurvePlotCustomizations] = useState<CurvePlotCustomizations>({
    xLabel: "Residue Number",
    yLabel: "B-factor Mean",
    xLabelSize: 12,
    yLabelSize: 12,
    tickSize: 10,
    xTickGap: 10,
    yTickGap: 0.1,
    lineWidth: 1.5,
    xTickRotation: 0,
    xMin: null,
    xMax: null,
    yMin: null,
    yMax: null,
  });
  
  const [distPlotCustomizations, setDistPlotCustomizations] = useState<DistPlotCustomizations>({
    xLabel: "B-factor",
    yLabel: "Density",
    xLabelSize: 12,
    yLabelSize: 12,
    tickSize: 10,
    xTickGap: 0.1,
    yTickGap: 0.01,
    xTickRotation: 0,
    alpha: 0.5,
    xMin: null,
    xMax: null,
    yMin: null,
    yMax: null,
  });
  
  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setPdbFile(files[0]);
    } else {
      setPdbFile(null);
    }
  };
  
  const handleAnalyze = async () => {
    if (!pdbFile) {
      toast({
        title: "No file selected",
        description: "Please upload a PDB file to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await analyzeBFactor(
        pdbFile,
        showStdDev,
        curvePlotCustomizations,
        distPlotCustomizations
      );
      
      if (result.error) {
        toast({
          title: "Analysis Error",
          description: result.error,
          variant: "destructive"
        });
      } else {
        setCurvePlotImage(result.curve_plot);
        setDistPlotImage(result.dist_plot);
        setResidueData(result.residue_data);
        
        toast({
          title: "Analysis Complete",
          description: `Analyzed ${result.residue_count} residues successfully.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "An unexpected error occurred during analysis.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadCSV = () => {
    if (residueData.length > 0) {
      downloadCSV(residueData);
    } else {
      toast({
        title: "No data available",
        description: "Please analyze a PDB file first.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto pt-32 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content (Left Side) */}
          <div className="flex-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>B-Factor Analysis</CardTitle>
                <CardDescription>
                  Upload a PDB file to analyze B-factors. The analysis includes a residue-wise B-factor plot and a distribution plot.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <FileUpload
                    onFilesSelected={handleFilesSelected}
                    acceptedFileTypes=".pdb"
                    maxFiles={1}
                    maxSizeMB={10}
                    buttonText="Upload PDB File"
                    disabled={isLoading}
                  />
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="showStdDev" 
                      checked={showStdDev}
                      onCheckedChange={(checked) => setShowStdDev(checked === true)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="showStdDev">Show standard deviation</Label>
                  </div>
                  
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={!pdbFile || isLoading} 
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : "Analyze B-Factors"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {(curvePlotImage || distPlotImage) && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    B-factor analysis results for the uploaded PDB file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="curve" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="curve">Residue Plot</TabsTrigger>
                      <TabsTrigger value="dist">Distribution Plot</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="curve" className="space-y-4">
                      {curvePlotImage && (
                        <div className="rounded-lg overflow-hidden bg-card">
                          <img 
                            src={curvePlotImage} 
                            alt="B-factor per Residue Plot" 
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="dist" className="space-y-4">
                      {distPlotImage && (
                        <div className="rounded-lg overflow-hidden bg-card">
                          <img 
                            src={distPlotImage} 
                            alt="B-factor Distribution Plot" 
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  
                  {residueData.length > 0 && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={handleDownloadCSV}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download CSV
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Customization Options (Right Side) */}
          <div className="w-full lg:w-1/3">
            <Card className="sticky top-32">
              <CardHeader>
                <CardTitle>Customization Options</CardTitle>
                <CardDescription>
                  Adjust the visualization parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="curve" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="curve">Residue Plot</TabsTrigger>
                    <TabsTrigger value="dist">Distribution Plot</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="curve" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="curveXLabel">X-axis Label</Label>
                        <Input 
                          id="curveXLabel" 
                          value={curvePlotCustomizations.xLabel}
                          onChange={(e) => setCurvePlotCustomizations({
                            ...curvePlotCustomizations,
                            xLabel: e.target.value
                          })}
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="curveYLabel">Y-axis Label</Label>
                        <Input 
                          id="curveYLabel" 
                          value={curvePlotCustomizations.yLabel}
                          onChange={(e) => setCurvePlotCustomizations({
                            ...curvePlotCustomizations,
                            yLabel: e.target.value
                          })}
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="curveXLabelSize">Label Font Size: {curvePlotCustomizations.xLabelSize}</Label>
                        <Slider 
                          id="curveXLabelSize"
                          min={8}
                          max={24}
                          step={1}
                          value={[curvePlotCustomizations.xLabelSize]}
                          onValueChange={(value) => setCurvePlotCustomizations({
                            ...curvePlotCustomizations,
                            xLabelSize: value[0],
                            yLabelSize: value[0]
                          })}
                          disabled={isLoading}
                          className="my-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="curveTickSize">Tick Label Size: {curvePlotCustomizations.tickSize}</Label>
                        <Slider 
                          id="curveTickSize"
                          min={6}
                          max={20}
                          step={1}
                          value={[curvePlotCustomizations.tickSize]}
                          onValueChange={(value) => setCurvePlotCustomizations({
                            ...curvePlotCustomizations,
                            tickSize: value[0]
                          })}
                          disabled={isLoading}
                          className="my-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="curveXTickGap">X-axis Tick Gap: {curvePlotCustomizations.xTickGap}</Label>
                        <Slider 
                          id="curveXTickGap"
                          min={1}
                          max={50}
                          step={1}
                          value={[curvePlotCustomizations.xTickGap]}
                          onValueChange={(value) => setCurvePlotCustomizations({
                            ...curvePlotCustomizations,
                            xTickGap: value[0]
                          })}
                          disabled={isLoading}
                          className="my-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="curveYTickGap">Y-axis Tick Gap: {curvePlotCustomizations.yTickGap}</Label>
                        <Slider 
                          id="curveYTickGap"
                          min={0.05}
                          max={1}
                          step={0.05}
                          value={[curvePlotCustomizations.yTickGap]}
                          onValueChange={(value) => setCurvePlotCustomizations({
                            ...curvePlotCustomizations,
                            yTickGap: value[0]
                          })}
                          disabled={isLoading}
                          className="my-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="curveLineWidth">Line Width: {curvePlotCustomizations.lineWidth}</Label>
                        <Slider 
                          id="curveLineWidth"
                          min={0.5}
                          max={3}
                          step={0.1}
                          value={[curvePlotCustomizations.lineWidth]}
                          onValueChange={(value) => setCurvePlotCustomizations({
                            ...curvePlotCustomizations,
                            lineWidth: value[0]
                          })}
                          disabled={isLoading}
                          className="my-2"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="curveXMin">X-axis Min</Label>
                          <Input 
                            id="curveXMin" 
                            type="number"
                            value={curvePlotCustomizations.xMin !== null ? curvePlotCustomizations.xMin : ''}
                            onChange={(e) => setCurvePlotCustomizations({
                              ...curvePlotCustomizations,
                              xMin: e.target.value === '' ? null : Number(e.target.value)
                            })}
                            disabled={isLoading}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="curveXMax">X-axis Max</Label>
                          <Input 
                            id="curveXMax" 
                            type="number"
                            value={curvePlotCustomizations.xMax !== null ? curvePlotCustomizations.xMax : ''}
                            onChange={(e) => setCurvePlotCustomizations({
                              ...curvePlotCustomizations,
                              xMax: e.target.value === '' ? null : Number(e.target.value)
                            })}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="curveYMin">Y-axis Min</Label>
                          <Input 
                            id="curveYMin" 
                            type="number"
                            value={curvePlotCustomizations.yMin !== null ? curvePlotCustomizations.yMin : ''}
                            onChange={(e) => setCurvePlotCustomizations({
                              ...curvePlotCustomizations,
                              yMin: e.target.value === '' ? null : Number(e.target.value)
                            })}
                            disabled={isLoading}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="curveYMax">Y-axis Max</Label>
                          <Input 
                            id="curveYMax" 
                            type="number"
                            value={curvePlotCustomizations.yMax !== null ? curvePlotCustomizations.yMax : ''}
                            onChange={(e) => setCurvePlotCustomizations({
                              ...curvePlotCustomizations,
                              yMax: e.target.value === '' ? null : Number(e.target.value)
                            })}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="dist" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="distXLabel">X-axis Label</Label>
                        <Input 
                          id="distXLabel" 
                          value={distPlotCustomizations.xLabel}
                          onChange={(e) => setDistPlotCustomizations({
                            ...distPlotCustomizations,
                            xLabel: e.target.value
                          })}
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="distYLabel">Y-axis Label</Label>
                        <Input 
                          id="distYLabel" 
                          value={distPlotCustomizations.yLabel}
                          onChange={(e) => setDistPlotCustomizations({
                            ...distPlotCustomizations,
                            yLabel: e.target.value
                          })}
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="distXLabelSize">Label Font Size: {distPlotCustomizations.xLabelSize}</Label>
                        <Slider 
                          id="distXLabelSize"
                          min={8}
                          max={24}
                          step={1}
                          value={[distPlotCustomizations.xLabelSize]}
                          onValueChange={(value) => setDistPlotCustomizations({
                            ...distPlotCustomizations,
                            xLabelSize: value[0],
                            yLabelSize: value[0]
                          })}
                          disabled={isLoading}
                          className="my-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="distTickSize">Tick Label Size: {distPlotCustomizations.tickSize}</Label>
                        <Slider 
                          id="distTickSize"
                          min={6}
                          max={20}
                          step={1}
                          value={[distPlotCustomizations.tickSize]}
                          onValueChange={(value) => setDistPlotCustomizations({
                            ...distPlotCustomizations,
                            tickSize: value[0]
                          })}
                          disabled={isLoading}
                          className="my-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="distXTickGap">X-axis Tick Gap: {distPlotCustomizations.xTickGap}</Label>
                        <Slider 
                          id="distXTickGap"
                          min={0.1}
                          max={5}
                          step={0.1}
                          value={[distPlotCustomizations.xTickGap]}
                          onValueChange={(value) => setDistPlotCustomizations({
                            ...distPlotCustomizations,
                            xTickGap: value[0]
                          })}
                          disabled={isLoading}
                          className="my-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="distYTickGap">Y-axis Tick Gap: {distPlotCustomizations.yTickGap}</Label>
                        <Slider 
                          id="distYTickGap"
                          min={0.01}
                          max={0.2}
                          step={0.01}
                          value={[distPlotCustomizations.yTickGap]}
                          onValueChange={(value) => setDistPlotCustomizations({
                            ...distPlotCustomizations,
                            yTickGap: value[0]
                          })}
                          disabled={isLoading}
                          className="my-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="distAlpha">Transparency: {distPlotCustomizations.alpha}</Label>
                        <Slider 
                          id="distAlpha"
                          min={0.1}
                          max={1}
                          step={0.1}
                          value={[distPlotCustomizations.alpha]}
                          onValueChange={(value) => setDistPlotCustomizations({
                            ...distPlotCustomizations,
                            alpha: value[0]
                          })}
                          disabled={isLoading}
                          className="my-2"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="distXMin">X-axis Min</Label>
                          <Input 
                            id="distXMin" 
                            type="number"
                            value={distPlotCustomizations.xMin !== null ? distPlotCustomizations.xMin : ''}
                            onChange={(e) => setDistPlotCustomizations({
                              ...distPlotCustomizations,
                              xMin: e.target.value === '' ? null : Number(e.target.value)
                            })}
                            disabled={isLoading}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="distXMax">X-axis Max</Label>
                          <Input 
                            id="distXMax" 
                            type="number"
                            value={distPlotCustomizations.xMax !== null ? distPlotCustomizations.xMax : ''}
                            onChange={(e) => setDistPlotCustomizations({
                              ...distPlotCustomizations,
                              xMax: e.target.value === '' ? null : Number(e.target.value)
                            })}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="distYMin">Y-axis Min</Label>
                          <Input 
                            id="distYMin" 
                            type="number"
                            value={distPlotCustomizations.yMin !== null ? distPlotCustomizations.yMin : ''}
                            onChange={(e) => setDistPlotCustomizations({
                              ...distPlotCustomizations,
                              yMin: e.target.value === '' ? null : Number(e.target.value)
                            })}
                            disabled={isLoading}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="distYMax">Y-axis Max</Label>
                          <Input 
                            id="distYMax" 
                            type="number"
                            value={distPlotCustomizations.yMax !== null ? distPlotCustomizations.yMax : ''}
                            onChange={(e) => setDistPlotCustomizations({
                              ...distPlotCustomizations,
                              yMax: e.target.value === '' ? null : Number(e.target.value)
                            })}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!pdbFile || isLoading} 
                  className="w-full mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : "Apply Changes"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BFactorAnalysis;
