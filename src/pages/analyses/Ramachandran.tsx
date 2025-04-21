import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const plotTypes = [
  { value: '0', label: 'All' },
  { value: '1', label: 'General' },
  { value: '2', label: 'Glycine' },
  { value: '3', label: 'Proline' },
  { value: '4', label: 'Pre-proline' },
  { value: '5', label: 'Ile-Val' }
];

export default function RamachandranAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [plotType, setPlotType] = useState('0');
  const [iterModels, setIterModels] = useState(false);
  const [modelNumber, setModelNumber] = useState('0');
  const [iterChains, setIterChains] = useState(false);
  const [chainId, setChainId] = useState('A');
  const [saveCsv, setSaveCsv] = useState(false);
  const [fileType, setFileType] = useState('png');
  const [loading, setLoading] = useState(false);
  const [plotImage, setPlotImage] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a PDB file',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('pdb_file', file);
      formData.append('plot_type', plotType);
      formData.append('iter_models', String(iterModels));
      formData.append('model_number', modelNumber);
      formData.append('iter_chains', String(iterChains));
      formData.append('chain_id', chainId);
      formData.append('save_csv', String(saveCsv));
      formData.append('file_type', fileType);

      const response = await fetch('/api/ramachandran', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setPlotImage(`data:image/${data.file_type};base64,${data.plot}`);
      if (data.csv) {
        setCsvData(data.csv);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate plot',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (csvData && file) {
      const blob = new Blob([atob(csvData)], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdb', '')}_ramachandran.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pdb-file">PDB File</Label>
            <Input
              id="pdb-file"
              type="file"
              accept=".pdb"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plot-type">Plot Type</Label>
            <Select value={plotType} onValueChange={setPlotType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {plotTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="iter-models"
                  checked={iterModels}
                  onCheckedChange={setIterModels}
                />
                <Label htmlFor="iter-models">Iterate Models</Label>
              </div>
              {!iterModels && (
                <div className="space-y-2">
                  <Label htmlFor="model-number">Model Number</Label>
                  <Input
                    id="model-number"
                    type="number"
                    min="0"
                    value={modelNumber}
                    onChange={e => setModelNumber(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="iter-chains"
                  checked={iterChains}
                  onCheckedChange={setIterChains}
                />
                <Label htmlFor="iter-chains">Iterate Chains</Label>
              </div>
              {!iterChains && (
                <div className="space-y-2">
                  <Label htmlFor="chain-id">Chain ID</Label>
                  <Input
                    id="chain-id"
                    value={chainId}
                    onChange={e => setChainId(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="save-csv"
                checked={saveCsv}
                onCheckedChange={setSaveCsv}
              />
              <Label htmlFor="save-csv">Save CSV</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-type">File Type</Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={loading || !file} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Plot
              </>
            ) : (
              'Generate Plot'
            )}
          </Button>
        </form>
      </Card>

      {plotImage && (
        <Card className="p-6">
          <div className="space-y-4">
            <img
              src={plotImage}
              alt="Ramachandran Plot"
              className="mx-auto max-w-full"
            />
            {csvData && (
              <Button onClick={downloadCsv} className="w-full">
                Download CSV
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
} 