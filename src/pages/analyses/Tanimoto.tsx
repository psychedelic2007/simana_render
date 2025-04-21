import React, { useState } from 'react';
import { GitCompare, FileUp, Terminal, Settings, ExternalLink, Info, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TanimotoCalculator: React.FC = () => {
  const [smiles1, setSmiles1] = useState<string>('');
  const [smiles2, setSmiles2] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [inputMethod, setInputMethod] = useState<'manual' | 'file'>('manual');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedCompounds, setSelectedCompounds] = useState<[number, number]>([0, 1]);
  const [colorScheme, setColorScheme] = useState<string>('Blues');

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setUploadedFile(files[0]);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Process the file content here
        // This will be handled by the backend
      };
      reader.readAsText(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (inputMethod === 'manual') {
        formData.append('smiles1', smiles1);
        formData.append('smiles2', smiles2);
      } else {
        formData.append('file', uploadedFile as File);
      }
      formData.append('color_scheme', colorScheme);

      const response = await fetch('http://localhost:8000/api/tanimoto', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data);
      toast({
        title: "Analysis Complete",
        description: "Tanimoto similarity analysis completed successfully.",
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

  const handleColorSchemeChange = async (value: string) => {
    setColorScheme(value);
    if (results) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        if (inputMethod === 'manual') {
          formData.append('smiles1', smiles1);
          formData.append('smiles2', smiles2);
        } else {
          formData.append('file', uploadedFile as File);
        }
        formData.append('color_scheme', value);

        const response = await fetch('http://localhost:8000/api/tanimoto', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setResults(data);
      } catch (error) {
        console.error("Error updating colormap:", error);
        toast({
          title: "Update Failed",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = () => {
    if (!results?.heatmap_image) return;

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${results.heatmap_image}`;
    link.download = 'tanimoto_similarity.png';
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
            Tanimoto Similarity Calculator
          </h1>
          <p className="text-lg text-muted-foreground">
            Calculate molecular similarity using Tanimoto coefficients
          </p>
        </div>

        <Tabs defaultValue="input" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Input & Analysis</TabsTrigger>
            <TabsTrigger value="results" disabled={!results}>Results</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-8 py-4">
            <div className="flex gap-4 mb-6">
              <Button
                variant={inputMethod === 'manual' ? 'default' : 'outline'}
                onClick={() => setInputMethod('manual')}
              >
                Compare Two SMILES
              </Button>
              <Button
                variant={inputMethod === 'file' ? 'default' : 'outline'}
                onClick={() => setInputMethod('file')}
              >
                Upload File
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {inputMethod === 'manual' ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label htmlFor="smiles1">First SMILES</Label>
                    <textarea
                      id="smiles1"
                      value={smiles1}
                      onChange={(e) => setSmiles1(e.target.value)}
                      className="w-full min-h-[100px] p-2 border rounded-md"
                      placeholder="Enter SMILES notation for first molecule"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="smiles2">Second SMILES</Label>
                    <textarea
                      id="smiles2"
                      value={smiles2}
                      onChange={(e) => setSmiles2(e.target.value)}
                      className="w-full min-h-[100px] p-2 border rounded-md"
                      placeholder="Enter SMILES notation for second molecule"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Label>Upload SMILES File</Label>
                  <FileUpload
                    onFilesSelected={handleFileUpload}
                    acceptedFileTypes=".txt"
                    maxFiles={1}
                    maxSizeMB={5}
                  />
                  {uploadedFile && (
                    <div className="text-sm text-muted-foreground">
                      Uploaded file: {uploadedFile.name}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <Button type="submit" disabled={isLoading || (inputMethod === 'manual' ? (!smiles1.trim() || !smiles2.trim()) : !uploadedFile)}>
                  {isLoading ? (
                    <>
                      <Terminal className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <GitCompare className="mr-2 h-4 w-4" />
                      Calculate Similarity
                    </>
                  )}
                </Button>

                <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Info className="mr-2 h-4 w-4" />
                      About Tanimoto Similarity
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tanimoto Similarity</DialogTitle>
                      <DialogDescription>
                        Understanding molecular similarity
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <p>
                        Tanimoto similarity (also known as Jaccard similarity) is a measure of similarity between two sets.
                        In cheminformatics, it's commonly used to compare molecular fingerprints.
                      </p>
                      <p>
                        The Tanimoto coefficient ranges from 0 to 1, where:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>0 means the molecules share no common features</li>
                        <li>1 means the molecules are identical</li>
                        <li>Values between 0 and 1 indicate partial similarity</li>
                      </ul>
                      <p>
                        This calculator uses Morgan fingerprints (circular fingerprints) with a radius of 2 and 2048 bits
                        to calculate the similarity between molecules.
                      </p>
                    </div>
                    
                    <DialogFooter>
                      <Button onClick={() => setShowInfoDialog(false)}>Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="results" className="space-y-8 py-4">
            {results && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Analysis Results</h2>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Heatmap
                  </Button>
                </div>

                {inputMethod === 'file' && results.similarity_matrix && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label>Color Scheme</Label>
                      <Select
                        value={colorScheme}
                        onValueChange={handleColorSchemeChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select color scheme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Blues">Blues</SelectItem>
                          <SelectItem value="Reds">Reds</SelectItem>
                          <SelectItem value="Greens">Greens</SelectItem>
                          <SelectItem value="Purples">Purples</SelectItem>
                          <SelectItem value="YlOrRd">Yellow-Orange-Red</SelectItem>
                          <SelectItem value="YlGnBu">Yellow-Green-Blue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border p-1 rounded-lg overflow-hidden">
                      <img 
                        src={`data:image/png;base64,${results.heatmap_image}`}
                        alt="Tanimoto Similarity Heatmap"
                        className="max-w-full h-auto"
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Compare Individual Compounds</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>First Compound</Label>
                          <Select
                            value={selectedCompounds[0].toString()}
                            onValueChange={(value) => setSelectedCompounds([parseInt(value), selectedCompounds[1]])}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select compound" />
                            </SelectTrigger>
                            <SelectContent>
                              {results.compounds.map((compound: any, index: number) => (
                                <SelectItem key={index} value={index.toString()}>
                                  {compound.name || `Compound ${index + 1}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Second Compound</Label>
                          <Select
                            value={selectedCompounds[1].toString()}
                            onValueChange={(value) => setSelectedCompounds([selectedCompounds[0], parseInt(value)])}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select compound" />
                            </SelectTrigger>
                            <SelectContent>
                              {results.compounds.map((compound: any, index: number) => (
                                <SelectItem key={index} value={index.toString()}>
                                  {compound.name || `Compound ${index + 1}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="border p-1 rounded-lg overflow-hidden">
                            <img 
                              src={`data:image/png;base64,${results.compounds[selectedCompounds[0]].structure_image}`}
                              alt="First Compound Structure"
                              className="max-w-full h-auto"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="border p-1 rounded-lg overflow-hidden">
                            <img 
                              src={`data:image/png;base64,${results.compounds[selectedCompounds[1]].structure_image}`}
                              alt="Second Compound Structure"
                              className="max-w-full h-auto"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-md font-semibold">Similarity Details</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Property</TableHead>
                              <TableHead>Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Tanimoto Similarity</TableCell>
                              <TableCell>{results.similarity_matrix[selectedCompounds[0]][selectedCompounds[1]].toFixed(3)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Common Substructure</TableCell>
                              <TableCell>
                                {results.compounds[selectedCompounds[0]].common_substructure ? 
                                  "Yes" : "No significant common substructure found"}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                )}

                {inputMethod === 'manual' && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="border p-1 rounded-lg overflow-hidden">
                          <img 
                            src={`data:image/png;base64,${results.compounds[0].structure_image}`}
                            alt="First Molecule Structure"
                            className="max-w-full h-auto"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="border p-1 rounded-lg overflow-hidden">
                          <img 
                            src={`data:image/png;base64,${results.compounds[1].structure_image}`}
                            alt="Second Molecule Structure"
                            className="max-w-full h-auto"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-md font-semibold">Similarity Details</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Property</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Tanimoto Similarity</TableCell>
                            <TableCell>{results.similarity.toFixed(3)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Common Substructure</TableCell>
                            <TableCell>
                              {results.common_substructure ? 
                                "Yes" : "No significant common substructure found"}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TanimotoCalculator; 