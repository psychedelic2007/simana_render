import React, { useState } from 'react';
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const LipinskiCalculator: React.FC = () => {
  const [smiles, setSmiles] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedCompound, setSelectedCompound] = useState<number>(0);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [inputMethod, setInputMethod] = useState<'manual' | 'file'>('manual');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setUploadedFile(files[0]);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setSmiles(content);
      };
      reader.readAsText(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('smiles', smiles);
      formData.append('include_radar', 'true');
      formData.append('include_distributions', inputMethod === 'file' ? 'true' : 'false');

      const response = await fetch('http://localhost:8000/api/lipinski', {
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
        description: `Processed ${data.compounds.length} compounds.`,
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

  const handleDownload = () => {
    if (!results?.zip_data) return;

    const link = document.createElement('a');
    link.href = `data:application/zip;base64,${results.zip_data}`;
    link.download = 'lipinski_analysis.zip';
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
            Lipinski's Rule of Five Calculator
          </h1>
          <p className="text-lg text-muted-foreground">
            Analyze molecular properties and drug-likeness using Lipinski's Rule of Five
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
                Manual Input
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
                <div className="space-y-4">
                  <Label htmlFor="smiles">Enter SMILES Notations</Label>
                  <textarea
                    id="smiles"
                    value={smiles}
                    onChange={(e) => setSmiles(e.target.value)}
                    className="w-full min-h-[200px] p-2 border rounded-md"
                    placeholder="Enter SMILES notations (one per line)&#10;Example:&#10;CC(=O)OC1=CC=CC=C1C(=O)O # Aspirin&#10;CC1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(=O)(=O)N)C(F)(F)F # Celecoxib"
                  />
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
                <Button type="submit" disabled={isLoading || !smiles.trim()}>
                  {isLoading ? (
                    <>
                      <Terminal className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <GitCompare className="mr-2 h-4 w-4" />
                      Analyze Compounds
                    </>
                  )}
                </Button>

                <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Info className="mr-2 h-4 w-4" />
                      About Lipinski's Rules
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Lipinski's Rule of Five</DialogTitle>
                      <DialogDescription>
                        Understanding drug-likeness criteria
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <p>
                        Lipinski's Rule of Five is a set of guidelines used to evaluate drug-likeness of chemical compounds.
                        The rules state that, in general, an orally active drug has:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Molecular weight ≤ 500</li>
                        <li>No more than 5 hydrogen bond donors</li>
                        <li>No more than 10 hydrogen bond acceptors</li>
                        <li>LogP ≤ 5</li>
                      </ul>
                      <p>
                        Compounds that violate more than one of these rules may have problems with bioavailability.
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
                    Download All Data
                  </Button>
                </div>

                {inputMethod === 'file' && results.compounds.length > 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Property Distributions</h3>
                    <div className="border p-1 rounded-lg overflow-hidden">
                      <img 
                        src={`data:image/png;base64,${results.plots.distributions}`}
                        alt="Property Distributions"
                        className="max-w-full h-auto"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Compound Details</h3>
                  {results.compounds.length > 1 && (
                    <Select
                      value={selectedCompound.toString()}
                      onValueChange={(value) => setSelectedCompound(parseInt(value))}
                    >
                      <SelectTrigger className="w-[200px]">
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
                  )}

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="border p-1 rounded-lg overflow-hidden">
                        <img 
                          src={`data:image/png;base64,${results.compounds[selectedCompound].structure_image}`}
                          alt="2D Structure"
                          className="max-w-full h-auto"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="border p-1 rounded-lg overflow-hidden">
                        <img 
                          src={`data:image/png;base64,${results.plots.radar}`}
                          alt="Radar Plot"
                          className="max-w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-md font-semibold">Detailed Properties</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(results.compounds[selectedCompound]).map(([key, value]) => {
                          if (key === 'structure_image' || key === 'name') return null;
                          return (
                            <TableRow key={key}>
                              <TableCell className="font-medium">{key}</TableCell>
                              <TableCell>
                                {typeof value === 'object' 
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LipinskiCalculator; 