import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";

const HBondUpload = ({
  files,
  onFilesSelected,
  labels,
  colors,
  onLabelChange,
  onColorChange,
  isAnalyzing,
  onRunAnalysis,
}: {
  files: File[];
  onFilesSelected: (f: File[]) => void;
  labels: string[];
  colors: string[];
  onLabelChange: (i: number, s: string) => void;
  onColorChange: (i: number, c: string) => void;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
}) => (
  <div className="glass rounded-xl p-6 mb-8">
    <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
    <div className="mb-6">
      <FileUpload
        onFilesSelected={onFilesSelected}
        acceptedFileTypes=".dat,.txt,.csv"
        maxFiles={4}
      />
    </div>
    {files.length > 0 && (
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-medium">Custom Labels and Colors</h3>
        {files.map((file, index) => (
          <div key={index} className="flex items-center gap-4">
            <input
              type="color"
              value={colors[index] || "#61b0e6"}
              onChange={(e) => onColorChange(index, e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <Input
              placeholder={`Label for ${file.name}`}
              value={labels[index] || ""}
              onChange={(e) => onLabelChange(index, e.target.value)}
              className="max-w-md"
            />
          </div>
        ))}
      </div>
    )}
    <Button
      className="w-full md:w-auto bg-simana-blue hover:bg-simana-blue/90"
      disabled={isAnalyzing || files.length === 0}
      onClick={onRunAnalysis}
    >
      {isAnalyzing ? (
        <span>
          <svg className="animate-spin inline-block mr-2 h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
          Analyzing...
        </span>
      ) : (
        <>Run Analysis</>
      )}
    </Button>
  </div>
);

export default HBondUpload;