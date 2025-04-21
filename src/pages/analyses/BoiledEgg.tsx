import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Beaker, Download, Loader2, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { analyzeSmiles, downloadCsv } from '@/utils/boiledEggUtils';

// Default SMILES examples
const defaultSmiles = `CCO   # Ethanol
CN1C=NC2=C1C(=O)N(C(=O)N2C)C   # Caffeine
CC1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(=O)(=O)N)C(F)(F)F   # Celecoxib
CC(C)CC1=CC=C(C=C1)C(C)C(=O)O   # Ibuprofen
COC1=CC2=C(C=C1)C(=O)C(CC2)(C)C   # Nabilone`;

// Define type for molecule data
interface Molecule {
  id: number;
  smiles: string;
  tpsa: number;
  wlogp: number;
  region: string;
  absorption: string;
}

const BoiledEggAnalysis: React.FC = () => {
  // State for input SMILES
  const [smiles, setSmiles] = useState(defaultSmiles);
  
  // State for plot customization
  const [title, setTitle] = useState("BOILED-Egg Plot");
  const [xLabel, setXLabel] = useState("WLogP");
  const [yLabel, setYLabel] = useState("TPSA");
  const [pointSize, setPointSize] = useState(100);
  const [showThresholds, setShowThresholds] = useState(true);
  const [wlogpMin, setWlogpMin] = useState(0.0);
  const [wlogpMax, setWlogpMax] = useState(10.0);
  const [wlogpThreshold, setWlogpThreshold] = useState(5.0);
  const [tpsaMin, setTpsaMin] = useState(0.0);
  const [tpsaMax, setTpsaMax] = useState(200.0);
  const [tpsaThreshold, setTpsaThreshold] = useState(140.0);
  const [labelFontSize, setLabelFontSize] = useState(9);
  const [axisFontSize, setAxisFontSize] = useState(12);
  const [titleFontSize, setTitleFontSize] = useState(14);
  const [dpi, setDpi] = useState(300);
  
  // State for plot results
  const [plotUrl, setPlotUrl] = useState<string | null>(null);
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [invalidSmiles, setInvalidSmiles] = useState<Array<[number, string]>>([]);
  const [validCount, setValidCount] = useState<number>(0);
  const [invalidCount, setInvalidCount] = useState<number>(0);
  
  // State for UI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [currentTab, setCurrentTab] = useState("input");
  
  // Handle analysis submission
  const handleAnalyze = async () => {
    if (!smiles.trim()) {
      toast({
        title: "No SMILES provided",
        description: "Please enter at least one SMILES notation",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeSmiles(smiles, {
        title,
        xLabel,
        yLabel,
        pointSize,
        showThresholds,
        wlogpMin,
        wlogpMax,
        wlogpThreshold,
        tpsaMin,
        tpsaMax,
        tpsaThreshold,
        labelFontSize,
        axisFontSize,
        titleFontSize,
        dpi
      });
      
      setPlotUrl(result.plot);
      setMolecules(result.molecules);
      setInvalidSmiles(result.invalidSmiles);
      setValidCount(result.validCount);
      setInvalidCount(result.invalidCount);
      
      // Show toast with analysis result
      if (result.invalidCount > 0) {
        toast({
          title: "Analysis completed with warnings",
          description: `Processed ${result.validCount} valid SMILES. ${result.invalidCount} invalid SMILES detected.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Analysis completed",
          description: `Successfully processed ${result.validCount} SMILES notations.`
        });
      }
      
      // Switch to results tab
      setCurrentTab("results");
      
    } catch (error) {
      console.error("BOILED-Egg analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle download of results
  const handleDownload = () => {
    if (molecules.length > 0) {
      downloadCsv(molecules);
    }
  };
  
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="mb-4 flex items-center justify-center gap-2">
            <Beaker className="h-10 w-10 text-simana-blue" />
            BOILED-Egg Analysis
          </h1>
          <p className="text-lg text-muted-foreground">
            Predict gastrointestinal absorption and brain penetration of small molecules
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="options" disabled={isAnalyzing}>Options</TabsTrigger>
              <TabsTrigger value="results" disabled={!plotUrl}>Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="input" className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">SMILES Input</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setSmiles(defaultSmiles)}
                  >
                    Load Examples
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Enter one SMILES notation per line. Comments after # are allowed.
                </p>
                <Textarea
                  value={smiles}
                  onChange={(e) => setSmiles(e.target.value)}
                  placeholder="Enter SMILES notations here..."
                  className="font-mono h-64"
                  disabled={isAnalyzing}
                />
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentTab("options")}
                  disabled={isAnalyzing}
                >
                  Customize Options
                </Button>
                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !smiles.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Run Analysis'
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="options" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Plot Title and Labels</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">X-Axis Label</label>
                    <input
                      type="text"
                      value={xLabel}
                      onChange={(e) => setXLabel(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Y-Axis Label</label>
                    <input
                      type="text"
                      value={yLabel}
                      onChange={(e) => setYLabel(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Font Sizes and Resolution</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title Font Size</label>
                    <input
                      type="number"
                      value={titleFontSize}
                      onChange={(e) => setTitleFontSize(Number(e.target.value))}
                      min={8}
                      max={24}
                      step={1}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Axis Font Size</label>
                    <input
                      type="number"
                      value={axisFontSize}
                      onChange={(e) => setAxisFontSize(Number(e.target.value))}
                      min={6}
                      max={18}
                      step={1}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Label Font Size</label>
                    <input
                      type="number"
                      value={labelFontSize}
                      onChange={(e) => setLabelFontSize(Number(e.target.value))}
                      min={6}
                      max={16}
                      step={1}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">DPI (Resolution)</label>
                    <input
                      type="number"
                      value={dpi}
                      onChange={(e) => setDpi(Number(e.target.value))}
                      min={72}
                      max={600}
                      step={1}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-4">
                  <h3 className="font-semibold">Plot Settings</h3>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show Threshold Lines</label>
                    <Switch
                      checked={showThresholds}
                      onCheckedChange={setShowThresholds}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Point Size</label>
                    <input
                      type="number"
                      value={pointSize}
                      onChange={(e) => setPointSize(Number(e.target.value))}
                      min={20}
                      max={200}
                      step={10}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Threshold Values</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">WLogP Min</label>
                      <input
                        type="number"
                        value={wlogpMin}
                        onChange={(e) => setWlogpMin(Number(e.target.value))}
                        step={0.1}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">WLogP Max</label>
                      <input
                        type="number"
                        value={wlogpMax}
                        onChange={(e) => setWlogpMax(Number(e.target.value))}
                        step={0.1}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">WLogP Threshold</label>
                      <input
                        type="number"
                        value={wlogpThreshold}
                        onChange={(e) => setWlogpThreshold(Number(e.target.value))}
                        step={0.1}
                        className="w-full p-2 border rounded"
                        disabled={!showThresholds}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">TPSA Min</label>
                      <input
                        type="number"
                        value={tpsaMin}
                        onChange={(e) => setTpsaMin(Number(e.target.value))}
                        step={1}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">TPSA Max</label>
                      <input
                        type="number"
                        value={tpsaMax}
                        onChange={(e) => setTpsaMax(Number(e.target.value))}
                        step={1}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">TPSA Threshold</label>
                      <input
                        type="number"
                        value={tpsaThreshold}
                        onChange={(e) => setTpsaThreshold(Number(e.target.value))}
                        step={1}
                        className="w-full p-2 border rounded"
                        disabled={!showThresholds}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentTab("input")}
                >
                  Back to Input
                </Button>
                <Button onClick={handleAnalyze} disabled={isAnalyzing || !smiles.trim()}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Run Analysis'
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="space-y-8">
              {plotUrl && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">BOILED-Egg Plot</h2>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = plotUrl;
                        link.download = 'boiled_egg_plot.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Plot
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-2 bg-white flex justify-center overflow-hidden">
                    <img 
                      src={plotUrl} 
                      alt="BOILED-Egg Plot" 
                      className="max-w-full h-auto" 
                    />
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md space-y-2">
                    <p className="font-medium">BOILED-Egg Legend</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-yellow-200 mt-1"></div>
                        <div>
                          <p className="font-medium">Yellow region (egg white)</p>
                          <p className="text-sm">High probability of passive absorption by the gastrointestinal tract</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-white border mt-1"></div>
                        <div>
                          <p className="font-medium">White region (egg yolk)</p>
                          <p className="text-sm">High probability of brain penetration, but likely P-gp substrate</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2">
                      <Info className="inline-block h-4 w-4 mr-1" /> 
                      The BOILED-Egg model is based on two descriptors: WLogP (lipophilicity) and TPSA (polar surface area). 
                      Molecules in the &quot;egg white&quot; have high probability of passive absorption in the gastrointestinal tract, 
                      while molecules in the &quot;egg yolk&quot; have high probability of passive brain penetration.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Molecules Analysis</h2>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={molecules.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </div>
                
                {molecules.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border px-4 py-2 text-left">ID</th>
                          <th className="border px-4 py-2 text-left">SMILES</th>
                          <th className="border px-4 py-2 text-left">TPSA</th>
                          <th className="border px-4 py-2 text-left">WLogP</th>
                          <th className="border px-4 py-2 text-left">Region</th>
                          <th className="border px-4 py-2 text-left">Prediction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {molecules.map((mol) => (
                          <tr key={mol.id} className="hover:bg-muted/50">
                            <td className="border px-4 py-2">{mol.id}</td>
                            <td className="border px-4 py-2 font-mono text-xs">{mol.smiles}</td>
                            <td className="border px-4 py-2">{mol.tpsa.toFixed(2)}</td>
                            <td className="border px-4 py-2">{mol.wlogp.toFixed(2)}</td>
                            <td className="border px-4 py-2">{mol.region}</td>
                            <td className="border px-4 py-2">{mol.absorption}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted/50 rounded-lg">
                    <p>No valid molecule data available.</p>
                  </div>
                )}
                
                {invalidSmiles.length > 0 && (
                  <div className="mt-6 p-4 border border-red-200 bg-red-50 rounded-md">
                    <h3 className="text-red-700 font-medium mb-2">Invalid SMILES Notations ({invalidSmiles.length})</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {invalidSmiles.map(([index, smiles]) => (
                        <li key={index} className="text-red-600">
                          Line {index}: <code className="font-mono bg-red-100 px-1">{smiles}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("input")}
                  >
                    Back to Input
                  </Button>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !smiles.trim()}
                  >
                    Run Analysis Again
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BoiledEggAnalysis;