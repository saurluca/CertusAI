import React, { useState } from 'react';
import { Search, Filter, Bot } from 'lucide-react';
import SwissLegalCard from '../components/legal/SwissLegalCard';
import AIPromptImprovementInterface from '../components/prompt-improvement/AIPromptImprovementInterface';
import { useAppStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';

const SearchPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [showImprovement, setShowImprovement] = useState(false);
  const { searchResults, searchSimilarCases, isProcessing } = useAppStore();
  const { t } = useTranslation();

  const handleSearch = async () => {
    if (question.trim()) {
      await searchSimilarCases(question);
    }
  };

  const handleImprovedQuestion = (improvedQuestion: string) => {
    setQuestion(improvedQuestion);
    setShowImprovement(false);
  };

  const mockFilters = [
    { name: t('search.filters.federalConstitution'), count: 45, checked: false },
    { name: t('search.filters.federalLaws'), count: 1200, checked: false },
    { name: t('search.filters.ordinances'), count: 3400, checked: false },
    { name: t('search.filters.federalCourtDecisions'), count: 8900, checked: false },
  ];

  const mockDomains = [
    { name: 'ZGB', count: 2340, checked: false },
    { name: 'OR', count: 1890, checked: false },
    { name: 'StGB', count: 1456, checked: false },
    { name: 'DSG', count: 234, checked: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {t('search.title')}
          </h1>
          <p className="text-slate-600">
            {t('search.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="swiss-card p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                {t('search.filter')}
              </h3>
              
              {/* Document Types */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 mb-3">{t('search.documentTypes')}</h4>
                <div className="space-y-2">
                  {mockFilters.map((filter, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filter.checked}
                        className="text-swiss-red focus:ring-swiss-red rounded"
                      />
                      <span className="text-sm text-slate-600">{filter.name}</span>
                      <span className="text-xs text-slate-400">({filter.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Legal Domains */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 mb-3">{t('search.legalAreas')}</h4>
                <div className="space-y-2">
                  {mockDomains.map((domain, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={domain.checked}
                        className="text-swiss-red focus:ring-swiss-red rounded"
                      />
                      <span className="text-sm text-slate-600">{domain.name}</span>
                      <span className="text-xs text-slate-400">({domain.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">{t('search.timePeriod')}</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">{t('search.from')}</label>
                    <input
                      type="date"
                      className="swiss-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">{t('search.to')}</label>
                    <input
                      type="date"
                      className="swiss-input text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Interface */}
            <div className="swiss-card p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                🔍 {t('search.enterQuestion')}
              </h3>
              <div className="space-y-4">
                <textarea
                  className="swiss-textarea h-32"
                  placeholder={t('search.placeholder')}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={handleSearch}
                    disabled={isProcessing || !question.trim()}
                    className="swiss-button flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isProcessing ? t('search.searching') : t('search.search')}</span>
                  </button>
                  
                  <button
                    onClick={() => setShowImprovement(true)}
                    disabled={!question.trim()}
                    className="swiss-button-secondary flex items-center space-x-2"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{t('search.improveAI')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* AI Prompt Improvement */}
            {showImprovement && (
              <div className="mb-8">
                <AIPromptImprovementInterface
                  originalQuestion={question}
                  onImprovedQuestion={handleImprovedQuestion}
                  isLoading={isProcessing}
                />
              </div>
            )}

            {/* Search Results */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {t('search.results')} ({searchResults.length})
                </h2>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">{t('search.sortBy')}:</span>
                  <select className="swiss-input w-auto text-sm">
                    <option>{t('search.sortOptions.relevance')}</option>
                    <option>{t('search.sortOptions.date')}</option>
                    <option>{t('search.sortOptions.trustScore')}</option>
                    <option>{t('search.sortOptions.citations')}</option>
                  </select>
                </div>
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-6">
                  {searchResults.map((result) => (
                    <SwissLegalCard
                      key={result.id}
                      document={result}
                      onClick={() => console.log('Document clicked:', result.id)}
                    />
                  ))}
                  
                  {/* Pagination */}
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <button className="swiss-button-secondary">{t('search.previous')}</button>
                    <span className="px-4 py-2 text-sm text-slate-600">{t('search.pageOf').replace('{current}', '1').replace('{total}', '5')}</span>
                    <button className="swiss-button-secondary">{t('search.next')}</button>
                  </div>
                </div>
              ) : (
                <div className="swiss-card p-12 text-center">
                  {isProcessing ? (
                    <div className="space-y-4">
                      <div className="animate-pulse">
                        <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900">{t('search.searching')}</h3>
                      <p className="text-slate-600">{t('search.searchingDatabase')}</p>
                    </div>
                  ) : question ? (
                    <div className="space-y-4">
                      <Search className="w-12 h-12 text-slate-400 mx-auto" />
                      <h3 className="text-lg font-medium text-slate-900">{t('search.noResults')}</h3>
                      <p className="text-slate-600">
                        {t('search.noResultsDescription')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Search className="w-12 h-12 text-slate-400 mx-auto" />
                      <h3 className="text-lg font-medium text-slate-900">{t('search.readyForSearch')}</h3>
                      <p className="text-slate-600">
                        {t('search.readyForSearchDescription')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
