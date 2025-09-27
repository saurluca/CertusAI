import React, { useState } from 'react';
import { BarChart, Users, FileText, TrendingUp, Tag, Bot } from 'lucide-react';
import { AnalyticsDashboard, DocumentAnalysis, AITag } from '../../types';

interface AdminDashboardProps {
  analytics: AnalyticsDashboard | null;
  onBatchAnalysis: (documentIds: string[]) => void;
}

interface AITaggingInterfaceProps {
  onTagsGenerated: (tags: AITag[]) => void;
}

const AITaggingInterface: React.FC<AITaggingInterfaceProps> = ({ onTagsGenerated }) => {
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [generatedTags, setGeneratedTags] = useState<AITag[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTags = async () => {
    if (!selectedDocument) return;
    
    setIsGenerating(true);
    try {
      const { apiService } = await import('../../services/api');
      const result = await apiService.generateTags(selectedDocument);
      setGeneratedTags(result.ai_tags);
      onTagsGenerated(result.ai_tags);
    } catch (error) {
      console.error('Tag generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Dokument auswählen
        </label>
        <select 
          className="swiss-input"
          value={selectedDocument}
          onChange={(e) => setSelectedDocument(e.target.value)}
        >
          <option value="">Dokument wählen...</option>
          <option value="doc1">Bundesverfassung</option>
          <option value="doc2">ZGB Art. 1-20</option>
          <option value="doc3">Datenschutzgesetz</option>
        </select>
      </div>
      
      <button
        onClick={handleGenerateTags}
        disabled={!selectedDocument || isGenerating}
        className="swiss-button w-full flex items-center justify-center space-x-2"
      >
        {isGenerating ? (
          <>
            <Bot className="w-4 h-4 animate-pulse" />
            <span>Generiere Tags...</span>
          </>
        ) : (
          <>
            <Tag className="w-4 h-4" />
            <span>KI-Tags generieren</span>
          </>
        )}
      </button>

      {generatedTags.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900">Generierte Tags:</h4>
          <div className="space-y-2">
            {Object.entries(
              generatedTags.reduce((acc, tag) => {
                if (!acc[tag.category]) acc[tag.category] = [];
                acc[tag.category].push(tag);
                return acc;
              }, {} as Record<string, AITag[]>)
            ).map(([category, tags]) => (
              <div key={category} className="bg-slate-50 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-slate-700 mb-2">
                  {category}:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="swiss-badge swiss-badge-blue flex items-center space-x-1"
                    >
                      <span>{tag.name}</span>
                      <span className="text-blue-600">({tag.confidence}%)</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ analytics, onBatchAnalysis }) => {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [batchAnalysisResults, setBatchAnalysisResults] = useState<DocumentAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleBatchAnalysis = async () => {
    if (selectedDocuments.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const { apiService } = await import('../../services/api');
      const results = await apiService.analyzeBatch(selectedDocuments);
      setBatchAnalysisResults(results.analyses);
      onBatchAnalysis(selectedDocuments);
    } catch (error) {
      console.error('Batch analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDocumentSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedDocuments(selected);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <span className="mr-3 w-10 h-10 bg-swiss-red rounded-full flex items-center justify-center">
              <span className="text-white font-bold">CH</span>
            </span>
            CertusAI - Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Dokumentenanalyse und KI-gesteuerte Verschlagwortung
          </p>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analytics && (
            <>
              <div className="swiss-card p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-swiss-red mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Gesamte Dokumente</h3>
                    <p className="text-3xl font-bold text-slate-900">{analytics.total_documents}</p>
                  </div>
                </div>
              </div>
              <div className="swiss-card p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Heute analysiert</h3>
                    <p className="text-3xl font-bold text-blue-600">{analytics.analyzed_today}</p>
                  </div>
                </div>
              </div>
              <div className="swiss-card p-6">
                <div className="flex items-center">
                  <BarChart className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Durchschnittliche Genauigkeit</h3>
                    <p className="text-3xl font-bold text-green-600">{analytics.avg_accuracy}%</p>
                  </div>
                </div>
              </div>
              <div className="swiss-card p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Aktive Benutzer</h3>
                    <p className="text-3xl font-bold text-purple-600">{analytics.active_users}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Document Analytics and AI Tagging */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Batch Analysis Interface */}
          <div className="swiss-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Bot className="w-5 h-5 mr-2" />
              KI-Batch-Analyse
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dokumente für Analyse auswählen
                </label>
                <select 
                  multiple 
                  className="swiss-input h-32"
                  onChange={handleDocumentSelection}
                >
                  <option value="doc1">Bundesverfassung Art. 1-50</option>
                  <option value="doc2">ZGB Art. 1-20</option>
                  <option value="doc3">OR Art. 1-100</option>
                  <option value="doc4">StGB Art. 1-50</option>
                  <option value="doc5">Datenschutzgesetz</option>
                </select>
              </div>
              <button
                onClick={handleBatchAnalysis}
                disabled={selectedDocuments.length === 0 || isAnalyzing}
                className="swiss-button w-full flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <Bot className="w-4 h-4 animate-pulse" />
                    <span>Analysiere...</span>
                  </>
                ) : (
                  <>
                    <BarChart className="w-4 h-4" />
                    <span>Batch-Analyse starten ({selectedDocuments.length} Dokumente)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Tagging Interface */}
          <div className="swiss-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              KI-Verschlagwortung
            </h3>
            <AITaggingInterface onTagsGenerated={(tags) => console.log('Tags generated:', tags)} />
          </div>
        </div>

        {/* Legal Domain Distribution */}
        {analytics && (
          <div className="swiss-card p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              Rechtsgebiete Verteilung
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analytics.legal_domain_distribution).map(([domain, count]) => (
                <div key={domain} className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-slate-900">{count}</div>
                  <div className="text-sm text-slate-600">{domain}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Batch Analysis Results */}
        {batchAnalysisResults.length > 0 && (
          <div className="swiss-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Batch-Analyse Ergebnisse
            </h3>
            <div className="space-y-4">
              {batchAnalysisResults.map((result, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{result.document_title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{result.ai_summary}</p>
                    </div>
                    <div className="ml-4">
                      <span className="swiss-badge swiss-badge-green">
                        {result.confidence}% Vertrauen
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.ai_tags.map(tag => (
                      <span key={tag} className="swiss-badge swiss-badge-blue">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.legal_domains.map(domain => (
                      <span key={domain} className="swiss-badge swiss-badge-red">
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
