"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Beaker, Download, Loader2, Info, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Default SMILES examples
const defaultSmiles = `CCO   # Ethanol
CN1C=NC2=C1C(=O)N(C(=O)N2C)C   # Caffeine
CC1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(=O)(=O)N)C(F)(F)F   # Celecoxib
CC(C)CC1=CC=C(C=C1)C(C)C(=O)O   # Ibuprofen
COC1=CC2=C(C=C1)C(=O)C(CC2)(C)C   # Nabilone`;

// Define type for invalid SMILES data
interface InvalidSmiles {
  line: number;
  smiles: string;
  error: string;
}

// Define type for molecule data
interface Molecule {
  id: number;
  smiles: string;
  tpsa: number;
  wlogp: number;
  region: string;
  absorption: string;
}

// API function for BOILED-Egg analysis
const analyzeSmiles = async (
  smiles: string,
  customizations: {
    title: string;
    xLabel: string;
    yLabel: string;
    pointSize: number;
    showThresholds: boolean;
    wlogpThreshold: number;
    tpsaThreshold: number;
    labelFontSize: number;
    axisFontSize: number;
    titleFontSize: number;
    dpi: number;
  }
) => {
  try {
    console.log('Original SMILES before sending:', smiles);
    console.log('SMILES length:', smiles.length);
    
    const formData = new FormData();
    formData.append('smiles', smiles);
    
    // Add customization parameters to form data
    formData.append('title', customizations.title);
    formData.append('x_label', customizations.xLabel);
    formData.append('y_label', customizations.yLabel);
    formData.append('point_size', customizations.pointSize.toString());
    formData.append('show_thresholds', customizations.showThresholds.toString());
    formData.append('wlogp_threshold', customizations.wlogpThreshold.toString());
    formData.append('tpsa_threshold', customizations.tpsaThreshold.toString());
    formData.append('label_fontsize', customizations.labelFontSize.toString());
    formData.append('axis_fontsize', customizations.axisFontSize.toString());
    formData.append('title_fontsize', customizations.titleFontSize.toString());
    formData.append('dpi', customizations.dpi.toString());
    
    console.log('FormData created, sending to backend...');
    console.log('FormData SMILES value:', formData.get('smiles'));
    
    const response = await fetch('http://localhost:8000/api/boiled', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Backend response error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Backend error: ${data.error}`);
    }
    
    return {
      plot: data.plot,
      molecules: data.molecules || [],
      invalidSmiles: data.invalid_smiles || [],
      validCount: data.valid_count || 0,
      invalidCount: data.invalid_count || 0
    };
  } catch (error) {
    console.error("Error calling Python backend:", error);
    throw error;
  }
};

// Function to download analysis results as CSV
const downloadCsv = (molecules: Molecule[]) => {
  const headers = ['ID', 'SMILES', 'TPSA', 'WLogP', 'Region', 'Absorption'];
  
  const rows = molecules.map(mol => [
    mol.id,
    `"${mol.smiles}"`,
    mol.tpsa,
    mol.wlogp,
    mol.region,
    `"${mol.absorption}"`
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'boiled_egg_results.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const BoiledEggAnalysis: React.FC = () => {
  // State for input SMILES
  const [smiles, setSmiles] = useState(defaultSmiles);
  
  // State for plot customization
  const [title, setTitle] = useState("BOILED-Egg Plot");
  const [xLabel, setXLabel] = useState("WLogP");
  const [yLabel, setYLabel] = useState("TPSA");
  const [pointSize, setPointSize] = useState(100);
  const [showThresholds, setShowThresholds] = useState(true);
  const [wlogpThreshold, setWlogpThreshold] = useState(5.0);
  const [tpsaThreshold, setTpsaThreshold] = useState(140.0);
  const [labelFontSize, setLabelFontSize] = useState(9);
  const [axisFontSize, setAxisFontSize] = useState(12);
  const [titleFontSize, setTitleFontSize] = useState(14);
  const [dpi, setDpi] = useState(300);
  
  // State for plot results
  const [plotUrl, setPlotUrl] = useState<string | null>(null);
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [invalidSmiles, setInvalidSmiles] = useState<InvalidSmiles[]>([]);
  const [validCount, setValidCount] = useState<number>(0);
  const [invalidCount, setInvalidCount] = useState<number>(0);
  
  // State for UI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTab, setCurrentTab] = useState("input");
  const [error, setError] = useState<string | null>(null);
  
  // Handle analysis submission
  const handleAnalyze = async () => {
    if (!smiles.trim()) {
      setError("Please enter at least one SMILES notation");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeSmiles(smiles, {
        title,
        xLabel,
        yLabel,
        pointSize,
        showThresholds,
        wlogpThreshold,
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
      
      // Switch to results tab
      setCurrentTab("results");
      
    } catch (error) {
      console.error("BOILED-Egg analysis error:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
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
    <div className="py-8">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="mb-4 flex items-center justify-center gap-2 text-3xl font-bold">
            <Beaker className="h-10 w-10 text-blue-600" />
            BOILED-Egg Analysis
          </h1>
          <p className="text-lg">
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
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">SMILES Input</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setSmiles(defaultSmiles)}
                    >
                      Load Examples
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setSmiles(testSmiles)}
                    >
                      Load Test SMILES
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Enter one SMILES notation per line. Comments after # are allowed.
                </p>
                <textarea
                  value={smiles}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    console.log('SMILES input changed, length:', newValue.length);
                    setSmiles(newValue);
                  }}
                  placeholder="Enter SMILES notations here..."
                  className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm h-64 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isAnalyzing}
                />
                <div className="text-xs text-gray-500">
                  Characters: {smiles.length} | Lines: {smiles.split('\n').filter(line => line.trim()).length}
                </div>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">X-Axis Label</label>
                    <input
                      type="text"
                      value={xLabel}
                      onChange={(e) => setXLabel(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Y-Axis Label</label>
                    <input
                      type="text"
                      value={yLabel}
                      onChange={(e) => setYLabel(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Threshold Values</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">WLogP Threshold</label>
                    <input
                      type="number"
                      value={wlogpThreshold}
                      onChange={(e) => setWlogpThreshold(Number(e.target.value))}
                      step={0.1}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      disabled={!showThresholds}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">TPSA Threshold</label>
                    <input
                      type="number"
                      value={tpsaThreshold}
                      onChange={(e) => setTpsaThreshold(Number(e.target.value))}
                      step={1}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      disabled={!showThresholds}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setCurrentTab("input")}
                >
                  Back to Input
                </Button>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || !smiles.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
                  
                  <div className="border border-gray-200 rounded-lg p-4 bg-white flex justify-center overflow-hidden">
                    <img 
                      src={plotUrl} 
                      alt="BOILED-Egg Plot" 
                      className="max-w-full h-auto" 
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-md space-y-2">
                    <p className="font-medium text-blue-900">BOILED-Egg Legend</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-gray-300 mt-1 border border-gray-400"></div>
                        <div>
                          <p className="font-medium text-blue-900">Yellow region (egg white)</p>
                          <p className="text-sm text-blue-800">High probability of passive absorption by the gastrointestinal tract</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-yellow-400 mt-1 border border-yellow-600"></div>
                        <div>
                          <p className="font-medium text-blue-900">Gold region (egg yolk)</p>
                          <p className="text-sm text-blue-800">High probability of brain penetration</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-blue-700 mt-2">
                      <Info className="inline-block h-4 w-4 mr-1" /> 
                      The BOILED-Egg model is based on two descriptors: WLogP (lipophilicity) and TPSA (polar surface area). 
                      Molecules in the "egg white" have high probability of passive absorption in the gastrointestinal tract, 
                      while molecules in the "egg yolk" have high probability of passive brain penetration.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Analysis Results</h2>
                  <div className="flex gap-2">
                    <span className="text-sm text-gray-600">
                      Valid: {validCount} | Invalid: {invalidCount}
                    </span>
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
                </div>
                
                {molecules.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-800">
                          <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">SMILES</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">TPSA</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">WLogP</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Region</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Prediction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {molecules.map((mol) => (
                          <tr key={mol.id} className="hover:bg-gray-800">
                            <td className="border border-gray-300 px-4 py-2">{mol.id}</td>
                            <td className="border border-gray-300 px-4 py-2 font-mono text-xs max-w-xs truncate" title={mol.smiles}>
                              {mol.smiles}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{mol.tpsa.toFixed(2)}</td>
                            <td className="border border-gray-300 px-4 py-2">{mol.wlogp.toFixed(2)}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                mol.region === 'Egg Yolk' ? 'bg-yellow-200 text-yellow-800' :
                                mol.region === 'Egg White' ? 'bg-green-200 text-green-800' :
                                'bg-red-200 text-red-800'
                              }`}>
                                {mol.region}
                              </span>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm">{mol.absorption}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p>No valid molecule data available.</p>
                  </div>
                )}
                
                {invalidSmiles.length > 0 && (
                  <div className="mt-6 p-4 border border-red-200 bg-red-50 rounded-md">
                    <h3 className="text-red-700 font-medium mb-2">Invalid SMILES Notations ({invalidSmiles.length})</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {invalidSmiles.map((invalid) => (
                        <li key={invalid.line} className="text-red-600">
                          Line {invalid.line}: <span className="font-medium">{invalid.error}</span>
                          <br />
                          <code className="font-mono bg-red-100 px-1 text-xs">{invalid.smiles}</code>
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
                    className="bg-blue-600 hover:bg-blue-700 text-white"
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
