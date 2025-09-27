import React, { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { HybridInputProps } from '../../types';

const SwissHybridInput: React.FC<HybridInputProps> = ({ onAnalyze, isProcessing }) => {
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [textContent, setTextContent] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleTextSubmit = () => {
    if (textContent.trim()) {
      onAnalyze({ type: 'text', content: textContent });
    }
  };

  const handleFileSelect = (file: File) => {
    onAnalyze({ type: 'file', file });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'text/plain' || file.type === 'text/html') {
        handleFileSelect(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="swiss-card p-6">
      {/* Input Mode Toggle */}
      <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1 mb-6">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            inputMode === 'text' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
          onClick={() => setInputMode('text')}
          disabled={isProcessing}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Text eingeben
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            inputMode === 'file' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
          onClick={() => setInputMode('file')}
          disabled={isProcessing}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Datei hochladen
        </button>
      </div>

      {/* Text Input Mode */}
      {inputMode === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rechtsdokument oder Fragestellung eingeben
            </label>
            <textarea
              className="swiss-textarea h-64"
              placeholder="Geben Sie hier Ihren Rechtstext ein oder stellen Sie eine Frage..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {textContent.length} Zeichen
            </span>
            <button 
              className="swiss-button flex items-center space-x-2"
              disabled={isProcessing || !textContent.trim()}
              onClick={handleTextSubmit}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analysiere...</span>
                </>
              ) : (
                <span>Analysieren</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* File Upload Mode */}
      {inputMode === 'file' && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-swiss-red bg-red-50' 
              : 'border-slate-300 hover:border-slate-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-swiss-red" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Rechtsdokument hochladen
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                PDF oder DOCX Datei hier ablegen oder auswählen
              </p>
              <p className="text-xs text-slate-500">
                Unterstützte Formate: PDF, DOCX • Max. 10MB
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                className="swiss-button flex items-center space-x-2"
                disabled={isProcessing}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verarbeitung...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Datei auswählen</span>
                  </>
                )}
              </button>
              
              <input
                id="file-input"
                type="file"
                accept=".pdf,.docx,.txt,.html"
                onChange={handleFileInput}
                className="hidden"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwissHybridInput;
