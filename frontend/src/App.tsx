import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ChatInterface } from './components/ChatInterface';
import { MessageCircle, FileText, Sparkles } from 'lucide-react';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleUploadComplete = (uploadedFileNames: string[]) => {
    setUploadedFiles(uploadedFileNames);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RAG Assistant</h1>
                <p className="text-sm text-gray-600">Intelligent document analysis and chat</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{files.length}/2 files</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>Ready to chat</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
          
          {/* File Upload Section */}
          <div className="lg:col-span-1 space-y-6 h-full overflow-y-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="mb-6 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Documents
                </h2>
                <p className="text-sm text-gray-600">
                  Upload up to 2 files to enhance our conversation with relevant context.
                </p>
              </div>
              
              <div className="flex-1 min-h-0">
                <FileUpload 
                  files={files} 
                  onFilesChange={setFiles}
                  onUploadComplete={handleUploadComplete}
                  maxFiles={2}
                />
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-2">How it works</h3>
              <ul className="text-sm space-y-2 opacity-90">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></span>
                  Upload your documents (optional)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></span>
                  Ask questions or start a conversation
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></span>
                  Get intelligent responses based on your content
                </li>
              </ul>
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-2 h-full">
            <ChatInterface files={files} uploadedFiles={uploadedFiles} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;