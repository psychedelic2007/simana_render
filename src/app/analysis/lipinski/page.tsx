"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Type, Download, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { analyzeLipinskiCompounds, generateRadarPlot, type LipinskiCompound, type LipinskiAnalysisResult } from '@/utils/lipinskiUtils';
import CompoundDetails from '@/components/lipinski/CompoundDetails';

const LipinskiAnalysis = () => {
  const [inputMethod, setInputMethod] = useState<'file' | 'manual'>('manual');
  const [file, setFile] = useState<File | null>(null);
  const [smilesInput, setSmilesInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<LipinskiAnalysisResult | null>(null);
  const [selectedCompoundIndex, setSelectedCompoundIndex] = useState(0);
  const [radarPlots, setRadarPlots] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file && !smilesInput.trim()) {
      setError('Please provide SMILES input or upload a file');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      let input: string[] | File;
      
      if (inputMethod === 'file' && file) {
        input = file;
      } else {
        const smilesArray = smilesInput
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        if (smilesArray.length === 0) {
          throw new Error('No valid SMILES found in input');
        }
        
        input = smilesArray;
      }

      const result = await analyzeLipinskiCompounds(input, {
        imageSize: 500,
        dpi: 300
      });

      if (!result.compounds || result.compounds.length === 0) {
        throw new Error('No valid compounds found in the analysis');
      }

      setResults(result);
      setSelectedCompoundIndex(0);
      
      // Generate radar plot for the first compound
      if (result.compounds.length > 0) {
        try {
          const radarPlot = await generateRadarPlot(result.compounds[0]);
          setRadarPlots({ 0: radarPlot });
        } catch (radarError) {
          console.warn('Could not generate radar plot:', radarError);
        }
      }

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${result.compounds.length} compound(s)`,
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'An error occurred during analysis',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCompoundSelect = async (index: number) => {
    setSelectedCompoundIndex(index);
    
    // Generate radar plot if not already generated
    if (results && !radarPlots[index]) {
      try {
        const radarPlot = await generateRadarPlot(results.compounds[index]);
        setRadarPlots(prev => ({ ...prev, [index]: radarPlot }));
      } catch (error) {
        console.warn('Could not generate radar plot:', error);
      }
    }
  };

  const downloadCSV = () => {
    if (!results?.csvData) return;
    
    const blob = new Blob([results.csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lipinski_analysis.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0F17] text-white pt-24">
      <div className="container px-4 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="mb-4">Lipinski's Rule of Five Calculator</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Analyze molecular compounds against Lipinski's Rule of Five to assess drug-likeness and oral bioavailability
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type size={20} />
                    Input Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-3 block text-white">Input Method</Label>
                    <RadioGroup
                      value={inputMethod}
                      onValueChange={(value: 'file' | 'manual') => setInputMethod(value)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="manual" id="manual" />
                        <Label htmlFor="manual" className="cursor-pointer text-white">Manual Input</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="file" id="file" />
                        <Label htmlFor="file" className="cursor-pointer text-white">Upload File</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {inputMethod === 'file' ? (
                    <div>
                      <Label htmlFor="file-upload" className="text-sm font-medium text-white">
                        Upload SMILES File
                      </Label>
                      <div className="mt-2">
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".txt"
                          onChange={handleFileUpload}
                          className="cursor-pointer"
                        />
                      </div>
                      {file && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Selected: {file.name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="smiles-input" className="text-sm font-medium text-white">
                        SMILES Notations (one per line)
                      </Label>
                      <Textarea
                        id="smiles-input"
                        placeholder="CCO&#10;CC(=O)O&#10;CC(C)O"
                        value={smilesInput}
                        onChange={(e) => setSmilesInput(e.target.value)}
                        className="mt-2 h-32 font-mono text-sm"
                      />
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!file && !smilesInput.trim())}
                    className="w-full"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Compounds'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2">
              {results ? (
                <div className="space-y-6">
                  {/* Distribution Plot and Download */}
                  {results.compounds.length > 1 && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Property Distributions</CardTitle>
                          {results.csvData && (
                            <Button onClick={downloadCSV} variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Download CSV
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {results.distributionPlot ? (
                          <img 
                            src={results.distributionPlot} 
                            alt="Property Distributions"
                            className="w-full h-auto rounded-lg border"
                          />
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            Distribution plot not available
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Compound Selection */}
                  {results.compounds.length > 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Select Compound for Detailed Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Select
                          value={selectedCompoundIndex.toString()}
                          onValueChange={(value) => handleCompoundSelect(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {results.compounds.map((_, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                Compound {index + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  )}

                  {/* Detailed Compound Analysis */}
                  <CompoundDetails
                    compound={results.compounds[selectedCompoundIndex]}
                    compoundName={`Compound ${selectedCompoundIndex + 1}`}
                    radarPlot={radarPlots[selectedCompoundIndex]}
                  />
                </div>
              ) : (
                <Card className="h-96">
                  <CardContent className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Upload className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>Upload SMILES data or enter manually to begin analysis</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LipinskiAnalysis;
