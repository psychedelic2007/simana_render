"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Type, Download, Loader2, AlertCircle, Beaker, FileUp } from 'lucide-react';
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
import { 
  calculatePairwiseSimilarity, 
  calculateMatrixSimilarity,
  type TanimotoPairwiseResult,
  type TanimotoMatrixResult,
  colorSchemes,
  type ColorScheme
} from '@/utils/tanimotoUtils';

// Default SMILES examples
const defaultSmiles = `CC(=O)OC1=CC=CC=C1C(=O)O
CC(C)CC1=CC=C(C=C1)C(C)C(=O)O
CN1C=NC2=C1C(=O)N(C(=O)N2C)C
CC1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(N)(=O)=O)C(F)(F)F`;

const TanimotoAnalysis = () => {
  // Input method state
  const [inputMethod, setInputMethod] = useState<'pairwise' | 'file'>('pairwise');
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  
  // SMILES input state
  const [smiles1, setSmiles1] = useState('');
  const [smiles2, setSmiles2] = useState('');
  const [smilesList, setSmilesList] = useState(defaultSmiles);
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Results state
  const [pairwiseResult, setPairwiseResult] = useState<TanimotoPairwiseResult | null>(null);
  const [matrixResult, setMatrixResult] = useState<TanimotoMatrixResult | null>(null);
  const [selectedColorScheme, setSelectedColorScheme] = useState<ColorScheme>('Blues');
  
  // Selected compounds for comparison (in matrix mode)
  const [selectedComp1, setSelectedComp1] = useState<string>('1');
  const [selectedComp2, setSelectedComp2] = useState<string>('2');
  
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError(null);
    }
  };

  const handlePairwiseAnalysis = async () => {
    if (!smiles1.trim() || !smiles2.trim()) {
      setError('Please provide SMILES strings for both molecules');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await calculatePairwiseSimilarity(smiles1, smiles2);
      setPairwiseResult(result);
      
      toast({
        title: "Analysis Complete",
        description: `Tanimoto similarity: ${result.similarity.toFixed(3)}`,
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

  const handleMatrixAnalysis = async () => {
    if (!file && !smilesList.trim()) {
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
        const smilesArray = smilesList
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        if (smilesArray.length === 0) {
          throw new Error('No valid SMILES found in input');
        }
        
        input = smilesArray;
      }

      const result = await calculateMatrixSimilarity(input, selectedColorScheme);
      setMatrixResult(result);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${result.valid_indices.length} compound(s)`,
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

  const handleCompareSelected = async () => {
    if (!matrixResult) return;
    
    const idx1 = parseInt(selectedComp1) - 1;
    const idx2 = parseInt(selectedComp2) - 1;
    
    if (idx1 === idx2) {
      setError('Please select different compounds for comparison');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await calculatePairwiseSimilarity(
        matrixResult.smiles_list[idx1],
        matrixResult.smiles_list[idx2]
      );
      setPairwiseResult(result);
      
      toast({
        title: "Comparison Complete",
        description: `Tanimoto similarity: ${result.similarity.toFixed(3)}`,
      });
    } catch (error) {
      console.error('Comparison failed:', error);
      setError(error instanceof Error ? error.message : 'Comparison failed');
      toast({
        title: "Comparison Failed",
        description: error instanceof Error ? error.message : 'An error occurred during comparison',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadHeatmap = () => {
    if (!matrixResult?.heatmap) return;
    
    const link = document.createElement('a');
    link.href = matrixResult.heatmap;
    link.download = 'tanimoto_similarity.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container px-4 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="mb-4">Molecular Tanimoto Similarity Calculator</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Calculate Tanimoto similarity between molecules and visualize common substructures
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker size={20} />
                    Input Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-3 block">Analysis Mode</Label>
                    <RadioGroup
                      value={inputMethod}
                      onValueChange={(value: 'pairwise' | 'file') => setInputMethod(value)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="pairwise" id="pairwise" />
                        <Label htmlFor="pairwise" className="cursor-pointer">Pairwise Comparison</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="file" id="file" />
                        <Label htmlFor="file" className="cursor-pointer">Multiple Compounds</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {inputMethod === 'pairwise' ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="smiles1" className="text-sm font-medium">
                          First Molecule SMILES
                        </Label>
                        <Textarea
                          id="smiles1"
                          placeholder="CC(=O)OC1=CC=CC=C1C(=O)O"
                          value={smiles1}
                          onChange={(e) => setSmiles1(e.target.value)}
                          className="mt-2 h-32 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smiles2" className="text-sm font-medium">
                          Second Molecule SMILES
                        </Label>
                        <Textarea
                          id="smiles2"
                          placeholder="CC(C)CC1=CC=C(C=C1)C(C)C(=O)O"
                          value={smiles2}
                          onChange={(e) => setSmiles2(e.target.value)}
                          className="mt-2 h-32 font-mono text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Input Method
                        </Label>
                        <RadioGroup
                          value={file ? 'file' : 'text'}
                          onValueChange={(value) => {
                            if (value === 'file') {
                              setSmilesList('');
                            } else {
                              setFile(null);
                            }
                          }}
                          className="grid grid-cols-2 gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2 border rounded-lg p-3">
                            <RadioGroupItem value="text" id="text" />
                            <Label htmlFor="text" className="cursor-pointer">Text Input</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-lg p-3">
                            <RadioGroupItem value="file" id="upload" />
                            <Label htmlFor="upload" className="cursor-pointer">Upload File</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {file ? (
                        <div className="space-y-4">
                          <Label htmlFor="file-upload" className="text-sm font-medium">
                            Upload SMILES File
                          </Label>
                          <div className="mt-2">
                            <div className="flex items-center justify-center w-full">
                              <label
                                htmlFor="file-upload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
                              >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-muted-foreground">TXT files only</p>
                                </div>
                                <input
                                  id="file-upload"
                                  type="file"
                                  accept=".txt"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            {file && (
                              <div className="mt-2 p-3 bg-muted rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileUp className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{file.name}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setFile(null)}
                                  className="h-8 px-2"
                                >
                                  Remove
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Label htmlFor="smiles-list" className="text-sm font-medium">
                            SMILES List (one per line)
                          </Label>
                          <Textarea
                            id="smiles-list"
                            placeholder={defaultSmiles}
                            value={smilesList}
                            onChange={(e) => setSmilesList(e.target.value)}
                            className="mt-2 h-64 font-mono text-sm"
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor="color-scheme" className="text-sm font-medium">
                          Heatmap Color Scheme
                        </Label>
                        <Select
                          value={selectedColorScheme}
                          onValueChange={(value: ColorScheme) => setSelectedColorScheme(value)}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(colorSchemes).map((scheme) => (
                              <SelectItem key={scheme} value={scheme}>
                                {scheme}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={inputMethod === 'pairwise' ? handlePairwiseAnalysis : handleMatrixAnalysis}
                    disabled={isAnalyzing || (inputMethod === 'pairwise' ? (!smiles1.trim() || !smiles2.trim()) : (!file && !smilesList.trim()))}
                    className="w-full"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      inputMethod === 'pairwise' ? 'Compare Molecules' : 'Analyze Compounds'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2">
              {inputMethod === 'pairwise' ? (
                // Pairwise Results
                pairwiseResult && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tanimoto Similarity: {pairwiseResult.similarity.toFixed(3)}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {pairwiseResult.has_mcs ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <img 
                                src={pairwiseResult.mol1_image!} 
                                alt="Molecule 1"
                                className="w-full h-auto rounded-lg border"
                              />
                              <p className="text-center mt-2 text-sm text-muted-foreground">
                                Molecule 1 (Common substructure highlighted)
                              </p>
                            </div>
                            <div>
                              <img 
                                src={pairwiseResult.mol2_image!} 
                                alt="Molecule 2"
                                className="w-full h-auto rounded-lg border"
                              />
                              <p className="text-center mt-2 text-sm text-muted-foreground">
                                Molecule 2 (Common substructure highlighted)
                              </p>
                            </div>
                          </div>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              No significant common substructure found
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )
              ) : (
                // Matrix Results
                matrixResult && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Similarity Matrix</CardTitle>
                          <Button onClick={downloadHeatmap} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download Heatmap
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <img 
                          src={matrixResult.heatmap} 
                          alt="Tanimoto Similarity Matrix"
                          className="w-full h-auto rounded-lg border"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Compare Individual Compounds</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>First Compound</Label>
                            <Select
                              value={selectedComp1}
                              onValueChange={setSelectedComp1}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {matrixResult.smiles_list.map((_, index) => (
                                  <SelectItem key={index} value={(index + 1).toString()}>
                                    Compound {index + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Second Compound</Label>
                            <Select
                              value={selectedComp2}
                              onValueChange={setSelectedComp2}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {matrixResult.smiles_list.map((_, index) => (
                                  <SelectItem key={index} value={(index + 1).toString()}>
                                    Compound {index + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button
                          onClick={handleCompareSelected}
                          disabled={isAnalyzing || selectedComp1 === selectedComp2}
                          className="w-full"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Comparing...
                            </>
                          ) : (
                            'Compare Selected Compounds'
                          )}
                        </Button>

                        {pairwiseResult && (
                          <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">
                              Tanimoto Similarity: {pairwiseResult.similarity.toFixed(3)}
                            </h3>
                            {pairwiseResult.has_mcs ? (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <img 
                                    src={pairwiseResult.mol1_image!} 
                                    alt="Molecule 1"
                                    className="w-full h-auto rounded-lg border"
                                  />
                                  <p className="text-center mt-2 text-sm text-muted-foreground">
                                    Compound {selectedComp1} (Common substructure highlighted)
                                  </p>
                                </div>
                                <div>
                                  <img 
                                    src={pairwiseResult.mol2_image!} 
                                    alt="Molecule 2"
                                    className="w-full h-auto rounded-lg border"
                                  />
                                  <p className="text-center mt-2 text-sm text-muted-foreground">
                                    Compound {selectedComp2} (Common substructure highlighted)
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  No significant common substructure found
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )
              )}

              {!pairwiseResult && !matrixResult && (
                <Card className="h-96">
                  <CardContent className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Beaker className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>Enter SMILES data or upload a file to begin analysis</p>
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

export default TanimotoAnalysis; 
