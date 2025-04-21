
import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import FileUpload from "@/components/FileUpload";
import { toast } from "sonner";
import { calculateContactMap } from "@/utils/contactMapUtils";
import { motion } from "framer-motion";
import { Loader2, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ContactMapAnalysis = () => {
  // File state
  const [pdbFile, setPdbFile] = useState<File | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [contactMapData, setContactMapData] = useState<{
    matrix: number[][];
    plotUrl: string;
    residueCount: number;
  } | null>(null);
  
  // Analysis settings
  const [cutoffDistance, setCutoffDistance] = useState(8.0);
  
  // Customization settings
  const [colorMap, setColorMap] = useState("viridis");
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(1);
  const [xAxisLabel, setXAxisLabel] = useState("Residue Index");
  const [yAxisLabel, setYAxisLabel] = useState("Residue Index");
  const [xTicksGap, setXTicksGap] = useState(10);
  const [yTicksGap, setYTicksGap] = useState(10);
  const [xlimMin, setXlimMin] = useState<number | null>(null);
  const [xlimMax, setXlimMax] = useState<number | null>(null);
  const [ylimMin, setYlimMin] = useState<number | null>(null);
  const [ylimMax, setYlimMax] = useState<number | null>(null);
  const [labelFontSize, setLabelFontSize] = useState(15);
  const [tickLabelSize, setTickLabelSize] = useState(12);
  const [dpi, setDpi] = useState(300);
  
  // Backend status check
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/');
        if (response.ok) {
          const data = await response.json();
          setIsBackendAvailable(true);
          console.log('Backend status:', data.message);
        } else {
          setIsBackendAvailable(false);
        }
      } catch (error) {
        console.error('Cannot connect to backend:', error);
        setIsBackendAvailable(false);
      }
    };
    
    checkBackendStatus();
  }, []);
  
  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setPdbFile(files[0]);
      toast.success(`PDB file selected: ${files[0].name}`);
    } else {
      setPdbFile(null);
    }
  };
  
  const generateContactMap = async () => {
    if (!pdbFile) {
      toast.error("Please upload a PDB file first");
      return;
    }
    
    if (!isBackendAvailable) {
      toast.error("Python backend is not available");
      return;
    }
    
    setIsCalculating(true);
    setBackendError(null);
    
    try {
      const result = await calculateContactMap(
        pdbFile,
        cutoffDistance,
        {
          colorMap,
          minValue,
          maxValue,
          xAxisLabel,
          yAxisLabel,
          xTicksGap,
          yTicksGap,
          xlimMin,
          xlimMax,
          ylimMin,
          ylimMax,
          labelFontSize,
          tickLabelSize,
          dpi
        }
      );
      
      setContactMapData(result);
      toast.success("Contact map generated successfully");
    } catch (error) {
      console.error("Error generating contact map:", error);
      setBackendError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to generate contact map");
    } finally {
      setIsCalculating(false);
    }
  };
  
  const downloadImage = () => {
    if (!contactMapData?.plotUrl) return;
    
    const link = document.createElement('a');
    link.href = contactMapData.plotUrl;
    link.download = `contactmap_${pdbFile?.name.split('.')[0] || 'protein'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const colorMaps = [
    'viridis', 'plasma', 'inferno', 'magma', 'cividis', 
    'Greys', 'Purples', 'Blues', 'Greens', 'Oranges', 'Reds',
    'YlOrBr', 'YlOrRd', 'OrRd', 'PuRd', 'RdPu', 'BuPu', 
    'GnBu', 'PuBu', 'YlGnBu', 'PuBuGn', 'BuGn', 'YlGn',
    'binary', 'gist_yarg', 'gist_gray', 'gray', 'bone',
    'pink', 'spring', 'summer', 'autumn', 'winter', 'cool', 
    'Wistia', 'hot', 'afmhot', 'gist_heat', 'copper',
    'PiYG', 'PRGn', 'BrBG', 'PuOr', 'RdGy', 'RdBu', 'RdYlBu',
    'RdYlGn', 'Spectral', 'coolwarm', 'bwr', 'seismic'
  ];
  
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Map Analysis</h1>
            <p className="text-lg text-muted-foreground">
              Calculate and visualize contact maps for protein structures
            </p>
          </div>
          
          {isBackendAvailable === false && (
            <Alert variant="default" className="mb-6 border-orange-400 bg-orange-100 dark:bg-orange-900/30">
              <AlertDescription className="flex items-center text-orange-700 dark:text-orange-400">
                <span className="mr-2">⚠️</span>
                Python backend not detected. Please make sure the backend server is running at http://localhost:8000
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content area */}
            <div className="lg:col-span-2">
              {/* File upload card */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Upload Files</CardTitle>
                  <CardDescription>
                    Upload a PDB file to generate a contact map
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FileUpload
                      onFilesSelected={handleFilesSelected}
                      acceptedFileTypes=".pdb"
                      maxFiles={1}
                      buttonText="Upload PDB file"
                      disabled={isCalculating}
                    />
                    
                    <div className="space-y-4 pt-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="cutoff-distance">
                            Cutoff Distance (Å)
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Residues with distances below this threshold will be considered in contact
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <Slider 
                            id="cutoff-distance"
                            min={0} 
                            max={20} 
                            step={0.1} 
                            value={[cutoffDistance]} 
                            onValueChange={(value) => setCutoffDistance(value[0])}
                            disabled={isCalculating}
                          />
                          <span className="w-12 text-center">{cutoffDistance}Å</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={generateContactMap}
                        disabled={!pdbFile || isCalculating || !isBackendAvailable}
                        className="w-full"
                      >
                        {isCalculating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          'Generate Contact Map'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Results card */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Map Visualization</CardTitle>
                  <CardDescription>
                    View and download the generated contact map
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {backendError && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription>
                        {backendError}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {contactMapData?.plotUrl ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className="border rounded-lg overflow-hidden">
                        <img 
                          src={contactMapData.plotUrl} 
                          alt="Contact Map" 
                          className="w-full h-auto"
                        />
                      </div>
                      
                      <Button onClick={downloadImage} className="w-full">
                        Download Image
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      {isCalculating ? (
                        <div className="flex flex-col items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin mb-4" />
                          <p>Calculating contact map...</p>
                        </div>
                      ) : (
                        <p>Generate a contact map to see results here</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar for customization options */}
            <div className="lg:col-span-1">
              <Card className="sticky top-32">
                <CardHeader>
                  <CardTitle>Customization Options</CardTitle>
                  <CardDescription>
                    Adjust the appearance of your contact map
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="color-map">Color Map</Label>
                      <Select
                        value={colorMap}
                        onValueChange={setColorMap}
                        disabled={isCalculating}
                      >
                        <SelectTrigger id="color-map">
                          <SelectValue placeholder="Select a color map" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorMaps.map((cmap) => (
                            <SelectItem key={cmap} value={cmap}>{cmap}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="min-value">Minimum Value</Label>
                        <span>{minValue}</span>
                      </div>
                      <Slider
                        id="min-value"
                        min={0}
                        max={1}
                        step={0.1}
                        value={[minValue]}
                        onValueChange={(value) => setMinValue(value[0])}
                        disabled={isCalculating}
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="max-value">Maximum Value</Label>
                        <span>{maxValue}</span>
                      </div>
                      <Slider
                        id="max-value"
                        min={0}
                        max={1}
                        step={0.1}
                        value={[maxValue]}
                        onValueChange={(value) => setMaxValue(value[0])}
                        disabled={isCalculating}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="x-axis-label">X-Axis Label</Label>
                      <Input
                        id="x-axis-label"
                        value={xAxisLabel}
                        onChange={(e) => setXAxisLabel(e.target.value)}
                        disabled={isCalculating}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="y-axis-label">Y-Axis Label</Label>
                      <Input
                        id="y-axis-label"
                        value={yAxisLabel}
                        onChange={(e) => setYAxisLabel(e.target.value)}
                        disabled={isCalculating}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="x-ticks-gap">X-Axis Tick Gap</Label>
                        <Input
                          id="x-ticks-gap"
                          type="number"
                          min={1}
                          value={xTicksGap}
                          onChange={(e) => setXTicksGap(parseInt(e.target.value))}
                          disabled={isCalculating}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="y-ticks-gap">Y-Axis Tick Gap</Label>
                        <Input
                          id="y-ticks-gap"
                          type="number"
                          min={1}
                          value={yTicksGap}
                          onChange={(e) => setYTicksGap(parseInt(e.target.value))}
                          disabled={isCalculating}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="xlim-min">X-Axis Min</Label>
                        <Input
                          id="xlim-min"
                          type="number"
                          value={xlimMin === null ? '' : xlimMin}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : parseInt(e.target.value);
                            setXlimMin(val);
                          }}
                          placeholder="Auto"
                          disabled={isCalculating}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="xlim-max">X-Axis Max</Label>
                        <Input
                          id="xlim-max"
                          type="number"
                          value={xlimMax === null ? '' : xlimMax}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : parseInt(e.target.value);
                            setXlimMax(val);
                          }}
                          placeholder="Auto"
                          disabled={isCalculating}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="ylim-min">Y-Axis Min</Label>
                        <Input
                          id="ylim-min"
                          type="number"
                          value={ylimMin === null ? '' : ylimMin}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : parseInt(e.target.value);
                            setYlimMin(val);
                          }}
                          placeholder="Auto"
                          disabled={isCalculating}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="ylim-max">Y-Axis Max</Label>
                        <Input
                          id="ylim-max"
                          type="number"
                          value={ylimMax === null ? '' : ylimMax}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : parseInt(e.target.value);
                            setYlimMax(val);
                          }}
                          placeholder="Auto"
                          disabled={isCalculating}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="label-font-size">Label Font Size</Label>
                        <Input
                          id="label-font-size"
                          type="number"
                          min={8}
                          max={24}
                          value={labelFontSize}
                          onChange={(e) => setLabelFontSize(parseInt(e.target.value))}
                          disabled={isCalculating}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="tick-label-size">Tick Label Size</Label>
                        <Input
                          id="tick-label-size"
                          type="number"
                          min={8}
                          max={24}
                          value={tickLabelSize}
                          onChange={(e) => setTickLabelSize(parseInt(e.target.value))}
                          disabled={isCalculating}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="dpi">DPI (Resolution)</Label>
                      <Select
                        value={dpi.toString()}
                        onValueChange={(value) => setDpi(parseInt(value))}
                        disabled={isCalculating}
                      >
                        <SelectTrigger id="dpi">
                          <SelectValue placeholder="Select resolution" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100 (Low)</SelectItem>
                          <SelectItem value="300">300 (Medium)</SelectItem>
                          <SelectItem value="600">600 (High)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button
                    onClick={generateContactMap}
                    className="w-full mt-6"
                    disabled={!pdbFile || isCalculating || !isBackendAvailable}
                  >
                    Apply Customizations
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactMapAnalysis;
