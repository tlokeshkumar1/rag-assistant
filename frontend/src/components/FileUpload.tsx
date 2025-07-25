import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  onUploadComplete?: (uploadedFiles: string[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  files, 
  onFilesChange, 
  maxFiles = 2,
  onUploadComplete
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type === 'text/plain' || 
      file.type === 'application/pdf' || 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.md')
    );

    if (validFiles.length !== droppedFiles.length) {
      setError('Only text, markdown, and PDF files are supported');
      return;
    }

    if (files.length + validFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    onFilesChange([...files, ...validFiles]);
  }, [files, onFilesChange, maxFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    onFilesChange([...files, ...selectedFiles]);
    e.target.value = '';
  }, [files, onFilesChange, maxFiles]);

  const removeFile = useCallback((index: number) => {
    const fileToRemove = files[index];
    const newFiles = files.filter((_, i) => i !== index);
    const newUploadedFiles = uploadedFiles.filter(name => name !== fileToRemove.name);
    
    onFilesChange(newFiles);
    setUploadedFiles(newUploadedFiles);
    onUploadComplete?.(newUploadedFiles);
    setError('');
  }, [files, uploadedFiles, onFilesChange, onUploadComplete]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setError('');
    
    try {
      // Only upload files that haven't been uploaded yet
      const filesToUpload = files.filter(file => !uploadedFiles.includes(file.name));
      
      if (filesToUpload.length === 0) {
        setUploading(false);
        return;
      }
      
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('http://localhost:8000/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        
        return file.name;
      });
      
      const newlyUploaded = await Promise.all(uploadPromises);
      const allUploaded = [...uploadedFiles, ...newlyUploaded];
      setUploadedFiles(allUploaded);
      onUploadComplete?.(allUploaded);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50'
            : files.length >= maxFiles
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".txt,.md,.pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={files.length >= maxFiles}
        />
        
        <div className="space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${
            dragActive ? 'bg-emerald-100' : 'bg-gray-100'
          }`}>
            <Upload className={`w-8 h-8 transition-colors ${
              dragActive ? 'text-emerald-600' : 'text-gray-400'
            }`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {files.length >= maxFiles 
                ? `Maximum ${maxFiles} files reached`
                : 'Drop your files here, or click to browse'
              }
            </p>
            <p className="text-sm text-gray-500">
              Supports TXT, MD, and PDF files • Max {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Selected Files</h3>
            <button
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : uploadedFiles.length === files.length && files.length > 0 ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  All Uploaded
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Files
                </>
              )}
            </button>
          </div>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  {uploadedFiles.includes(file.name) ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                    {uploadedFiles.includes(file.name) && (
                      <span className="ml-2 text-green-600 font-medium">✓ Uploaded</span>
                    )}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => removeFile(index)}
                disabled={uploading}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};