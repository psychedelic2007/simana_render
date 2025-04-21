
import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  buttonText?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  acceptedFileTypes = '.xvg',
  maxFiles = 5,
  maxSizeMB = 10,
  buttonText,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  const validateFiles = (files: File[]): File[] => {
    return Array.from(files).filter(file => {
      // Check file type
      const fileType = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      const fileTypeValid = acceptedFileTypes.includes(fileType) || acceptedFileTypes === '*';
      
      // Check file size
      const fileSizeValid = file.size <= maxSizeBytes;
      
      if (!fileTypeValid) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive"
        });
      }
      
      if (!fileSizeValid) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the ${maxSizeMB}MB limit.`,
          variant: "destructive"
        });
      }
      
      return fileTypeValid && fileSizeValid;
    });
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const validFiles = validateFiles(Array.from(files));
    if (validFiles.length === 0) return;
    
    const totalFiles = [...selectedFiles, ...validFiles];
    if (totalFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload a maximum of ${maxFiles} files.`,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFiles(totalFiles);
    onFilesSelected(totalFiles);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const validFiles = validateFiles(Array.from(files));
    if (validFiles.length === 0) return;
    
    const totalFiles = [...selectedFiles, ...validFiles];
    if (totalFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload a maximum of ${maxFiles} files.`,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFiles(totalFiles);
    onFilesSelected(totalFiles);
    
    // Reset input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeFile = (indexToRemove: number) => {
    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };
  
  const openFileDialog = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="w-full space-y-4">
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 transition-all duration-200 text-center cursor-pointer',
          isDragging ? 'border-simana-blue bg-simana-lightBlue bg-opacity-30' : 'border-border',
          selectedFiles.length > 0 ? 'py-4' : 'py-12',
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        )}
        onDragEnter={!disabled ? handleDragEnter : undefined}
        onDragLeave={!disabled ? handleDragLeave : undefined}
        onDragOver={!disabled ? handleDragOver : undefined}
        onDrop={!disabled ? handleDrop : undefined}
        onClick={!disabled ? openFileDialog : undefined}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          className="hidden"
          accept={acceptedFileTypes}
          onChange={handleFileInputChange}
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center space-y-3">
          <Upload className="w-10 h-10 text-muted-foreground" />
          <div className="space-y-2">
            <p className="font-medium">
              {buttonText || (isDragging ? 'Drop files here' : 'Drag and drop files here')}
            </p>
            <p className="text-sm text-muted-foreground">
              or <span className="text-simana-blue hover:underline">browse files</span>
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Supports {acceptedFileTypes} files up to {maxSizeMB}MB (max {maxFiles} files)
          </div>
        </div>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="space-y-2 animate-slide-up">
          <p className="text-sm font-medium">Selected files ({selectedFiles.length}/{maxFiles})</p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className="flex items-center justify-between px-4 py-2 rounded-md glass"
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="font-medium text-sm truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button 
                  className="text-muted-foreground hover:text-destructive transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) {
                      removeFile(index);
                    }
                  }}
                  aria-label="Remove file"
                  disabled={disabled}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
